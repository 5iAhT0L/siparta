"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, StatusBadge, PageHeader } from "@/lib/ui";

type Row = { id: string; status: string; nominal: number; jenisIuran: { nama: string }; rumah: { nomorRumah: string; kk: { namaKepalaKeluarga: string }[] } };

export default function LaporanPage() {
  const { user, loading, apiFetch } = useAuth();
  const [rows, setRows]     = useState<Row[]>([]);
  const [periode, setPeriode] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });

  const load = async () => { const d = await apiFetch(`/api/reports/warga-status?periode=${periode}`).then(r => r.json()); setRows(Array.isArray(d.tagihan) ? d.tagihan : []); };
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading, periode]);

  async function exportCsv() {
    const res = await apiFetch(`/api/reports/export?type=tagihan&periode=${periode}`);
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `laporan-${periode}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  const lunas = rows.filter(r => r.status === "lunas").length;
  const belum = rows.filter(r => r.status === "belum_bayar").length;
  const menunggu = rows.filter(r => r.status === "pending").length;

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto">
      <PageHeader title="Laporan Pembayaran" action={
        <div className="flex gap-2 items-center">
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)} className="input" style={{ width: 150 }} />
          <button type="button" onClick={exportCsv} className="btn-ghost">Export CSV</button>
        </div>
      } />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card green"><div className="stat-label">Lunas</div><div className="stat-value" style={{ color: "var(--primary)" }}>{lunas}</div></div>
        <div className="stat-card"><div className="stat-label">Belum</div><div className="stat-value" style={{ color: "var(--danger)" }}>{belum}</div></div>
        <div className="stat-card"><div className="stat-label">Menunggu</div><div className="stat-value" style={{ color: "var(--warning)" }}>{menunggu}</div></div>
      </div>

      <div className="card p-0 overflow-hidden">
        {rows.length === 0 ? <Empty text="Tidak ada data untuk periode ini." /> : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Rumah</th><th>Kepala KK</th><th>Iuran</th><th>Nominal</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.rumah.nomorRumah}</td>
                      <td style={{ color: "var(--text-muted)" }}>{r.rumah.kk[0]?.namaKepalaKeluarga ?? "—"}</td>
                      <td style={{ color: "var(--text-muted)" }}>{r.jenisIuran.nama}</td>
                      <td>Rp {Number(r.nominal).toLocaleString("id-ID")}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="sm:hidden divide-y" style={{ borderColor: "var(--border-muted)" }}>
              {rows.map(r => (
                <div key={r.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>No. {r.rumah.nomorRumah}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="font-semibold text-sm flex-shrink-0" style={{ color: "var(--text)" }}>
                      Rp {Number(r.nominal).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {r.rumah.kk[0]?.namaKepalaKeluarga ?? "—"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    {r.jenisIuran.nama}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
