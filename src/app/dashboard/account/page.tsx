"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Msg, Field, PageHeader } from "@/lib/ui";

/* ── Password input dengan toggle show/hide ── */
function PasswordInput({ value, onChange, placeholder, autoComplete }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input"
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        style={{
          position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: "var(--text-subtle)", lineHeight: 1,
        }}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? (
          /* eye-off */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* eye */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── Main page ── */
export default function AccountPage() {
  const { user, loading, apiFetch, updateUser } = useAuth();

  // Nama form
  const [nama, setNama]         = useState("");
  const [namaMsg, setNamaMsg]   = useState<{ text: string; ok: boolean } | null>(null);
  const [namaBusy, setNamaBusy] = useState(false);

  // Password form
  const [oldPw, setOldPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [pwBusy, setPwBusy]     = useState(false);

  // Isi default nama dari user saat pertama kali tersedia
  const [namaInit, setNamaInit] = useState(false);
  if (user && !namaInit) { setNama(user.nama); setNamaInit(true); }

  if (loading || !user) return <Loader />;

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return;
    setNamaMsg(null); setNamaBusy(true);
    const res  = await apiFetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: nama.trim() }) });
    const data = await res.json().catch(() => ({}));
    setNamaBusy(false);
    if (!res.ok) { setNamaMsg({ text: data.error ?? "Gagal menyimpan", ok: false }); return; }
    updateUser({ nama: data.user.nama });
    setNamaMsg({ text: "Nama berhasil diperbarui.", ok: true });
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) { setPwMsg({ text: "Konfirmasi password tidak cocok", ok: false }); return; }
    if (newPw.length < 8)    { setPwMsg({ text: "Password baru minimal 8 karakter", ok: false }); return; }
    setPwBusy(true);
    const res  = await apiFetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }) });
    const data = await res.json().catch(() => ({}));
    setPwBusy(false);
    if (!res.ok) { setPwMsg({ text: data.error ?? "Gagal mengubah password", ok: false }); return; }
    setPwMsg({ text: "Password berhasil diubah.", ok: true });
    setOldPw(""); setNewPw(""); setConfirmPw("");
  }

  const roleLabel = user.role === "pengurus_rt" ? "Pengurus RT"
    : user.role === "pengurus_rw" ? "Pengurus RW"
    : "Warga";

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <PageHeader title="Akun Saya" />

      {/* Info akun */}
      <div className="card mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: "var(--primary)" }}>
          {user.nama[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <div className="font-semibold" style={{ color: "var(--text)" }}>{user.nama}</div>
          <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>@{user.username}</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{roleLabel}</div>
        </div>
      </div>

      {/* Form ubah nama */}
      <div className="card mb-4 space-y-3">
        <h2 className="font-semibold text-sm">Ubah Nama Tampilan</h2>
        <Msg msg={namaMsg} />
        <form onSubmit={saveName} className="space-y-3">
          <Field label="Nama">
            <input
              className="input"
              value={nama}
              onChange={e => setNama(e.target.value)}
              required
              placeholder="Nama lengkap"
              autoComplete="name"
            />
          </Field>
          <button type="submit" disabled={namaBusy || nama.trim() === user.nama} className="btn-primary" style={{ minWidth: 120 }}>
            {namaBusy ? "Menyimpan…" : "Simpan Nama"}
          </button>
        </form>
      </div>

      {/* Form ubah password */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-sm">Ubah Password</h2>
        <Msg msg={pwMsg} />
        <form onSubmit={savePassword} className="space-y-3">
          <Field label="Password Lama">
            <PasswordInput
              value={oldPw}
              onChange={setOldPw}
              placeholder="Masukkan password lama"
              autoComplete="current-password"
            />
          </Field>
          <Field label="Password Baru (min. 8 karakter)">
            <PasswordInput
              value={newPw}
              onChange={setNewPw}
              placeholder="Password baru"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <PasswordInput
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />
          </Field>
          <button type="submit" disabled={pwBusy || !oldPw || !newPw || !confirmPw} className="btn-primary" style={{ minWidth: 140 }}>
            {pwBusy ? "Menyimpan…" : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
