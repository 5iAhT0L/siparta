import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { notifyRtPengurus } from "@/lib/notifications";
import { jsonErr, jsonOk } from "@/lib/api-helpers";

const schema = z.object({
  rtId:               z.string().uuid(),
  rumahId:            z.string().uuid().optional(),       // rumah sudah ada
  nomorRumah:         z.string().min(1).max(20).optional(), // rumah baru
  tipeHunian:         z.enum(["milik", "kontrak"]).default("milik"),
  kontak:             z.string().max(100).optional(),     // opsional, untuk rumah baru
  noKk:               z.string().regex(/^\d{16}$/, "No. KK harus 16 digit"),
  namaKepalaKeluarga: z.string().min(2).max(200),
  nama:               z.string().min(2).max(200),
  username:           z.string().min(3).max(100),
  noKtp:              z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
  password:           z.string().min(8),
}).refine(d => d.rumahId || d.nomorRumah, { message: "Pilih rumah atau isi nomor rumah baru" });

export async function POST(req: Request) {
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Data tidak valid";
    return jsonErr(String(msg ?? "Data tidak valid"), 400);
  }

  const rt = await prisma.rt.findUnique({ where: { id: data.rtId } });
  if (!rt) return jsonErr("RT tidak ditemukan", 400);

  const existsUser = await prisma.user.findFirst({
    where: { OR: [{ username: data.username }, { noKtp: data.noKtp }] },
  });
  if (existsUser) return jsonErr("Username atau NIK sudah terdaftar", 409);

  // Cek no KK tidak duplikat (di pending maupun yang sudah terdaftar)
  const existsKk = await prisma.kartuKeluarga.findFirst({ where: { noKk: data.noKk } });
  if (existsKk) return jsonErr("No. KK sudah terdaftar", 409);

  const pendingKk = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint as count FROM users WHERE pending_no_kk = ${data.noKk}
  `;
  if (Number(pendingKk[0]?.count) > 0) return jsonErr("No. KK sudah digunakan oleh pendaftar lain", 409);

  const passwordHash = await hashPassword(data.password);

  if (data.rumahId) {
    // ── Rumah sudah ada: simpan pending_rumah_id, KK dibuat saat diaktifkan ──
    const rumah = await prisma.rumah.findFirst({ where: { id: data.rumahId, rtId: data.rtId } });
    if (!rumah) return jsonErr("Rumah tidak ditemukan di RT ini", 400);

    await prisma.$executeRaw`
      INSERT INTO users (id, username, no_ktp, password_hash, role, status, nama, rt_id,
                         pending_rumah_id, pending_no_kk, pending_nama_kk, updated_at)
      VALUES (gen_random_uuid(), ${data.username}, ${data.noKtp}, ${passwordHash},
              'warga', 'tidak_aktif', ${data.nama}, ${data.rtId}::uuid,
              ${data.rumahId}::uuid, ${data.noKk}, ${data.namaKepalaKeluarga}, now())
    `;

    await notifyRtPengurus(data.rtId, "Pendaftaran warga baru",
      `${data.nama} mendaftar untuk rumah ${rumah.nomorRumah}.`, "/dashboard/rt/warga").catch(() => {});

  } else {
    // ── Rumah baru: simpan semua pending, dibuat saat diaktifkan ──
    const kontak = data.kontak?.trim() || null;

    await prisma.$executeRaw`
      INSERT INTO users (id, username, no_ktp, password_hash, role, status, nama, rt_id,
                         pending_nomor_rumah, pending_tipe_hunian, pending_kontak,
                         pending_no_kk, pending_nama_kk, updated_at)
      VALUES (gen_random_uuid(), ${data.username}, ${data.noKtp}, ${passwordHash},
              'warga', 'tidak_aktif', ${data.nama}, ${data.rtId}::uuid,
              ${data.nomorRumah}, ${data.tipeHunian}, ${kontak},
              ${data.noKk}, ${data.namaKepalaKeluarga}, now())
    `;

    await notifyRtPengurus(data.rtId, "Pendaftaran warga baru (rumah baru)",
      `${data.nama} mendaftar dengan rumah baru No. ${data.nomorRumah}.`, "/dashboard/rt/warga").catch(() => {});
  }

  return jsonOk({
    message: "Registrasi berhasil. Akun Anda menunggu verifikasi pengurus RT sebelum dapat login.",
  });
}
