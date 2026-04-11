import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

const schema = z.object({
  catatan: z.string().min(1),
});

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Catatan wajib", 400);
  }

  const pay = await prisma.pembayaran.findFirst({
    where: { id, tagihan: { rtId: u.rtId } },
  });
  if (!pay) return jsonErr("Tidak ditemukan", 404);
  if (pay.status !== "pending") return jsonErr("Status tidak pending", 400);

  await prisma.$transaction(async (tx) => {
    await tx.pembayaran.update({
      where: { id },
      data: {
        status: "need_resubmit",
        verifiedById: u.id,
        verifiedAt: new Date(),
        catatan: body.catatan,
      },
    });
    await tx.pembayaranVerificationAudit.create({
      data: {
        pembayaranId: id,
        actorId: u.id,
        action: "need_resubmit",
        note: body.catatan,
      },
    });
  });

  return jsonOk({ ok: true });
}
