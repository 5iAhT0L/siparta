import { prisma } from "@/lib/prisma";

export async function notifyRtPengurus(rtId: string, title: string, body: string, link?: string) {
  const admins = await prisma.user.findMany({
    where: { role: "pengurus_rt", rtId, status: "aktif" },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      title,
      body,
      type: "rt",
      link: link ?? null,
    })),
  });
}
