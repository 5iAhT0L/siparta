"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, PageHeader, StatusBadge } from "@/lib/ui";

type HistoryItem = {
  id: string;
  nominal: number;
  metode: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  catatan?: string;
  rejectReason?: string;
  buktiFile?: string;
  tagihan: { jenisIuran: { nama: string }; periode: string };
  submittedBy: { nama: string };
};

export default function WargaHistoryPage() {
  const { user, loading, apiFetch } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!loading && user?.role === "warga") {
      apiFetch("/api/pembayaran/history").then(r => r.json()).then(d => {
        setHistory(Array.isArray(d) ? d : []);
      });
    }
  }, [user, loading, apiFetch]);

  if (loading || !user) return <Loader />;
  if (user.role !== "warga") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <PageHeader title="Riwayat Pembayaran" />

      {history.length === 0 && <Empty text="Belum ada riwayat pembayaran." />}

      <div className="space-y-3">
        {history.map(h => (
          <div key={h.id} className="card">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-sm">{h.tagihan.jenisIuran.nama}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{h.tagihan.periode}</div>
                <div className="font-bold mt-1">Rp {Number(h.nominal).toLocaleString("id-ID")}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                  {h.metode} · {new Date(h.submittedAt).toLocaleDateString("id-ID")}
                </div>
              </div>
              <StatusBadge status={h.status} />
            </div>

            {h.buktiFile && (
              <a href={h.buktiFile} target="_blank" rel="noreferrer"
                className="mt-2 inline-block text-xs underline" style={{ color: "var(--primary)" }}>
                Lihat bukti transfer
              </a>
            )}
            {h.catatan && (
              <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Catatan: {h.catatan}</div>
            )}
            {h.rejectReason && (
              <div className="mt-2 rounded px-2 py-1.5 text-xs" style={{ background: "#fef2f2", color: "var(--danger)" }}>
                Alasan penolakan: {h.rejectReason}
              </div>
            )}
            {h.verifiedAt && (
              <div className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>
                Diverifikasi: {new Date(h.verifiedAt).toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
