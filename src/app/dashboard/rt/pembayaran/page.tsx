"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader } from "@/lib/ui";

type Pending = { id: string; nominal: number; metode: string; buktiFile: string | null; submittedAt: string; catatan?: string; rumah: { nomorRumah: string }; tagihan: { jenisIuran: { nama: string }; periode: string }; submittedBy: { nama: string } };
type Rumah = { id: string; nomorRumah: string; status: string };
type Tagihan = { id: string; jenisIuran: { nama: string }; periode: string; nominal: number; status: string };

export default function PembayaranPage() {
  const { user, loading, apiFetch } = useAuth();
  const [pending, setPending]   = useState<Pending[]>([]);
  const [rumahList, setRumahList] = useState<Rumah[]>([]);
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [selRumah, setSelRumah] = useState("");
  const [selTagihan, setSelTagihan] = useState("");
  const [metode, setMetode]     = useState("cash");
  const [catatan, setCatatan]   = useState("");
  const [nominal, setNominal]   = useState("");
  const [receivedBy, setReceivedBy] = useState("");

  const loadPending = async () => { const d = await apiFetch("/api/pembayaran/pending").then(r => r.json()); setPending(Array.isArray(d) ? d : []); };
  const loadRumah   = async () => { const d = await apiFetch("/api/rumah").then(r => r.json()); setRumahList(Array.isArray(d) ? d.filter((r: Rumah) => r.status === "aktif") : []); };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") { loadPending(); loadRumah(); } }, [user, loading]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!selRumah) { setTagihanList([]); setSelTagihan(""); return; }
    apiFetch(`/api/iuran/tagihan?rumahId=${selRumah}`).then(r => r.json()).then(d => {
      setTagihanList(Array.isArray(d) ? d.filter((t: Tagihan) => t.status !== "lunas") : []);
    });
    setSelTagihan("");
  }, [selRumah, apiFetch]);

  useEffect(() => {
    const t = tagihanList.find(t => t.id === selTagihan);
    if (t) setNominal(String(t.nominal));
  }, [selTagihan, tagihanList]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function verify(id: string, action: "approve" | "reject") {
    setMsg(null);
    if (action === "reject") {
      const reason = window.prompt("Alasan penolakan?");
      if (!reason) return;
      const res = await apiFetch(`/api/pembayaran/${id}/reject`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rejectReason: reason }) });
      const d = await res.json().catch(() => ({}));
      setMsg({ text: res.ok ? "Ditolak." : (d.error ?? "Gagal"), ok: res.ok });
    } else {
      const res = await apiFetch(`/api/pembayaran/${id}/verify`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = await res.json().catch(() => ({}));
      setMsg({ text: res.ok ? "Disetujui." : (d.error ?? "Gagal"), ok: res.ok });
    }
    loadPending();
  }

  async function submitManual(e: FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/api/pembayaran/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tagihanId: selTagihan, nominal: parseFloat(nominal), metode, catatan: catatan || undefined, receivedByName: receivedBy || undefined }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: "Pembayaran manual berhasil (langsung approved).", ok: true });
    setShowManual(false); setSelRumah(""); setSelTagihan(""); setNominal(""); setCatatan(""); setReceivedBy("");
    loadPending();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Pembayaran" action={
        <button type="button" onClick={() => setShowManual(!showManual)} className="btn-ghost">+ Input Manual</button>
      } />
      <Msg msg={msg} />

      {showManual && (
        <form onSubmit={submitManual} className="card mb-5 space-y-3">
          <h2 className="font-semibold text-sm">Input Pembayaran Manual</h2>
          <Field label="Rumah">
            <select required value={selRumah} onChange={e => setSelRumah(e.target.value)} className="input">
              <option value="">— pilih rumah —</option>
              {rumahList.map(r => <option key={r.id} value={r.id}>Rumah {r.nomorRumah}</option>)}
            </select>
          </Field>
          {selRumah && (
            <Field label="Tagihan">
              <select required value={selTagihan} onChange={e => setSelTagihan(e.target.value)} className="input">
                <option value="">— pilih tagihan —</option>
                {tagihanList.map(t => <option key={t.id} value={t.id}>{t.jenisIuran.nama} ({t.periode}) · Rp {Number(t.nominal).toLocaleString("id-ID")}</option>)}
              </select>
            </Field>
          )}
          <Field label="Nominal (Rp)"><input required type="number" min="1" value={nominal} onChange={e => setNominal(e.target.value)} className="input" /></Field>
          <Field label="Metode">
            <select value={metode} onChange={e => setMetode(e.target.value)} className="input">
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </Field>
          <Field label="Diterima Oleh"><input value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Nama pengurus" className="input" /></Field>
          <Field label="Catatan"><input value={catatan} onChange={e => setCatatan(e.target.value)} className="input" /></Field>
          <div className="flex gap-2 pt-1"><button type="submit" className="btn-primary">Simpan</button><button type="button" onClick={() => setShowManual(false)} className="btn-ghost">Batal</button></div>
        </form>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Antrian Verifikasi</h2>
        <span className="badge badge-yellow">{pending.length}</span>
      </div>

      {pending.length === 0 ? <Empty text="Tidak ada antrian verifikasi." /> : (
        <div className="space-y-3">
          {pending.map(p => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-sm">{p.tagihan.jenisIuran.nama} — Rumah {p.rumah.nomorRumah}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {p.submittedBy.nama} · {p.metode} · Rp {Number(p.nominal).toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-subtle)" }}>{new Date(p.submittedAt).toLocaleString("id-ID")}</div>
                </div>
                {p.buktiFile && <a href={p.buktiFile} target="_blank" rel="noreferrer" className="text-xs font-medium flex-shrink-0" style={{ color: "var(--primary)" }}>Lihat bukti ↗</a>}
              </div>
              {p.catatan && <div className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>&ldquo;{p.catatan}&rdquo;</div>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => verify(p.id, "approve")} className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Setujui</button>
                <button type="button" onClick={() => verify(p.id, "reject")} className="btn-danger" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Tolak</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
