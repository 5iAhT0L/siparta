import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { approvePembayaranTx } from "@/lib/pembayaran-service";

const schema = z.object({
  catatan: z.string().optional(),
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
    body = schema.parse(await req.json().catch(() => ({})));
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const pay = await prisma.pembayaran.findFirst({
    where: { id, tagihan: { rtId: u.rtId } },
  });
  if (!pay) return jsonErr("Tidak ditemukan", 404);
  if (pay.status !== "pending") return jsonErr("Status pembayaran tidak pending", 400);

  try {
    await prisma.$transaction(async (tx) => {
      await approvePembayaranTx(tx, id, u.id, body.catatan);
    });
  } catch (e) {
    return jsonErr(e instanceof Error ? e.message : "Gagal", 400);
  }

  return jsonOk({ ok: true });
}
