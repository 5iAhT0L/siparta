import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt", "warga"]).catch(() => null);
  if (!u) return jsonErr("Forbidden", 403);

  let rtId: string | null = null;
  if (u.role === "pengurus_rt") rtId = u.rtId;
  if (u.role === "warga" && u.rumahId) {
    const r = await prisma.rumah.findUnique({ where: { id: u.rumahId } });
    rtId = r?.rtId ?? null;
  }
  if (!rtId) return jsonErr("Forbidden", 403);

  let settings = await prisma.rtSettings.findUnique({ where: { rtId } });
  if (!settings) {
    settings = await prisma.rtSettings.create({
      data: { rtId },
    });
  }

  if (u.role === "warga") {
    return jsonOk({
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      bankAccountName: settings.bankAccountName,
    });
  }

  return jsonOk(settings);
}

const putSchema = z.object({
  reminderOffsets: z.array(z.number()).optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
});

export async function PUT(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  let body: z.infer<typeof putSchema>;
  try {
    body = putSchema.parse(await req.json());
  } catch {
    return jsonErr("Data tidak valid", 400);
  }

  const row = await prisma.rtSettings.upsert({
    where: { rtId: u.rtId },
    create: {
      rtId: u.rtId,
      reminderOffsets: body.reminderOffsets ?? [3, 1, 0],
      bankName: body.bankName,
      bankAccountNumber: body.bankAccountNumber,
      bankAccountName: body.bankAccountName,
    },
    update: {
      reminderOffsets: body.reminderOffsets ?? undefined,
      bankName: body.bankName,
      bankAccountNumber: body.bankAccountNumber,
      bankAccountName: body.bankAccountName,
    },
  });
  return jsonOk(row);
}
