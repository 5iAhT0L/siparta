import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);
  const { id } = await ctx.params;

  // Gunakan raw query agar kompatibel dengan Prisma client yang belum di-generate ulang
  type PendingUser = {
    id: string;
    rumah_id: string | null;
    kartu_keluarga_id: string | null;
    pending_rumah_id: string | null;
    pending_nomor_rumah: string | null;
    pending_tipe_hunian: string | null;
    pending_kontak: string | null;
    pending_no_kk: string | null;
    pending_nama_kk: string | null;
  };

  const rows = await prisma.$queryRaw<PendingUser[]>`
    SELECT id, rumah_id, kartu_keluarga_id,
           pending_rumah_id, pending_nomor_rumah, pending_tipe_hunian, pending_kontak,
           pending_no_kk, pending_nama_kk
    FROM users
    WHERE id = ${id}::uuid
      AND role = 'warga'
      AND status = 'tidak_aktif'
      AND rt_id = ${u.rtId}::uuid
  `;
  const target = rows[0];
  if (!target) return jsonErr("Tidak ditemukan", 404);

  await prisma.$transaction(async (tx) => {
    let rumahId = target.rumah_id;
    let kkId    = target.kartu_keluarga_id;

    // Buat rumah & KK dari data pending
    if (!kkId) {
      if (target.pending_nomor_rumah) {
        // Rumah baru — cari atau buat
        let rumah = await tx.rumah.findFirst({
          where: { nomorRumah: target.pending_nomor_rumah, rtId: u.rtId! },
        });
        if (!rumah) {
          rumah = await tx.rumah.create({
            data: {
              rtId: u.rtId!,
              nomorRumah: target.pending_nomor_rumah,
              tipeHunian: (target.pending_tipe_hunian ?? "milik") as "milik" | "kontrak",
              kontak: target.pending_kontak ?? undefined,
              status: "aktif",
            },
          });
        }
        rumahId = rumah.id;
      } else if (target.pending_rumah_id) {
        // Rumah lama
        rumahId = target.pending_rumah_id;
      }

      if (rumahId && target.pending_no_kk && target.pending_nama_kk) {
        const kk = await tx.kartuKeluarga.create({
          data: {
            rumahId,
            noKk: target.pending_no_kk,
            namaKepalaKeluarga: target.pending_nama_kk,
          },
        });
        kkId = kk.id;
      }
    }

    if (!rumahId || !kkId) throw new Error("Data pendaftaran tidak lengkap");

    await tx.$executeRaw`
      UPDATE users SET
        status              = 'aktif',
        rumah_id            = ${rumahId}::uuid,
        kartu_keluarga_id   = ${kkId}::uuid,
        pending_rumah_id    = NULL,
        pending_nomor_rumah = NULL,
        pending_tipe_hunian = NULL,
        pending_kontak      = NULL,
        pending_no_kk       = NULL,
        pending_nama_kk     = NULL
      WHERE id = ${id}::uuid
    `;
  });

  return jsonOk({ ok: true });
}
