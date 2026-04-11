import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let u;
  try { u = await requireAuth(req); } catch { return jsonErr("Unauthorized", 401); }

  const tagihan = await prisma.tagihan.findUnique({
    where: { id },
    include: {
      jenisIuran: true,
      rumah: { select: { nomorRumah: true, rtId: true } },
      pembayaran: {
        orderBy: { submittedAt: "desc" },
        include: { submittedBy: { select: { nama: true } } },
      },
    },
  });

  if (!tagihan) return jsonErr("Tagihan tidak ditemukan", 404);
  if (u.role === "warga" && (!u.rumahId || tagihan.rumahId !== u.rumahId)) return jsonErr("Forbidden", 403);
  if (u.role === "pengurus_rt" && (!u.rtId || tagihan.rumah.rtId !== u.rtId)) return jsonErr("Forbidden", 403);

  return jsonOk(tagihan);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let u;
  try { u = await requireAuth(req); } catch { return jsonErr("Unauthorized", 401); }
  if (u.role !== "pengurus_rt") return jsonErr("Forbidden", 403);

  const tagihan = await prisma.tagihan.findUnique({
    where: { id },
    include: { rumah: { select: { rtId: true } } },
  });
  if (!tagihan) return jsonErr("Tagihan tidak ditemukan", 404);
  if (tagihan.rumah.rtId !== u.rtId) return jsonErr("Forbidden", 403);
  if (tagihan.status === "lunas") return jsonErr("Tagihan yang sudah lunas tidak dapat dihapus", 409);

  await prisma.tagihan.delete({ where: { id } });
  return jsonOk({ ok: true });
}
