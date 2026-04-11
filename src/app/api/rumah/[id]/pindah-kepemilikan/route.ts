import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const rumah = await prisma.rumah.findFirst({
    where: { id, rtId: u.rtId },
    include: { kk: true, users: true },
  });
  if (!rumah) return jsonErr("Rumah tidak ditemukan", 404);
  if (rumah.tipeHunian !== "milik") {
    return jsonErr("Pindah kepemilikan hanya untuk rumah tipe milik", 400);
  }

  const body = await req.json().catch(() => ({}));
  if (!body.confirm) {
    return jsonErr(
      "Konfirmasi diperlukan. Kirim { confirm: true } untuk melanjutkan.",
      400,
    );
  }

  // Delete all warga accounts linked to this house
  await prisma.user.deleteMany({ where: { rumahId: id } });
  // Delete all KK linked to this house
  await prisma.kartuKeluarga.deleteMany({ where: { rumahId: id } });

  // Rumah stays aktif (rumah bukan KK/user yang pindah)
  return jsonOk({ success: true, message: "Data KK dan akun warga lama telah dihapus. Rumah tetap aktif." });
}
