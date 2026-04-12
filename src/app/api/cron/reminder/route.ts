import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk } from "@/lib/api-helpers";

/** Vercel Cron — Story 1.6 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonErr("Unauthorized", 401);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const settingsList = await prisma.rtSettings.findMany({
    include: { rt: true },
  });

  let notifications = 0;

  for (const s of settingsList) {
    const offsets = (s.reminderOffsets as number[]) ?? [3, 1, 0];
    const openTagihan = await prisma.tagihan.findMany({
      where: {
        rtId: s.rtId,
        status: "belum_bayar",
        jatuhTempo: { not: null },
      },
      include: {
        rumah: { include: { users: { where: { role: "warga", status: "aktif" } } } },
        jenisIuran: true,
      },
    });

    for (const t of openTagihan) {
      if (!t.jatuhTempo) continue;
      const due = new Date(t.jatuhTempo);
      due.setHours(0, 0, 0, 0);
      const daysLeft = differenceInCalendarDays(due, today);
      if (!offsets.includes(daysLeft)) continue;

      const userIds = t.rumah.users.map((u) => u.id);
      if (userIds.length === 0) continue;

      const title = `Reminder: ${t.jenisIuran.nama}`;
      const body = `Jatuh tempo ${due.toLocaleDateString("id-ID")}. Nominal Rp ${t.nominal.toString()}.`;
      await prisma.notification.createMany({
        data: userIds.map((uid) => ({
          userId: uid,
          title,
          body,
          type: "reminder",
          link: "/dashboard/warga",
        })),
      });
      notifications += userIds.length;
    }
  }

  return jsonOk({ ok: true, notificationsSent: notifications });
}
