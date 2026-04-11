import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const schema = z.object({ opsiDipilih: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["warga"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);

  const voting = await prisma.voting.findUnique({ where: { id } });
  if (!voting) return jsonErr("Voting tidak ditemukan", 404);

  if (new Date() > voting.deadline) return jsonErr("Voting sudah berakhir", 400);

  // Scope check
  const rumah = await prisma.rumah.findUnique({ where: { id: u.rumahId! } });
  if (!rumah || rumah.rtId !== voting.rtId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const opsiValid = (voting.opsi as string[]).includes(body.opsiDipilih);
  if (!opsiValid) return jsonErr("Opsi tidak valid", 400);

  try {
    const record = await prisma.voteRecord.create({
      data: { votingId: id, userId: u.id, opsiDipilih: body.opsiDipilih },
    });
    return jsonOk(record, 201);
  } catch {
    return jsonErr("Anda sudah vote pada voting ini", 409);
  }
}
