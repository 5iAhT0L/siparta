import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { uploadDataUri, deleteByUrl } from "@/lib/cloudinary-server";

const MAX = 5 * 1024 * 1024;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rt"]);
    const { id } = await params;

    // Validasi KK milik RT ini
    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id },
      include: { rumah: { select: { rtId: true } } },
    });
    if (!kk) return jsonErr("KK tidak ditemukan", 404);
    if (kk.rumah.rtId !== u.rtId) return jsonErr("Forbidden", 403);

    const { dataUrl } = await req.json().catch(() => ({})) as { dataUrl?: string };
    if (!dataUrl?.startsWith("data:")) return jsonErr("Gunakan data URL (base64)", 400);

    const approxBytes = (dataUrl.length * 3) / 4;
    if (approxBytes > MAX) return jsonErr("File maksimal 5MB", 400);

    const oldUrl = kk.fotoKkUrl;
    const url = await uploadDataUri(dataUrl, "siparta/foto-kk");

    const updated = await prisma.kartuKeluarga.update({
      where: { id },
      data: { fotoKkUrl: url },
      select: { id: true, fotoKkUrl: true },
    });

    // Hapus foto lama dari Cloudinary setelah upload baru berhasil
    if (oldUrl) await deleteByUrl(oldUrl);

    return jsonOk(updated);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Upload gagal", err.status ?? 500);
  }
}

/** DELETE — hapus foto KK */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rt"]);
    const { id } = await params;

    const kk = await prisma.kartuKeluarga.findUnique({
      where: { id },
      include: { rumah: { select: { rtId: true } } },
    });
    if (!kk) return jsonErr("KK tidak ditemukan", 404);
    if (kk.rumah.rtId !== u.rtId) return jsonErr("Forbidden", 403);

    const oldUrl = kk.fotoKkUrl;
    await prisma.kartuKeluarga.update({ where: { id }, data: { fotoKkUrl: null } });
    if (oldUrl) await deleteByUrl(oldUrl);
    return jsonOk({ ok: true });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}
