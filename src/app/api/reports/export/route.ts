import { prisma } from "@/lib/prisma";
import { jsonErr, requireRole } from "@/lib/api-helpers";

function csvEscape(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const u = await requireRole(req, ["pengurus_rt"]).catch(() => null);
  if (!u?.rtId) return jsonErr("Forbidden", 403);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "tagihan";
  const periode = searchParams.get("periode");

  if (type === "tagihan") {
    const rows = await prisma.tagihan.findMany({
      where: { rtId: u.rtId, ...(periode ? { periode } : {}) },
      include: {
        rumah: true,
        jenisIuran: true,
      },
      orderBy: [{ periode: "desc" }, { rumah: { nomorRumah: "asc" } }],
    });
    const header = ["periode", "rumah", "iuran", "nominal", "status", "jatuh_tempo"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.periode,
          csvEscape(r.rumah.nomorRumah),
          csvEscape(r.jenisIuran.nama),
          r.nominal.toString(),
          r.status,
          r.jatuhTempo ? r.jatuhTempo.toISOString().slice(0, 10) : "",
        ].join(","),
      ),
    ];
    const body = lines.join("\n");
    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-tagihan-${u.rtId.slice(0, 8)}.csv"`,
      },
    });
  }

  if (type === "warga") {
    const rows = await prisma.user.findMany({
      where: { role: "warga", rumah: { rtId: u.rtId } },
      include: { rumah: { select: { nomorRumah: true } } },
    });
    const header = ["nama", "username", "status", "rumah"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          csvEscape(r.nama),
          csvEscape(r.username),
          r.status,
          csvEscape(r.rumah?.nomorRumah ?? ""),
        ].join(","),
      ),
    ];
    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="warga.csv"',
      },
    });
  }

  return jsonErr("Tipe export tidak dikenal", 400);
}
