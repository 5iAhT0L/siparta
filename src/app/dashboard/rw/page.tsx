"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, PageHeader } from "@/lib/ui";

type RtStatus = {
  rtId: string;
  nama: string;
  periode: string;
  totalTagihan: number;
  lunas: number;
  belum: number;
  pending?: number;
  compliance: number;
  totalPemasukan: number;
  rumahAktif: number;
};

type DashboardData = { rts: RtStatus[] };

export default function RwDashboardPage() {
  const { user, loading, apiFetch } = useAuth();
  const [data, setData]           = useState<DashboardData | null>(null);
  const [selectedRt, setSelectedRt] = useState<string | null>(null);
  const [rtDetail, setRtDetail]   = useState<RtStatus | null>(null);

  useEffect(() => {
    if (!loading && user?.role === "pengurus_rw") {
      apiFetch("/api/pengurus-rw/dashboard").then(r => r.json()).then(d => {
        setData(d.error ? null : d);
      });
    }
  }, [user, loading]);

  async function loadDetail(rtId: string) {
    if (selectedRt === rtId) { setSelectedRt(null); setRtDetail(null); return; }
    setSelectedRt(rtId);
    const res = await apiFetch(`/api/pengurus-rw/rt/${rtId}/status`);
    const d = await res.json();
    setRtDetail(d.error ? null : d);
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rw") return <Denied />;

  const rts = data?.rts ?? [];

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Monitoring RT" />

      {rts.length === 0 && <Empty text="Tidak ada RT di bawah RW Anda." />}

      <div className="space-y-3">
        {rts.map(rt => {
          const compColor = rt.compliance >= 90 ? "var(--primary)" : rt.compliance >= 70 ? "var(--warning)" : "var(--danger)";
          const barColor  = rt.compliance >= 90 ? "var(--primary)" : rt.compliance >= 70 ? "var(--warning)" : "var(--danger)";
          return (
            <div key={rt.rtId} className="card p-0 overflow-hidden">
              <button type="button" onClick={() => loadDetail(rt.rtId)} className="w-full p-4 text-left">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-sm">{rt.nama}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Periode: {rt.periode}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold" style={{ color: compColor }}>{rt.compliance}%</div>
                    <div className="text-xs" style={{ color: "var(--text-subtle)" }}>compliance</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                  <div>
                    <div style={{ color: "var(--text-subtle)" }}>Tagihan</div>
                    <div className="font-semibold">{rt.totalTagihan}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-subtle)" }}>Lunas</div>
                    <div className="font-semibold" style={{ color: "var(--primary)" }}>{rt.lunas}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-subtle)" }}>Belum</div>
                    <div className="font-semibold" style={{ color: "var(--danger)" }}>{rt.belum}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-subtle)" }}>Rumah</div>
                    <div className="font-semibold">{rt.rumahAktif}</div>
                  </div>
                </div>

                <div className="text-xs mb-2">
                  <span style={{ color: "var(--text-subtle)" }}>Pemasukan: </span>
                  <span className="font-semibold">Rp {rt.totalPemasukan.toLocaleString("id-ID")}</span>
                </div>

                <div className="h-1.5 rounded-full" style={{ background: "var(--border-muted)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${rt.compliance}%`, background: barColor }} />
                </div>
              </button>

              {selectedRt === rt.rtId && rtDetail && (
                <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--border-muted)" }}>
                  <div className="text-xs font-semibold mb-2 mt-2" style={{ color: "var(--text-muted)" }}>
                    Detail Periode {rtDetail.periode}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="stat-card">
                      <div className="stat-label">Total Tagihan</div>
                      <div className="stat-value">{rtDetail.totalTagihan}</div>
                    </div>
                    <div className="stat-card green">
                      <div className="stat-label">Lunas</div>
                      <div className="stat-value" style={{ color: "var(--primary)" }}>{rtDetail.lunas}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Belum Bayar</div>
                      <div className="stat-value" style={{ color: "var(--danger)" }}>{rtDetail.belum}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Menunggu</div>
                      <div className="stat-value" style={{ color: "var(--warning)" }}>{rtDetail.pending ?? 0}</div>
                    </div>
                    <div className="stat-card" style={{ gridColumn: "1 / -1" }}>
                      <div className="stat-label">Total Pemasukan</div>
                      <div className="stat-value" style={{ color: "var(--primary)", fontSize: "1rem" }}>
                        Rp {rtDetail.totalPemasukan.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
