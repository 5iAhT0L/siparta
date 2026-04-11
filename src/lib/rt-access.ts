import type { SessionUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export function assertPengurusRt(user: SessionUser, rtId: string) {
  if (user.role !== "pengurus_rt" || user.rtId !== rtId) {
    const e = new Error("Forbidden");
    (e as Error & { status: number }).status = 403;
    throw e;
  }
}

export async function assertRwCanReadRt(user: SessionUser, rtId: string) {
  if (user.role !== "pengurus_rw" || !user.rwId) {
    const e = new Error("Forbidden");
    (e as Error & { status: number }).status = 403;
    throw e;
  }
  const rt = await prisma.rt.findFirst({
    where: { id: rtId, rwId: user.rwId },
  });
  if (!rt) {
    const e = new Error("Forbidden");
    (e as Error & { status: number }).status = 403;
    throw e;
  }
}

export function assertWargaRumah(user: SessionUser, rumahId: string) {
  if (user.role !== "warga" || user.rumahId !== rumahId) {
    const e = new Error("Forbidden");
    (e as Error & { status: number }).status = 403;
    throw e;
  }
}
