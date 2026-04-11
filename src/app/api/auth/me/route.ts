import { prisma } from "@/lib/prisma";
import { getAccessPayload, jsonErr, jsonOk } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const payload = await getAccessPayload(req);
  if (!payload) return jsonErr("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      username: true,
      nama: true,
      role: true,
      status: true,
      rtId: true,
      rwId: true,
      rumahId: true,
      noKtp: true,
    },
  });
  if (!user) return jsonErr("Unauthorized", 401);

  return jsonOk({ user });
}
