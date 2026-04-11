import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; kontrak_id: string }> },
) {
  const { id, kontrak_id } = await params;
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const rumah = await prisma.rumah.findFirst({ where: { id, rtId: u.rtId } });
  if (!rumah) return jsonErr("Rumah tidak ditemukan", 404);

  const kontrak = await prisma.kontrakRumah.findFirst({
    where: { id: kontrak_id, rumahId: id, status: "aktif" },
  });
  if (!kontrak) return jsonErr("Kontrak aktif tidak ditemukan", 404);

  const body = await req.json().catch(() => ({}));
  if (!body.confirm) {
    return jsonErr(
      "Konfirmasi diperlukan. Kirim { confirm: true } untuk melanjutkan. Aksi ini akan menghapus semua KK dan akun warga di rumah ini.",
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    // Mark contract as ended
    await tx.kontrakRumah.update({
      where: { id: kontrak_id },
      data: { status: "selesai" },
    });
    // Delete warga accounts linked to this house
    await tx.user.deleteMany({ where: { rumahId: id } });
    // Delete KK linked to this house
    await tx.kartuKeluarga.deleteMany({ where: { rumahId: id } });
    // Deactivate house
    await tx.rumah.update({ where: { id }, data: { status: "tidak_aktif" } });
  });

  return jsonOk({ success: true, message: "Kontrak diakhiri. Rumah dinonaktifkan, KK dan akun warga dihapus. Riwayat tagihan tetap tersimpan." });
}
