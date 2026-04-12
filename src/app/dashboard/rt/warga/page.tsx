"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader, StatusBadge } from "@/lib/ui";

type Warga = {
  id: string; nama: string; username: string; noKtp?: string; status: string; rumahId?: string;
  // aktif
  rumah?: { nomorRumah: string };
  kartuKeluarga?: { noKk: string; namaKepalaKeluarga: string };
  // pending (dari raw query)
  nomorRumah?: string;           // rumah aktif (flat)
  pendingRumahId?: string;
  pendingRumahNomor?: string;    // nama rumah lama yg dipilih
  pendingNomorRumah?: string;    // rumah baru
  pendingTipeHunian?: string;
  pendingKontak?: string;
  pendingNoKk?: string;
  pendingNamaKk?: string;
};
type Rumah  = { id: string; nomorRumah: string; status: string };

export default function WargaPage() {
  const { user, loading, apiFetch } = useAuth();
  const [warga, setWarga]   = useState<Warga[]>([]);
  const [pending, setPending] = useState<Warga[]>([]);
  const [rumah, setRumah]   = useState<Rumah[]>([]);
  const [show, setShow]     = useState(false);
  const [edit, setEdit]     = useState<Warga | null>(null);
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [tab, setTab]       = useState<"aktif" | "pending">("aktif");
  const [nama, setNama]     = useState("");
  const [uname, setUname]   = useState("");
  const [nik, setNik]       = useState("");
  const [pass, setPass]     = useState("");
  const [selRumah, setSelRumah] = useState("");

  async function load() {
    const [w, p, r] = await Promise.all([
      apiFetch("/api/residents").then(r => r.json()),
      apiFetch("/api/residents/pending").then(r => r.json()),
      apiFetch("/api/rumah").then(r => r.json()),
    ]);
    setWarga(Array.isArray(w) ? w : []);
    setPending(Array.isArray(p) ? p : []);
    setRumah(Array.isArray(r) ? r.filter((x: Rumah) => x.status === "aktif") : []);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading]);

  function openCreate() { setEdit(null); setNama(""); setUname(""); setNik(""); setPass(""); setSelRumah(""); setShow(true); setMsg(null); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = { nama, username: uname, noKtp: nik, rumahId: selRumah };
    if (!edit || pass) body.password = pass;
    const res = await apiFetch(edit ? `/api/residents/${edit.id}` : "/api/residents", { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: edit ? "Diperbarui." : "Akun dibuat (langsung aktif).", ok: true });
    setShow(false); load();
  }

  async function activate(id: string) { const res = await apiFetch(`/api/residents/${id}/activate`, { method: "PUT" }); const d = await res.json().catch(() => ({})); setMsg({ text: res.ok ? "Akun diaktifkan." : (d.error ?? "Gagal"), ok: res.ok }); load(); }
  async function reject(id: string) {
    const reason = window.prompt("Alasan penolakan?"); if (!reason) return;
    const res = await apiFetch(`/api/residents/${id}/reject`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    const d = await res.json().catch(() => ({})); setMsg({ text: res.ok ? "Ditolak." : (d.error ?? "Gagal"), ok: res.ok }); load();
  }
  async function toggleStatus(w: Warga) {
    const url = w.status === "aktif" ? `/api/residents/${w.id}/deactivate` : `/api/residents/${w.id}/activate`;
    const res = await apiFetch(url, { method: "PUT" }); const d = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? `Akun ${w.status === "aktif" ? "dinonaktifkan" : "diaktifkan"}.` : (d.error ?? "Gagal"), ok: res.ok }); load();
  }
  async function hapus(id: string) {
    if (!confirm("Hapus akun warga ini?")) return;
    const res = await apiFetch(`/api/residents/${id}`, { method: "DELETE" }); const d = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? "Akun dihapus." : (d.error ?? "Gagal"), ok: res.ok }); if (res.ok) load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Manajemen Warga" action={<button type="button" onClick={openCreate} className="btn-primary">+ Tambah Akun</button>} />
      <Msg msg={msg} />

      {show && (
        <form onSubmit={onSubmit} className="card mb-5 space-y-3">
          <h2 className="font-semibold text-sm">{edit ? "Edit" : "Tambah"} Akun Warga</h2>
          <Field label="Nama"><input required value={nama} onChange={e => setNama(e.target.value)} className="input" /></Field>
          <Field label="Username"><input required={!edit} value={uname} onChange={e => setUname(e.target.value)} className="input" /></Field>
          <Field label="NIK (16 digit)"><input required={!edit} value={nik} maxLength={16} onChange={e => setNik(e.target.value)} className="input" /></Field>
          <Field label={edit ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}>
            <input type="password" required={!edit} value={pass} onChange={e => setPass(e.target.value)} className="input" />
          </Field>
          <Field label="Rumah">
            <select required value={selRumah} onChange={e => setSelRumah(e.target.value)} className="input">
              <option value="">— pilih rumah —</option>
              {rumah.map(r => <option key={r.id} value={r.id}>Rumah {r.nomorRumah}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 pt-1"><button type="submit" className="btn-primary">Simpan</button><button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button></div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-xl p-1" style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)" }}>
        {(["aktif", "pending"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
            style={tab === t ? { background: "var(--surface)", color: "var(--primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "var(--text-muted)" }}>
            {t === "aktif" ? `Akun (${warga.length})` : `Pending (${pending.length})`}
          </button>
        ))}
      </div>

      {tab === "aktif" && (
        <div className="space-y-2">
          {warga.map(w => (
            <div key={w.id} className="card flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-sm">{w.nama}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>@{w.username} · {w.rumah ? `Rumah ${w.rumah.nomorRumah}` : "—"}</div>
                <div className="mt-1"><StatusBadge status={w.status} /></div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                <button type="button" onClick={() => { setEdit(w); setNama(w.nama); setUname(w.username); setNik(w.noKtp ?? ""); setSelRumah(w.rumahId ?? ""); setPass(""); setShow(true); setMsg(null); }} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}>Edit</button>
                <button type="button" onClick={() => toggleStatus(w)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}>{w.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>
                <button type="button" onClick={() => hapus(w.id)} className="btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}>Hapus</button>
              </div>
            </div>
          ))}
          {warga.length === 0 && <Empty text="Belum ada akun warga." />}
        </div>
      )}

      {tab === "pending" && (
        <div className="space-y-2">
          {pending.map(p => {
            const isNewRoom = !!p.pendingNomorRumah;
            const displayRumah = p.nomorRumah ?? p.pendingRumahNomor ?? p.pendingNomorRumah;
            return (
              <div key={p.id} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm">{p.nama}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>@{p.username} · NIK: {p.noKtp}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${isNewRoom ? "badge-yellow" : "badge-green"}`}>
                    {isNewRoom ? "Rumah Baru" : "Rumah Ada"}
                  </span>
                </div>

                <div className="rounded-lg px-3 py-2 text-xs space-y-1" style={{ background: "var(--surface-2)", border: "1px solid var(--border-muted)" }}>
                  <div className="flex gap-1.5">
                    <span style={{ color: "var(--text-subtle)", minWidth: 60 }}>Rumah</span>
                    <span className="font-medium">No. {displayRumah ?? "—"}</span>
                    {isNewRoom && <span style={{ color: "var(--warning)" }}>(akan dibuat saat disetujui)</span>}
                    {p.pendingTipeHunian && <span style={{ color: "var(--text-subtle)" }}>· {p.pendingTipeHunian}</span>}
                  </div>
                  {p.pendingKontak && (
                    <div className="flex gap-1.5">
                      <span style={{ color: "var(--text-subtle)", minWidth: 60 }}>Kontak</span>
                      <span>{p.pendingKontak}</span>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <span style={{ color: "var(--text-subtle)", minWidth: 60 }}>KK</span>
                    <span className="font-medium">{p.pendingNamaKk ?? "—"}</span>
                    {p.pendingNoKk && <span style={{ color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>· {p.pendingNoKk}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => activate(p.id)} className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>
                    {isNewRoom ? "Setujui & Buat Rumah" : "Setujui"}
                  </button>
                  <button type="button" onClick={() => reject(p.id)} className="btn-danger" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Tolak</button>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && <Empty text="Tidak ada pendaftaran menunggu." />}
        </div>
      )}
    </div>
  );
}
