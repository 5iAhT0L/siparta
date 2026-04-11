import { z } from "zod";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";
import { uploadDataUri } from "@/lib/cloudinary-server";

const schema = z.object({
  dataUrl: z.string().regex(/^data:/),
  folder: z.string().default("siparta/bukti"),
});

const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }
  if (u.role !== "warga" && u.role !== "pengurus_rt") {
    return jsonErr("Forbidden", 403);
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Gunakan data URL (base64) hasil file JPG/PNG/PDF", 400);
  }

  const approxBytes = (body.dataUrl.length * 3) / 4;
  if (approxBytes > MAX) {
    return jsonErr("File maksimal 5MB", 400);
  }

  try {
    const url = await uploadDataUri(body.dataUrl, body.folder);
    return jsonOk({ url });
  } catch (e) {
    return jsonErr(
      e instanceof Error ? e.message : "Upload gagal — periksa Cloudinary",
      502,
    );
  }
}
