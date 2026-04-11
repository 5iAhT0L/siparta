"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Msg, Field, PageHeader } from "@/lib/ui";

export default function PengaturanPage() {
  const { user, loading, apiFetch } = useAuth();
  const [bank, setBank]     = useState("");
  const [noRek, setNoRek]   = useState("");
  const [namaRek, setNamaRek] = useState("");
  const [offsets, setOffsets] = useState("3,1,0");
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!loading && user?.role === "pengurus_rt") {
      apiFetch("/api/rt-settings").then(r => r.json()).then(d => {
        if (!d.error) { setBank(d.bankName ?? ""); setNoRek(d.bankAccountNumber ?? ""); setNamaRek(d.bankAccountName ?? ""); if (Array.isArray(d.reminderOffsets)) setOffsets(d.reminderOffsets.join(",")); }
      });
    }
  }, [user, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const off = offsets.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const res = await apiFetch("/api/rt-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankName: bank || undefined, bankAccountNumber: noRek || undefined, bankAccountName: namaRek || undefined, reminderOffsets: off.length ? off : undefined }) });
    const d = await res.json().catch(() => ({})); setMsg({ text: res.ok ? "Pengaturan disimpan." : (d.error ?? "Gagal"), ok: res.ok });
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <PageHeader title="Pengaturan RT" />
      <Msg msg={msg} />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">Info Rekening Bank</h2>
          <Field label="Nama Bank"><input value={bank} onChange={e => setBank(e.target.value)} placeholder="BCA, BRI, Mandiri…" className="input" /></Field>
          <Field label="Nomor Rekening"><input value={noRek} onChange={e => setNoRek(e.target.value)} className="input" style={{ fontFamily: "var(--font-mono)" }} /></Field>
          <Field label="Nama Pemilik Rekening"><input value={namaRek} onChange={e => setNamaRek(e.target.value)} className="input" /></Field>
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">Reminder Otomatis</h2>
          <Field label="Kirim reminder H-N (pisahkan koma)">
            <input value={offsets} onChange={e => setOffsets(e.target.value)} placeholder="3,1,0" className="input" />
          </Field>
          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>Contoh: <code>3,1,0</code> = kirim 3 hari sebelum, 1 hari sebelum, dan hari H jatuh tempo.</p>
        </div>
        <button type="submit" className="btn-primary w-full justify-center" style={{ width: "100%" }}>Simpan Pengaturan</button>
      </form>
    </div>
  );
}
