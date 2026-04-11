import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireAuth } from "@/lib/api-helpers";

export async function GET(req: Request) {
  let u;
  try {
    u = await requireAuth(req);
  } catch {
    return jsonErr("Unauthorized", 401);
  }

  const list = await prisma.notification.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return jsonOk(list);
}
