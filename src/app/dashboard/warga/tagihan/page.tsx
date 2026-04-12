"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, StatusBadge, PageHeader } from "@/lib/ui";

async function compress(file: File, maxBytes = 1 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.onload = () => {
      const raw = reader.result as string;
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        if ((raw.length * 3) / 4 > maxBytes) reject(new Error("PDF melebihi 1 MB"));
        else resolve(raw);
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1920;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > MAX_DIM || h > MAX_DIM) { const r = Math.min(MAX_DIM / w, MAX_DIM / h); w = Math.round(w * r); h = Math.round(h * r); }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        let q = 0.85, out = canvas.toDataURL("image/jpeg", q);
        while ((out.length * 3) / 4 > maxBytes && q > 0.15) { q = Math.round((q - 0.1) * 100) / 100; out = canvas.toDataURL("image/jpeg", q); }
        if ((out.length * 3) / 4 > maxBytes) reject(new Error("Gambar terlalu besar"));
        else resolve(out);
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

type Tagihan = { id: string; periode: string; status: string; nominal: number; jatuhTempo?: string; jenisIuran: { nama: string } };
type Settings = { bankName?: string; bankAccountNumber?: string; bankAccountName?: string };

export default function WargaTagihanPage() {
  const { user, loading, apiFetch } = useAuth();
  const [tagihan, setTagihan]     = useState<Tagihan[]>([]);
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [selected, setSelected]   = useState<Tagihan | null>(null);
  const [metode, setMetode]       = useState<"transfer_manual" | "cash">("transfer_manual");
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [catatan, setCatatan]     = useState("");
  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy]           = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  async function load() {
    const [t, s] = await Promise.all([apiFetch("/api/iuran/tagihan").then(r => r.json()), apiFetch("/api/rt-settings").then(r => r.json())]);
    setTagihan(Array.isArray(t) ? t : []);
    setSettings(s.error ? null : s);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "warga") load(); }, [user, loading]);

  async function pay(e: FormEvent) {
    e.preventDefault(); if (!selected) return;
    setMsg(null); setBusy(true);
    let buktiUrl: string | undefined;
    if (metode === "transfer_manual" && file) {
      let dataUrl: string;
      try { dataUrl = await compress(file); } catch (e) { setMsg({ text: (e as Error).message, ok: false }); setBusy(false); return; }
      const up = await apiFetch("/api/pembayaran/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl }) });
      const ud = await up.json().catch(() => ({}));
      if (!up.ok) { setMsg({ text: ud.error ?? "Gagal upload bukti", ok: false }); setBusy(false); return; }
      buktiUrl = ud.url;
    }
    const res = await apiFetch("/api/pembayaran/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tagihanId: selected.id, nominal: selected.nominal, metode, buktiFile: buktiUrl, catatan: catatan || undefined }) });
    const d = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal submit", ok: false }); return; }
    setMsg({ text: "Pembayaran dikirim! Tunggu verifikasi Pengurus RT.", ok: true });
    setSelected(null); setFile(null); setCatatan(""); if (fileRef.current) fileRef.current.value = ""; load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "warga") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <PageHeader title="Tagihan Saya" />

      {settings && (settings.bankAccountNumber || settings.bankName) && (
        <div className="card-green mb-4">
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--primary)" }}>Info Pembayaran Transfer</div>
          {settings.bankName && <div className="text-sm font-medium">{settings.bankName}</div>}
          {settings.bankAccountNumber && <div className="text-base font-bold" style={{ fontFamily: "var(--font-mono)" }}>{settings.bankAccountNumber}</div>}
          {settings.bankAccountName && <div className="text-sm" style={{ color: "var(--text-muted)" }}>{settings.bankAccountName}</div>}
        </div>
      )}

      {tagihan.length === 0 && <Empty text="Tidak ada tagihan untuk rumah Anda." />}

      <div className="space-y-3">
        {tagihan.map(t => (
          <div key={t.id} className="card">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-sm">{t.jenisIuran.nama}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.periode}</div>
                <div className="font-bold mt-1">Rp {Number(t.nominal).toLocaleString("id-ID")}</div>
                {t.jatuhTempo && <div className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>Jatuh tempo: {new Date(t.jatuhTempo).toLocaleDateString("id-ID")}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={t.status} />
                {t.status === "belum_bayar" && (
                  <button type="button" onClick={() => { setSelected(t); setMsg(null); }} className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Bayar</button>
                )}
              </div>
            </div>

            {selected?.id === t.id && (
              <form onSubmit={pay} className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--border-muted)" }}>
                <div className="text-sm font-semibold">Form Pembayaran</div>
                <Field label="Metode">
                  <select value={metode} onChange={e => setMetode(e.target.value as "transfer_manual" | "cash")} className="input">
                    <option value="transfer_manual">Transfer Bank</option>
                    <option value="cash">Bayar Langsung (Cash)</option>
                  </select>
                </Field>
                {metode === "transfer_manual" && (
                  <div>
                    <div className="text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Bukti Transfer</div>
                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        setFile(f);
                        setPreview(f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
                      }} />
                    <div
                      role="button" tabIndex={0}
                      onClick={() => fileRef.current?.click()}
                      onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.setAttribute("data-drag", "1"); }}
                      onDragLeave={e => e.currentTarget.removeAttribute("data-drag")}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.removeAttribute("data-drag");
                        const f = e.dataTransfer.files?.[0];
                        if (f) {
                          setFile(f);
                          setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
                        }
                      }}
                      className="w-full rounded-lg border-2 border-dashed transition-colors cursor-pointer select-none overflow-hidden"
                      style={{
                        borderColor: file ? "var(--primary)" : "var(--border)",
                        background: file ? "var(--primary-light)" : "var(--surface-2)",
                      }}>
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="preview" className="w-full max-h-48 object-contain" style={{ display: "block" }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-4 text-sm font-medium"
                          style={{ color: file ? "var(--primary-dark)" : "var(--text-muted)" }}>
                          <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{file ? "📎" : "⬆"}</span>
                          <span className="truncate max-w-full">{file ? file.name : "Klik atau seret file ke sini"}</span>
                          {!file && <span className="text-xs font-normal" style={{ color: "var(--text-subtle)" }}>JPG, PNG, atau PDF</span>}
                        </div>
                      )}
                    </div>
                    {file && (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{file.name}</span>
                        <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="ml-2 text-xs flex-shrink-0" style={{ color: "var(--danger)", textDecoration: "underline" }}>
                          Hapus
                        </button>
                      </div>
                    )}
                    <div className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>Dikompres otomatis sebelum dikirim</div>
                  </div>
                )}
                <Field label="Catatan (opsional)"><input value={catatan} onChange={e => setCatatan(e.target.value)} className="input" /></Field>
                <Msg msg={msg} />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className="btn-primary" style={{ flex: 1 }}>{busy ? "Mengirim…" : "Kirim Pembayaran"}</button>
                  <button type="button" onClick={() => setSelected(null)} className="btn-ghost">Batal</button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
