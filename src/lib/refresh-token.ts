import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(userId: string, rawToken: string, days = 7) {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findValidRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row || row.revokedAt || row.expiresAt < new Date()) return null;
  return row;
}

export async function revokeRefreshTokenByHash(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeRefreshTokenById(id: string) {
  await prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}
