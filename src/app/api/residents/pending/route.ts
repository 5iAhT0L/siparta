import { prisma } from "@/lib/prisma";
import { jsonErr, jsonOk, requireRole } from "@/lib/api-helpers";

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const list = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT
      u.id, u.nama, u.username, u.no_ktp AS "noKtp", u.status,
      u.created_at AS "createdAt",
      r.nomor_rumah  AS "nomorRumah",
      u.pending_rumah_id    AS "pendingRumahId",
      u.pending_nomor_rumah AS "pendingNomorRumah",
      u.pending_tipe_hunian AS "pendingTipeHunian",
      u.pending_kontak      AS "pendingKontak",
      u.pending_no_kk       AS "pendingNoKk",
      u.pending_nama_kk     AS "pendingNamaKk",
      pr.nomor_rumah        AS "pendingRumahNomor"
    FROM users u
    LEFT JOIN rumah r  ON r.id = u.rumah_id
    LEFT JOIN rumah pr ON pr.id = u.pending_rumah_id
    WHERE u.role = 'warga'
      AND u.status = 'tidak_aktif'
      AND u.rt_id = ${u.rtId}::uuid
    ORDER BY u.created_at ASC
  `;

  return jsonOk(list);
}
