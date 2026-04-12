"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, PageHeader } from "@/lib/ui";

type Pending = {
  id: string;
  nominal: { toString: () => string };
  metode: string;
  buktiFile: string | null;
  submittedAt: string;
  rumah: { nomorRumah: string };
  tagihan: { jenisIuran: { nama: string } };
  submittedBy: { nama: string };
};

export default function VerifikasiPage() {
  const { user, loading, apiFetch } = useAuth();
  const [list, setList] = useState<Pending[]>([]);
  const [msg, setMsg]   = useState<{ text: string; ok: boolean } | null>(null);

  async function refresh() {
    const res = await apiFetch("/api/pembayaran/pending");
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") refresh(); }, [user, loading]);

  async function verify(id: string, action: "approve" | "reject") {
    setMsg(null);
    if (action === "approve") {
      const res = await apiFetch(`/api/pembayaran/${id}/verify`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json().catch(() => ({}));
      setMsg({ text: res.ok ? "Disetujui." : (data.error ?? "Gagal"), ok: res.ok });
    } else {
      const reason = window.prompt("Alasan penolakan?");
      if (!reason) return;
      const res = await apiFetch(`/api/pembayaran/${id}/reject`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rejectReason: reason }) });
      const data = await res.json().catch(() => ({}));
      setMsg({ text: res.ok ? "Ditolak." : (data.error ?? "Gagal"), ok: res.ok });
    }
    await refresh();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Verifikasi Pembayaran" />
      <Msg msg={msg} />

      {list.length === 0 && <Empty text="Tidak ada antrian verifikasi." />}

      <div className="space-y-3">
        {list.map(p => (
          <div key={p.id} className="card">
            <div className="font-semibold text-sm">{p.tagihan.jenisIuran.nama} — Rumah {p.rumah.nomorRumah}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {p.submittedBy.nama} · {p.metode} · Rp {Number(p.nominal.toString()).toLocaleString("id-ID")}
            </div>
            {p.buktiFile && (
              <a href={p.buktiFile} target="_blank" rel="noreferrer"
                className="mt-2 inline-block text-xs underline" style={{ color: "var(--primary)" }}>
                Lihat bukti transfer
              </a>
            )}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => verify(p.id, "approve")} className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Setujui</button>
              <button type="button" onClick={() => verify(p.id, "reject")} className="btn-danger" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Tolak</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
