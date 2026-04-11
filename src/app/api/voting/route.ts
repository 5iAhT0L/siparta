import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  let rtId: string | null = null;
  if (u.role === "pengurus_rt") rtId = u.rtId;
  else if (u.role === "warga" && u.rumahId) {
    const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    rtId = rumah?.rtId ?? null;
  }
  if (!rtId) return jsonOk([]);

  const list = await prisma.voting.findMany({
    where: { rtId },
    orderBy: { deadline: "desc" },
    include: {
      createdBy: { select: { nama: true } },
      _count: { select: { records: true } },
    },
  });

  // Attach user's own vote for warga
  if (u.role === "warga") {
    const myVotes = await prisma.voteRecord.findMany({
      where: { userId: u.id },
      select: { votingId: true, opsiDipilih: true },
    });
    const voteMap = Object.fromEntries(myVotes.map((v) => [v.votingId, v.opsiDipilih]));
    return jsonOk(list.map((v) => ({ ...v, myVote: voteMap[v.id] ?? null })));
  }

  return jsonOk(list);
}

const createSchema = z.object({
  pertanyaan: z.string().min(1),
  opsi: z.array(z.string().min(1)).min(2),
  deadline: z.string(),
  showResultAfterDeadline: z.boolean().optional(),
});

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const voting = await prisma.voting.create({
    data: {
      rtId: u.rtId,
      createdById: u.id,
      pertanyaan: body.pertanyaan,
      opsi: body.opsi,
      deadline: new Date(body.deadline),
      showResultAfterDeadline: body.showResultAfterDeadline ?? false,
    },
  });
  return jsonOk(voting, 201);
}
