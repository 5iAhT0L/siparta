import { z } from "zod";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";
import { generateTagihanBulanan, generateTagihanInsidental } from "@/lib/tagihan-gen";

const schema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("bulanan"), periode: z.string().regex(/^\d{4}-\d{2}$/) }),
  z.object({ mode: z.literal("insidental"), iuranId: z.string().uuid() }),
]);

export async function POST(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u || !u.rtId) return jsonErr("Forbidden", 403);
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return jsonErr("Payload tidak valid", 400);
  }
  try {
    if (body.mode === "bulanan") {
      const r = await generateTagihanBulanan(u.rtId, body.periode);
      return jsonOk(r);
    }
    const r = await generateTagihanInsidental(u.rtId, body.iuranId);
    return jsonOk(r);
  } catch (e) {
    return jsonErr(e instanceof Error ? e.message : "Gagal generate", 400);
  }
}
