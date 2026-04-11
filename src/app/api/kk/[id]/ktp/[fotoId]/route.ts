import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { deleteByUrl } from "@/lib/cloudinary-server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; fotoId: string }> },
) {
  try {
    const u = await requireRole(req, ["pengurus_rt"]);
    const { id, fotoId } = await params;

    const foto = await prisma.fotoKtp.findFirst({
      where: { id: fotoId, kartuKeluargaId: id },
      include: { kk: { include: { rumah: { select: { rtId: true } } } } },
    });
    if (!foto) return jsonErr("Foto tidak ditemukan", 404);
    if (foto.kk.rumah.rtId !== u.rtId) return jsonErr("Forbidden", 403);

    await prisma.fotoKtp.delete({ where: { id: fotoId } });
    await deleteByUrl(foto.url);
    return jsonOk({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
