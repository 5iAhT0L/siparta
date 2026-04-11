import { v2 as cloudinary } from "cloudinary";

export function ensureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary env belum lengkap");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadDataUri(dataUri: string, folder: string): Promise<string> {
  ensureCloudinary();
  const res = await cloudinary.uploader.upload(dataUri, { folder, resource_type: "auto" });
  return res.secure_url;
}

/** Hapus asset dari Cloudinary berdasarkan URL (best-effort, tidak throw jika gagal) */
export async function deleteByUrl(url: string): Promise<void> {
  try {
    ensureCloudinary();
    // URL format: .../upload/v{version}/{public_id}.{ext}
    // public_id bisa multi-segment: siparta/foto-kk/abc123
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) return;
    const publicId = match[1];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // best-effort
  }
}
