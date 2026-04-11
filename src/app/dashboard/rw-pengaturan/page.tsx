"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Msg, Field, PageHeader, Empty } from "@/lib/ui";

type Rt = { id: string; nama: string };

export default function RwPengaturanPage() {
  const { user, loading, apiFetch } = useAuth();

  // ── Identitas RW ────────────────────────────────────────────────────────
  const [rwNama, setRwNama]     = useState("");
  const [rwAlamat, setRwAlamat] = useState("");
  const [rwMsg, setRwMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [rwBusy, setRwBusy]     = useState(false);

  // ── Daftar RT ────────────────────────────────────────────────────────────
  const [rts, setRts]           = useState<Rt[]>([]);
  const [rtMsg, setRtMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [newNama, setNewNama]   = useState("");
  const [addBusy, setAddBusy]   = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");

  async function loadAll() {
    const [rwData, rtData] = await Promise.all([
      apiFetch("/api/rw/settings").then(r => r.json()),
      apiFetch("/api/pengurus-rw/rt-list").then(r => r.json()),
    ]);
    if (!rwData.error) { setRwNama(rwData.nama ?? ""); setRwAlamat(rwData.alamat ?? ""); }
    setRts(Array.isArray(rtData) ? rtData : []);
  }

  useEffect(() => { if (!loading && user?.role === "pengurus_rw") loadAll(); }, [user, loading]);

  // ── Submit identitas RW ─────────────────────────────────────────────────
  async function saveRw(e: { preventDefault(): void }) {
    e.preventDefault();
    setRwMsg(null); setRwBusy(true);
    const res  = await apiFetch("/api/rw/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: rwNama, alamat: rwAlamat }) });
    const data = await res.json().catch(() => ({}));
    setRwBusy(false);
    setRwMsg({ text: res.ok ? "Identitas RW disimpan." : (data.error ?? "Gagal"), ok: res.ok });
  }

  // ── Tambah RT baru ──────────────────────────────────────────────────────
  async function tambahRt(e: { preventDefault(): void }) {
    e.preventDefault();
    setRtMsg(null); setAddBusy(true);
    const res  = await apiFetch("/api/rw/rt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: newNama }) });
    const data = await res.json().catch(() => ({}));
    setAddBusy(false);
    if (!res.ok) { setRtMsg({ text: data.error ?? "Gagal menambah RT", ok: false }); return; }
    setNewNama(""); loadAll();
    setRtMsg({ text: `${data.nama} berhasil ditambahkan.`, ok: true });
  }

  // ── Simpan edit nama RT ─────────────────────────────────────────────────
  async function saveEditRt(id: string) {
    setRtMsg(null);
    const res  = await apiFetch(`/api/rw/rt/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: editNama }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setRtMsg({ text: data.error ?? "Gagal", ok: false }); return; }
    setEditId(null); loadAll();
    setRtMsg({ text: "Nama RT diperbarui.", ok: true });
  }

  // ── Hapus RT ────────────────────────────────────────────────────────────
  async function hapusRt(id: string, nama: string) {
    if (!confirm(`Hapus ${nama}? RT hanya bisa dihapus jika tidak memiliki rumah.`)) return;
    setRtMsg(null);
    const res  = await apiFetch(`/api/rw/rt/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setRtMsg({ text: data.error ?? "Gagal", ok: false }); return; }
    loadAll();
    setRtMsg({ text: `${nama} berhasil dihapus.`, ok: true });
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rw") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      <PageHeader title="Pengaturan RW" />

      {/* ── Identitas RW ── */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-sm">Identitas RW</h2>
        <Msg msg={rwMsg} />
        <form onSubmit={saveRw} className="space-y-3">
          <Field label="Nama RW">
            <input
              required
              value={rwNama}
              onChange={e => setRwNama(e.target.value)}
              placeholder="Contoh: RW 001"
              className="input"
            />
          </Field>
          <Field label="Alamat / Wilayah">
            <input
              value={rwAlamat}
              onChange={e => setRwAlamat(e.target.value)}
              placeholder="Contoh: Kelurahan Menteng, Kecamatan Menteng"
              className="input"
            />
          </Field>
          <button type="submit" disabled={rwBusy || !rwNama.trim()} className="btn-primary w-full justify-center" style={{ width: "100%" }}>
            {rwBusy ? "Menyimpan…" : "Simpan Identitas"}
          </button>
        </form>
      </div>

      {/* ── Daftar RT ── */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-sm">Daftar RT</h2>
        <Msg msg={rtMsg} />

        {/* Form tambah */}
        <form onSubmit={tambahRt} className="flex gap-2">
          <input
            value={newNama}
            onChange={e => setNewNama(e.target.value)}
            placeholder="Nama RT baru, misal: RT 003"
            className="input flex-1"
            required
          />
          <button type="submit" disabled={addBusy || !newNama.trim()} className="btn-primary" style={{ flexShrink: 0 }}>
            {addBusy ? "…" : "+ Tambah"}
          </button>
        </form>

        {/* List RT */}
        {rts.length === 0 ? (
          <Empty text="Belum ada RT di bawah RW ini." />
        ) : (
          <div className="divide-y rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-muted)" }}>
            {rts.map(rt => (
              <div key={rt.id} className="px-3 py-2.5">
                {editId === rt.id ? (
                  /* Mode edit inline */
                  <div className="flex gap-2 items-center">
                    <input
                      autoFocus
                      value={editNama}
                      onChange={e => setEditNama(e.target.value)}
                      className="input flex-1"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.875rem" }}
                      onKeyDown={e => { if (e.key === "Escape") setEditId(null); }}
                    />
                    <button
                      type="button"
                      onClick={() => saveEditRt(rt.id)}
                      disabled={!editNama.trim()}
                      className="btn-primary"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", flexShrink: 0 }}>
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="btn-ghost"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", flexShrink: 0 }}>
                      Batal
                    </button>
                  </div>
                ) : (
                  /* Mode tampil */
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)", flexShrink: 0 }}>
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
                      <path d="M9 21V12h6v9" />
                    </svg>
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--text)" }}>{rt.nama}</span>
                    <button
                      type="button"
                      onClick={() => { setEditId(rt.id); setEditNama(rt.nama); setRtMsg(null); }}
                      className="btn-ghost"
                      style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem" }}>
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => hapusRt(rt.id, rt.nama)}
                      className="btn-danger"
                      style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem" }}>
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          RT hanya bisa dihapus jika belum memiliki rumah terdaftar.
        </p>
      </div>
    </div>
  );
}
