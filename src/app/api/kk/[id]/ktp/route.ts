import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { uploadDataUri } from "@/lib/cloudinary-server";

const MAX = 1 * 1024 * 1024; // 1 MB (sudah dikompres client-side)

async function resolveKk(kkId: string, rtId: string) {
  return prisma.kartuKeluarga.findFirst({
    where: { id: kkId, rumah: { rtId } },
  });
}

/** GET — list semua foto KTP milik KK ini */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rt"]);
    const { id } = await params;
    const kk = await resolveKk(id, u.rtId!);
    if (!kk) return jsonErr("KK tidak ditemukan", 404);
    const list = await prisma.fotoKtp.findMany({
      where: { kartuKeluargaId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, url: true, createdAt: true },
    });
    return jsonOk(list);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Error", err.status ?? 500);
  }
}

/** POST — upload foto KTP baru */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireRole(req, ["pengurus_rt"]);
    const { id } = await params;
    const kk = await resolveKk(id, u.rtId!);
    if (!kk) return jsonErr("KK tidak ditemukan", 404);

    const { dataUrl } = await req.json().catch(() => ({})) as { dataUrl?: string };
    if (!dataUrl?.startsWith("data:")) return jsonErr("Gunakan data URL (base64)", 400);

    const approxBytes = (dataUrl.length * 3) / 4;
    if (approxBytes > MAX) return jsonErr("File melebihi 1 MB setelah kompresi", 400);

    const url = await uploadDataUri(dataUrl, "siparta/foto-ktp");
    const foto = await prisma.fotoKtp.create({
      data: { kartuKeluargaId: id, url },
      select: { id: true, url: true, createdAt: true },
    });
    return jsonOk(foto, 201);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return jsonErr(err.message ?? "Upload gagal", err.status ?? 500);
  }
}
