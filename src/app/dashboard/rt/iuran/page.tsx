"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader } from "@/lib/ui";

type JenisIuran = { id: string; nama: string; deskripsi?: string; nominal: number; tipe: "bulanan" | "insidental"; jatuhTempo?: number };

export default function IuranPage() {
  const { user, loading, apiFetch } = useAuth();
  const [list, setList]   = useState<JenisIuran[]>([]);
  const [show, setShow]   = useState(false);
  const [edit, setEdit]   = useState<JenisIuran | null>(null);
  const [msg, setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [nama, setNama]   = useState("");
  const [desk, setDesk]   = useState("");
  const [nom, setNom]     = useState("");
  const [tipe, setTipe]   = useState<"bulanan" | "insidental">("bulanan");
  const [jt, setJt]       = useState("");

  const load = async () => { const d = await apiFetch("/api/iuran/jenis").then(r => r.json()); setList(Array.isArray(d) ? d : []); };
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading]);

  function openCreate() { setEdit(null); setNama(""); setDesk(""); setNom(""); setTipe("bulanan"); setJt(""); setShow(true); setMsg(null); }
  function openEdit(r: JenisIuran) { setEdit(r); setNama(r.nama); setDesk(r.deskripsi ?? ""); setNom(String(r.nominal)); setTipe(r.tipe); setJt(r.jatuhTempo ? String(r.jatuhTempo) : ""); setShow(true); setMsg(null); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = { nama, deskripsi: desk || undefined, nominal: parseFloat(nom), tipe, jatuhTempo: tipe === "bulanan" && jt ? parseInt(jt) : undefined };
    const res = await apiFetch(edit ? `/api/iuran/jenis/${edit.id}` : "/api/iuran/jenis", { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: edit ? "Diperbarui." : "Berhasil dibuat.", ok: true }); setShow(false); load();
  }

  async function hapus(id: string, n: string) {
    if (!confirm(`Hapus "${n}"?`)) return;
    const res = await apiFetch(`/api/iuran/jenis/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? "Dihapus." : (d.error ?? "Gagal"), ok: res.ok });
    if (res.ok) load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Jenis Iuran" action={<button type="button" onClick={openCreate} className="btn-primary">+ Tambah</button>} />
      <Msg msg={msg} />

      {show && (
        <form onSubmit={onSubmit} className="card mb-5 space-y-3">
          <h2 className="font-semibold text-sm">{edit ? "Edit" : "Tambah"} Jenis Iuran</h2>
          <Field label="Nama"><input required value={nama} onChange={e => setNama(e.target.value)} className="input" /></Field>
          <Field label="Deskripsi"><textarea value={desk} onChange={e => setDesk(e.target.value)} rows={2} className="input" /></Field>
          <Field label="Nominal (Rp)"><input required type="number" min="1" value={nom} onChange={e => setNom(e.target.value)} className="input" /></Field>
          <Field label="Tipe">
            <select value={tipe} onChange={e => setTipe(e.target.value as "bulanan" | "insidental")} className="input">
              <option value="bulanan">Bulanan</option>
              <option value="insidental">Insidental</option>
            </select>
          </Field>
          {tipe === "bulanan" && <Field label="Jatuh Tempo (tgl 1–28)"><input required type="number" min="1" max="28" value={jt} onChange={e => setJt(e.target.value)} className="input" /></Field>}
          <div className="flex gap-2 pt-1"><button type="submit" className="btn-primary">Simpan</button><button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button></div>
        </form>
      )}

      <div className="space-y-2">
        {list.map(r => (
          <div key={r.id} className="card flex justify-between items-start gap-3">
            <div>
              <div className="font-semibold text-sm">{r.nama}</div>
              <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                Rp {Number(r.nominal).toLocaleString("id-ID")}
                <span className={`badge ${r.tipe === "bulanan" ? "badge-green" : "badge-yellow"}`}>{r.tipe}</span>
                {r.tipe === "bulanan" && r.jatuhTempo && `· tgl ${r.jatuhTempo}`}
              </div>
              {r.deskripsi && <div className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>{r.deskripsi}</div>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button type="button" onClick={() => openEdit(r)} className="btn-ghost" style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}>Edit</button>
              <button type="button" onClick={() => hapus(r.id, r.nama)} className="btn-danger" style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && !show && <Empty text="Belum ada jenis iuran." />}
    </div>
  );
}
