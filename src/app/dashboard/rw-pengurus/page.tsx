"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader, StatusBadge } from "@/lib/ui";

type Rt = { id: string; nama: string };
type Pengurus = { id: string; nama: string; username: string; status: string; rtId: string; createdAt: string };

/* ── Toggle show/hide password (lokal) ── */
function PwInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ paddingRight: "2.75rem" }}
      />
      <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
        style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-subtle)", lineHeight: 1 }}>
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function RwPengurusPage() {
  const { user, loading, apiFetch } = useAuth();
  const [rts, setRts]             = useState<Rt[]>([]);
  const [list, setList]           = useState<Pengurus[]>([]);
  const [show, setShow]           = useState(false);
  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null);

  // Form state
  const [fnama, setFnama]       = useState("");
  const [fusername, setFusername] = useState("");
  const [fpassword, setFpassword] = useState("");
  const [frtId, setFrtId]       = useState("");
  const [busy, setBusy]         = useState(false);

  async function load() {
    const d = await apiFetch("/api/rw/pengurus-rt").then(r => r.json());
    if (!d.error) { setRts(d.rts ?? []); setList(d.pengurusRt ?? []); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rw") load(); }, [user, loading]);

  async function angkat(e: FormEvent) {
    e.preventDefault();
    setMsg(null); setBusy(true);
    const res  = await apiFetch("/api/rw/pengurus-rt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: fnama, username: fusername, password: fpassword, rtId: frtId }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ text: data.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: `${fnama} berhasil diangkat sebagai Pengurus RT.`, ok: true });
    setShow(false); setFnama(""); setFusername(""); setFpassword(""); setFrtId("");
    load();
  }

  async function setStatus(id: string, status: "aktif" | "tidak_aktif") {
    const label = status === "tidak_aktif" ? "nonaktifkan" : "aktifkan";
    if (!confirm(`Yakin ingin ${label} pengurus ini?`)) return;
    setMsg(null);
    const res  = await apiFetch(`/api/rw/pengurus-rt/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? `Berhasil di${label}kan.` : (data.error ?? "Gagal"), ok: res.ok });
    if (res.ok) load();
  }

  async function hapus(id: string, nama: string) {
    if (!confirm(`Hapus permanen akun ${nama}? Tindakan ini tidak bisa dibatalkan.\n\nJika pengurus masih punya data terkait, nonaktifkan saja.`)) return;
    setMsg(null);
    const res  = await apiFetch(`/api/rw/pengurus-rt/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? "Akun berhasil dihapus." : (data.error ?? "Gagal"), ok: res.ok });
    if (res.ok) load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rw") return <Denied />;

  // Group per RT untuk tampilan
  const grouped = rts.map(rt => ({
    rt,
    pengurus: list.filter(p => p.rtId === rt.id),
  }));

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <PageHeader
        title="Kelola Pengurus RT"
        action={
          <button type="button" onClick={() => { setShow(s => !s); setMsg(null); }} className="btn-primary">
            {show ? "Batal" : "+ Angkat Pengurus"}
          </button>
        }
      />
      <Msg msg={msg} />

      {/* Form angkat pengurus */}
      {show && (
        <form onSubmit={angkat} className="card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">Angkat Pengurus RT Baru</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Lengkap">
              <input required value={fnama} onChange={e => setFnama(e.target.value)} className="input" placeholder="Nama pengurus" />
            </Field>
            <Field label="Username">
              <input required value={fusername} onChange={e => setFusername(e.target.value)} className="input" placeholder="Username login" />
            </Field>
          </div>
          <Field label="Password (min. 8 karakter)">
            <PwInput value={fpassword} onChange={setFpassword} placeholder="Password awal" />
          </Field>
          <Field label="Tugaskan ke RT">
            <select required value={frtId} onChange={e => setFrtId(e.target.value)} className="input">
              <option value="">Pilih RT</option>
              {rts.map(rt => <option key={rt.id} value={rt.id}>{rt.nama}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Menyimpan…" : "Angkat Sekarang"}
            </button>
            <button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button>
          </div>
        </form>
      )}

      {/* Daftar per RT */}
      {grouped.every(g => g.pengurus.length === 0) && !show && (
        <Empty text="Belum ada pengurus RT yang terdaftar." />
      )}

      <div className="space-y-4">
        {grouped.map(({ rt, pengurus }) => (
          <div key={rt.id} className="card p-0 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ background: "var(--primary-light)", borderBottom: "1px solid var(--border-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}>
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: "var(--primary-dark)" }}>{rt.nama}</span>
              <span className="ml-auto text-xs" style={{ color: "var(--text-subtle)" }}>{pengurus.length} pengurus</span>
            </div>

            {pengurus.length === 0 ? (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-subtle)" }}>Belum ada pengurus untuk RT ini.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border-muted)" }}>
                {pengurus.map(p => (
                  <div key={p.id} className="px-4 py-3 space-y-2">
                    {/* Baris atas: avatar + info + badge */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: p.status === "aktif" ? "var(--primary)" : "var(--text-subtle)" }}>
                        {p.nama[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{p.nama}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>@{p.username}</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    {/* Baris bawah: tombol aksi */}
                    <div className="flex gap-2" style={{ paddingLeft: "2.75rem" }}>
                      {p.status === "aktif" ? (
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, "tidak_aktif")}
                          className="btn-ghost"
                          style={{ fontSize: "0.75rem", color: "var(--warning)" }}>
                          Berhentikan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(p.id, "aktif")}
                          className="btn-ghost"
                          style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
                          Aktifkan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => hapus(p.id, p.nama)}
                        className="btn-danger"
                        style={{ fontSize: "0.75rem" }}>
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
