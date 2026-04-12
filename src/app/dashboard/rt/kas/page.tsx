"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader } from "@/lib/ui";

type KasRecord = { id: string; tipe: string; deskripsi: string; nominal: number; kategori?: string; recordedDate: string; recordedBy?: { nama: string } };
type KasSummary = { records: KasRecord[]; totalPemasukan: number; totalPengeluaran: number; saldo: number };

export default function KasPage() {
  const { user, loading, apiFetch } = useAuth();
  const [data, setData]     = useState<KasSummary | null>(null);
  const [show, setShow]     = useState(false);
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [bulan, setBulan]   = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
  const [desk, setDesk]     = useState("");
  const [nom, setNom]       = useState("");
  const [kat, setKat]       = useState("");

  const load = async () => { const d = await apiFetch(`/api/reports/kas?bulan=${bulan}`).then(r => r.json()); setData(d.error ? null : d); };
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading, bulan]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/kas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipe: "pengeluaran", deskripsi: desk, nominal: parseFloat(nom), kategori: kat || undefined }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: "Pengeluaran dicatat.", ok: true }); setShow(false); setDesk(""); setNom(""); setKat(""); load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Kas RT" action={<button type="button" onClick={() => setShow(!show)} className="btn-primary">+ Pengeluaran</button>} />

      <div className="mb-4">
        <input type="month" value={bulan} onChange={e => setBulan(e.target.value)} className="input" style={{ width: 160 }} />
      </div>

      <Msg msg={msg} />

      {show && (
        <form onSubmit={onSubmit} className="card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Catat Pengeluaran</h2>
          <Field label="Deskripsi"><input required value={desk} onChange={e => setDesk(e.target.value)} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nominal (Rp)"><input required type="number" min="1" value={nom} onChange={e => setNom(e.target.value)} className="input" /></Field>
            <Field label="Kategori"><input value={kat} onChange={e => setKat(e.target.value)} placeholder="misal: kebersihan" className="input" /></Field>
          </div>
          <div className="flex gap-2 pt-1"><button type="submit" className="btn-primary">Simpan</button><button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button></div>
        </form>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="stat-card green"><div className="stat-label">Pemasukan</div><div className="stat-value" style={{ color: "var(--primary)", fontSize: "1.1rem" }}>Rp {data.totalPemasukan.toLocaleString("id-ID")}</div></div>
            <div className="stat-card"><div className="stat-label">Pengeluaran</div><div className="stat-value" style={{ color: "var(--danger)", fontSize: "1.1rem" }}>Rp {data.totalPengeluaran.toLocaleString("id-ID")}</div></div>
            <div className="stat-card"><div className="stat-label">Saldo</div><div className="stat-value" style={{ color: data.saldo >= 0 ? "var(--primary)" : "var(--danger)", fontSize: "1.1rem" }}>Rp {data.saldo.toLocaleString("id-ID")}</div></div>
          </div>
          <div className="card p-0 overflow-hidden">
            {data.records.length === 0 ? <Empty text="Belum ada catatan kas." /> : (
              <div className="divide-y" style={{ borderColor: "var(--border-muted)" }}>
                {data.records.map(r => (
                  <div key={r.id} className="flex justify-between items-center px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{r.deskripsi}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                        {new Date(r.recordedDate).toLocaleDateString("id-ID")}
                        {r.kategori && ` · ${r.kategori}`}
                        {r.recordedBy && ` · ${r.recordedBy.nama}`}
                      </div>
                    </div>
                    <div className="font-semibold text-sm flex-shrink-0" style={{ color: r.tipe === "pemasukan" ? "var(--primary)" : "var(--danger)" }}>
                      {r.tipe === "pemasukan" ? "+" : "−"}Rp {Number(r.nominal).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
