"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

type TagihanRow = {
  id: string;
  periode?: string;
  status?: string;
  nominal: unknown;
  jenisIuran?: { nama: string };
  rumah?: { nomorRumah: string; kk?: { namaKepalaKeluarga: string }[] };
};

type PengumumanRow = {
  id: string;
  title: string;
  content: string;
  postedAt: string;
  createdBy?: { nama: string };
};

type Summary = {
  totalTagihan?: number;
  lunas?: number;
  belum?: number;
  totalPemasukan?: number;
};

type RwData = {
  rts: { rtId: string; nama: string; compliance: number; lunas: number; belum: number; totalPemasukan: number }[];
};

const STATUS_BADGE: Record<string, string> = {
  lunas:       "badge badge-green",
  pending:     "badge badge-yellow",
  belum_bayar: "badge badge-red",
};
const STATUS_LABEL: Record<string, string> = {
  lunas: "Lunas", pending: "Menunggu", belum_bayar: "Belum Bayar",
};

export default function DashboardPage() {
  const { user, apiFetch } = useAuth();
  const [summary, setSummary]       = useState<Summary | null>(null);
  const [tagihan, setTagihan]       = useState<TagihanRow[]>([]);
  const [pengumuman, setPengumuman] = useState<PengumumanRow[]>([]);
  const [rwData, setRwData]         = useState<RwData | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const anm = apiFetch("/api/announcements").then(r => r.json()).then(d => {
        setPengumuman(Array.isArray(d) ? d.slice(0, 3) : []);
      });

      if (user.role === "pengurus_rw") {
        const mon = apiFetch("/api/pengurus-rw/dashboard").then(r => r.json()).then(d => {
          if (!d.error) setRwData(d);
        });
        await Promise.all([anm, mon]);
        return;
      }

      const [, sum, tag] = await Promise.all([
        anm,
        apiFetch("/api/reports/iuran-summary").then(r => r.json()),
        apiFetch("/api/iuran/tagihan").then(r => r.json()),
      ]);
      if (!sum.error) setSummary(sum);
      setTagihan(Array.isArray(tag) ? tag : []);
    })();
  }, [user, apiFetch]);

  if (!user) return null;

  /* ── RW view ── */
  if (user.role === "pengurus_rw") {
    return (
      <div className="px-4 py-5 max-w-3xl mx-auto">
        <h1 className="page-title mb-1">Selamat datang, {user.nama}</h1>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Dashboard Pengurus RW</p>

        {rwData && (
          <div className="space-y-3">
            {rwData.rts.map(rt => (
              <Link key={rt.rtId} href="/dashboard/rw"
                className="card flex items-center justify-between gap-4 hover:border-emerald-300 block"
                style={{ textDecoration: "none" }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{rt.nama}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Lunas {rt.lunas} · Belum {rt.belum} · Rp {rt.totalPemasukan.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold" style={{ color: rt.compliance >= 90 ? "var(--primary)" : rt.compliance >= 70 ? "var(--warning)" : "var(--danger)" }}>
                    {rt.compliance}%
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-subtle)" }}>compliance</div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <AnnouncementSection items={pengumuman} />
      </div>
    );
  }

  const openTagihan = tagihan.filter(t => t.status === "belum_bayar");
  const pendingTagihan = tagihan.filter(t => t.status === "pending");

  /* ── RT view ── */
  if (user.role === "pengurus_rt") {
    return (
      <div className="px-4 py-5 max-w-4xl mx-auto">
        <h1 className="page-title mb-1">Halo, {user.nama}</h1>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Dashboard Pengurus RT</p>

        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
            <StatCard label="Total Tagihan" value={summary.totalTagihan ?? 0} />
            <StatCard label="Lunas" value={summary.lunas ?? 0} green />
            <StatCard label="Belum Bayar" value={summary.belum ?? 0} red />
            <StatCard label="Pemasukan" value={`Rp ${Number(summary.totalPemasukan ?? 0).toLocaleString("id-ID")}`} green />
          </div>
        )}

        {pendingTagihan.length > 0 && (
          <div className="mb-4 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "#fef9c3", border: "1.5px solid #fde047" }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: "#854d0e" }}>
                {pendingTagihan.length} pembayaran menunggu verifikasi
              </div>
              <div className="text-xs" style={{ color: "#92400e" }}>Segera tinjau dan setujui</div>
            </div>
            <Link href="/dashboard/rt/pembayaran" className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>
              Tinjau
            </Link>
          </div>
        )}

        <SectionHeader title="Tagihan Bulan Ini" href="/dashboard/rt/tagihan" linkLabel="Lihat semua" />
        <div className="card mb-5 p-0 overflow-hidden">
          {tagihan.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>Belum ada tagihan bulan ini.</div>
          ) : (
            <>
              {/* Desktop: tabel */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr><th>Rumah</th><th>Nama</th><th>Iuran</th><th>Nominal</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {tagihan.slice(0, 8).map(t => (
                      <tr key={t.id}>
                        <td className="font-medium">{t.rumah?.nomorRumah}</td>
                        <td style={{ color: "var(--text-muted)" }}>{t.rumah?.kk?.[0]?.namaKepalaKeluarga ?? "—"}</td>
                        <td style={{ color: "var(--text-muted)" }}>{t.jenisIuran?.nama}</td>
                        <td>Rp {Number(t.nominal).toLocaleString("id-ID")}</td>
                        <td>
                          <span className={STATUS_BADGE[t.status ?? ""] ?? "badge badge-gray"}>
                            {STATUS_LABEL[t.status ?? ""] ?? t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile: card list */}
              <div className="sm:hidden divide-y" style={{ borderColor: "var(--border-muted)" }}>
                {tagihan.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                          No. {t.rumah?.nomorRumah}
                        </span>
                        <span className={STATUS_BADGE[t.status ?? ""] ?? "badge badge-gray"} style={{ fontSize: "0.65rem" }}>
                          {STATUS_LABEL[t.status ?? ""] ?? t.status}
                        </span>
                      </div>
                      {t.rumah?.kk?.[0]?.namaKepalaKeluarga && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                          {t.rumah.kk[0].namaKepalaKeluarga}
                        </div>
                      )}
                      <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-subtle)" }}>
                        {t.jenisIuran?.nama}
                      </div>
                    </div>
                    <div className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--text)" }}>
                      Rp {Number(t.nominal).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <AnnouncementSection items={pengumuman} manageHref="/dashboard/rt/pengumuman" />
      </div>
    );
  }

  /* ── Warga view ── */
  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h1 className="page-title mb-1">Halo, {user.nama}</h1>
      <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Portal Warga</p>

      {openTagihan.length > 0 && (
        <div className="mb-4 rounded-xl px-4 py-3"
          style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
          <div className="text-sm font-semibold mb-2" style={{ color: "#991b1b" }}>
            {openTagihan.length} tagihan belum dibayar
          </div>
          <div className="space-y-2">
            {openTagihan.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span style={{ color: "#7f1d1d" }}>{t.jenisIuran?.nama} · {t.periode}</span>
                <span className="font-semibold" style={{ color: "var(--danger)" }}>
                  Rp {Number(t.nominal).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/warga/tagihan"
            className="mt-3 block text-center rounded-lg py-2 text-sm font-semibold"
            style={{ background: "var(--danger)", color: "#fff" }}>
            Bayar Sekarang
          </Link>
        </div>
      )}

      {pendingTagihan.length > 0 && (
        <div className="mb-4 rounded-xl px-4 py-3"
          style={{ background: "#fef9c3", border: "1.5px solid #fde047" }}>
          <div className="text-sm font-semibold" style={{ color: "#854d0e" }}>
            {pendingTagihan.length} pembayaran sedang diverifikasi
          </div>
          <div className="text-xs mt-0.5" style={{ color: "#92400e" }}>Tunggu konfirmasi dari Pengurus RT</div>
        </div>
      )}

      {openTagihan.length === 0 && pendingTagihan.length === 0 && summary && (
        <div className="mb-5 card-green text-center py-5">
          <div className="text-3xl mb-1">✓</div>
          <div className="font-semibold text-sm" style={{ color: "var(--primary)" }}>Semua iuran lunas!</div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Terima kasih telah membayar tepat waktu.</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link href="/dashboard/warga/tagihan"
          className="card flex flex-col gap-1 hover:border-emerald-300">
          <div className="text-xs font-semibold" style={{ color: "var(--text-subtle)" }}>TAGIHAN</div>
          <div className="text-xl font-bold" style={{ color: "var(--text)" }}>{tagihan.length}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>total tagihan</div>
        </Link>
        <Link href="/dashboard/warga/history"
          className="card flex flex-col gap-1 hover:border-emerald-300">
          <div className="text-xs font-semibold" style={{ color: "var(--text-subtle)" }}>RIWAYAT</div>
          <div className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {tagihan.filter(t => t.status === "lunas").length}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>sudah lunas</div>
        </Link>
      </div>

      <AnnouncementSection items={pengumuman} />
    </div>
  );
}

/* ── Sub-components ── */
function StatCard({ label, value, green, red }: { label: string; value: string | number; green?: boolean; red?: boolean }) {
  return (
    <div className={`stat-card${green ? " green" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{
        ...(red ? { color: "var(--danger)" } : green ? { color: "var(--primary)" } : {}),
        fontSize: typeof value === "string" && value.length > 12 ? "0.85rem" : undefined,
        wordBreak: "break-all",
      }}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h2>
      {href && <Link href={href} className="text-xs font-medium" style={{ color: "var(--primary)" }}>{linkLabel}</Link>}
    </div>
  );
}

function AnnouncementSection({ items, manageHref }: { items: PengumumanRow[]; manageHref?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-5">
      <SectionHeader title="Pengumuman" href={manageHref} linkLabel="Kelola" />
      <div className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="card">
            <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{p.title}</div>
            <div className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>{p.content}</div>
            <div className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>
              {new Date(p.postedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              {p.createdBy?.nama && ` · ${p.createdBy.nama}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
