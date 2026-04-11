"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader, StatusBadge } from "@/lib/ui";

type Rumah   = { id: string; nomorRumah: string; alamat?: string; kontak?: string; tipeHunian: string; status: string; _count: { kk: number; users: number } };
type KK      = { id: string; noKk: string; namaKepalaKeluarga: string; fotoKkUrl?: string | null };
type FotoKtp = { id: string; url: string };

/* ─────────────────────────────────────────────
   Kompresi gambar client-side → maks 1 MB JPEG
   PDF: lewati kompresi, hanya cek ukuran
───────────────────────────────────────────── */
async function compress(file: File, maxBytes = 1 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.onload = () => {
      const raw = reader.result as string;

      // PDF — tidak bisa dikompresi lewat canvas
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const approx = (raw.length * 3) / 4;
        if (approx > maxBytes) reject(new Error("PDF melebihi 1 MB, kompres terlebih dahulu"));
        else resolve(raw);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1920;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > MAX_DIM || h > MAX_DIM) {
          const r = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

        // Turunkan kualitas sampai < maxBytes
        let q = 0.85;
        let out = canvas.toDataURL("image/jpeg", q);
        while ((out.length * 3) / 4 > maxBytes && q > 0.15) {
          q = Math.round((q - 0.1) * 100) / 100;
          out = canvas.toDataURL("image/jpeg", q);
        }
        if ((out.length * 3) / 4 > maxBytes) reject(new Error("Gambar terlalu besar, coba foto dengan resolusi lebih rendah"));
        else resolve(out);
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

/* ─────────────────────────────────────────────
   Upload foto KK (tunggal)
───────────────────────────────────────────── */
function FotoKkUploader({ kk, onDone }: { kk: KK; onDone: (url: string | null) => void }) {
  const { apiFetch } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  const displayUrl = localUrl ?? kk.fotoKkUrl ?? null;

  async function handleFile(file: File) {
    setErr(null); setBusy(true);
    try {
      const dataUrl = await compress(file);
      const res = await apiFetch(`/api/kk/${kk.id}/foto`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal upload");
      setLocalUrl(null);
      onDone(data.fotoKkUrl);
    } catch (e) { setErr((e as Error).message); setLocalUrl(null); }
    finally { setBusy(false); }
  }

  async function hapus() {
    if (!confirm("Hapus foto KK?")) return;
    setBusy(true);
    const res = await apiFetch(`/api/kk/${kk.id}/foto`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onDone(null);
  }

  return (
    <div className="mt-1.5">
      {displayUrl ? (
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-muted)" }}>
          <a href={displayUrl} target="_blank" rel="noreferrer">
            <img src={displayUrl} alt="Foto KK" className="w-full max-h-40 object-contain block"
              style={{ background: "var(--surface-2)" }} />
          </a>
          <div className="flex gap-3 px-2 py-1.5" style={{ borderTop: "1px solid var(--border-muted)" }}>
            <button type="button" onClick={() => ref.current?.click()} disabled={busy}
              className="text-xs" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
              {busy ? "Mengupload…" : "Ganti"}
            </button>
            <button type="button" onClick={hapus} disabled={busy}
              className="text-xs" style={{ color: "var(--danger)", textDecoration: "underline" }}>
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed py-2.5 text-xs font-medium"
          style={{ borderColor: "var(--border)", color: busy ? "var(--text-subtle)" : "var(--primary)", background: "var(--surface-2)" }}>
          {busy ? "Mengupload…" : "⬆ Upload Foto KK"}
        </button>
      )}
      {err && <div className="mt-1 text-xs" style={{ color: "var(--danger)" }}>{err}</div>}
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) {
            if (f.type.startsWith("image/")) setLocalUrl(URL.createObjectURL(f));
            handleFile(f);
          }
          e.target.value = "";
        }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Manajemen foto KTP (multi, tiap ada judul)
───────────────────────────────────────────── */
function FotoKtpManager({ kkId }: { kkId: string }) {
  const { apiFetch } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const [list, setList]     = useState<FotoKtp[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  async function load() {
    const d = await apiFetch(`/api/kk/${kkId}/ktp`).then(r => r.json());
    setList(Array.isArray(d) ? d : []);
    setLoaded(true);
  }

  function toggle() {
    if (!loaded) load();
    setOpen(o => !o);
  }

  async function handleFile(file: File) {
    setErr(null); setBusy(true);
    try {
      const dataUrl = await compress(file);
      const res = await apiFetch(`/api/kk/${kkId}/ktp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal upload");
      setList(prev => [...prev, data]);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function hapus(fotoId: string) {
    if (!confirm("Hapus foto KTP ini?")) return;
    const res = await apiFetch(`/api/kk/${kkId}/ktp/${fotoId}`, { method: "DELETE" });
    if (res.ok) setList(prev => prev.filter(f => f.id !== fotoId));
  }

  return (
    <div className="mt-2" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "0.5rem" }}>
      <button type="button" onClick={toggle}
        className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {open ? "▾" : "▸"} Foto KTP {loaded && list.length > 0 ? `(${list.length})` : ""}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {list.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {list.map((f, i) => (
                <div key={f.id} className="relative rounded-lg overflow-hidden border group"
                  style={{ borderColor: "var(--border-muted)", aspectRatio: "1" }}>
                  <a href={f.url} target="_blank" rel="noreferrer">
                    <img src={f.url} alt={`KTP ${i + 1}`}
                      className="w-full h-full object-cover block"
                      style={{ background: "var(--surface-2)" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </a>
                  <button type="button" onClick={() => hapus(f.id)}
                    className="absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-xs font-bold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    style={{ background: "var(--danger)", color: "#fff" }}>
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}>
                    KTP {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {list.length === 0 && (
            <div className="text-xs" style={{ color: "var(--text-subtle)" }}>Belum ada foto KTP.</div>
          )}

          {err && <div className="text-xs" style={{ color: "var(--danger)" }}>{err}</div>}

          <button type="button" onClick={() => ref.current?.click()} disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed py-2 text-xs font-medium"
            style={{ borderColor: "var(--border)", color: busy ? "var(--text-subtle)" : "var(--primary)", background: "var(--surface-2)" }}>
            {busy ? "Mengupload…" : "+ Tambah Foto KTP"}
          </button>

          <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function RumahPage() {
  const { user, loading, apiFetch } = useAuth();
  const [list, setList]       = useState<Rumah[]>([]);
  const [show, setShow]       = useState(false);
  const [edit, setEdit]       = useState<Rumah | null>(null);
  const [msg, setMsg]         = useState<{ text: string; ok: boolean } | null>(null);
  const [expId, setExpId]     = useState<string | null>(null);
  const [kkList, setKkList]   = useState<KK[]>([]);
  const [showKk, setShowKk]   = useState(false);
  const [noRumah, setNoRumah] = useState("");
  const [alamat, setAlamat]   = useState("");
  const [kontak, setKontak]   = useState("");
  const [tipe, setTipe]       = useState("milik");
  const [status, setStatus]   = useState("aktif");
  const [noKk, setNoKk]       = useState("");
  const [namaKK, setNamaKK]   = useState("");

  const load    = async () => { const d = await apiFetch("/api/rumah").then(r => r.json()); setList(Array.isArray(d) ? d : []); };
  const loadKk  = async (id: string) => { const d = await apiFetch(`/api/rumah/${id}/kk`).then(r => r.json()); setKkList(Array.isArray(d) ? d : []); };

  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading]);

  function openCreate() { setEdit(null); setNoRumah(""); setAlamat(""); setKontak(""); setTipe("milik"); setStatus("aktif"); setShow(true); setMsg(null); }
  function openEdit(r: Rumah) { setEdit(r); setNoRumah(r.nomorRumah); setAlamat(r.alamat ?? ""); setKontak(r.kontak ?? ""); setTipe(r.tipeHunian); setStatus(r.status); setShow(true); setMsg(null); }

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const res = await apiFetch(edit ? `/api/rumah/${edit.id}` : "/api/rumah", {
      method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomorRumah: noRumah, alamat: alamat || undefined, kontak: kontak || undefined, tipeHunian: tipe, status }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: edit ? "Diperbarui." : "Rumah ditambah.", ok: true }); setShow(false); load();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus rumah ini?")) return;
    const res = await apiFetch(`/api/rumah/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? "Dihapus." : (d.error ?? "Gagal"), ok: res.ok });
    if (res.ok) load();
  }

  async function expandRumah(id: string) {
    if (expId === id) { setExpId(null); return; }
    setExpId(id); setShowKk(false); loadKk(id);
  }

  async function addKk(e: { preventDefault(): void }) {
    e.preventDefault();
    const res = await apiFetch(`/api/rumah/${expId}/kk`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noKk, namaKepalaKeluarga: namaKK }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: "KK ditambahkan.", ok: true }); setNoKk(""); setNamaKK(""); setShowKk(false);
    loadKk(expId!); load();
  }

  async function hapusKk(id: string) {
    if (!confirm("Hapus KK ini? Akun warga terkait ikut terhapus.")) return;
    const res = await apiFetch(`/api/kk/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    setMsg({ text: res.ok ? "KK dihapus." : (d.error ?? "Gagal"), ok: res.ok });
    if (res.ok) { loadKk(expId!); load(); }
  }

  function updateFotoKk(kkId: string, url: string | null) {
    setKkList(prev => prev.map(k => k.id === kkId ? { ...k, fotoKkUrl: url } : k));
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Data Rumah" action={<button type="button" onClick={openCreate} className="btn-primary">+ Tambah</button>} />
      <Msg msg={msg} />

      {show && (
        <form onSubmit={onSubmit} className="card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">{edit ? "Edit" : "Tambah"} Rumah</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="No. Rumah"><input required value={noRumah} onChange={e => setNoRumah(e.target.value)} className="input" /></Field>
            <Field label="Kontak"><input value={kontak} onChange={e => setKontak(e.target.value)} className="input" /></Field>
          </div>
          <Field label="Alamat"><input value={alamat} onChange={e => setAlamat(e.target.value)} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipe Hunian">
              <select value={tipe} onChange={e => setTipe(e.target.value)} className="input">
                <option value="milik">Milik</option><option value="kontrak">Kontrak</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value)} className="input">
                <option value="aktif">Aktif</option><option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">Simpan</button>
            <button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {list.map(r => (
          <div key={r.id} className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm">Rumah {r.nomorRumah}</div>
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                  <span className={`badge ${r.tipeHunian === "milik" ? "badge-green" : "badge-yellow"}`}>{r.tipeHunian}</span>
                  <StatusBadge status={r.status} />
                  <span className="text-xs" style={{ color: "var(--text-subtle)" }}>{r._count.kk} KK · {r._count.users} akun</span>
                </div>
                {r.alamat && <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-subtle)" }}>{r.alamat}</div>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => expandRumah(r.id)} className="btn-ghost" style={{ padding: "0.2rem 0.45rem", fontSize: "0.68rem" }}>{expId === r.id ? "Tutup" : "KK"}</button>
                <button type="button" onClick={() => openEdit(r)} className="btn-ghost" style={{ padding: "0.2rem 0.45rem", fontSize: "0.68rem" }}>Edit</button>
                <button type="button" onClick={() => hapus(r.id)} className="btn-danger" style={{ padding: "0.2rem 0.45rem", fontSize: "0.68rem" }}>Hapus</button>
              </div>
            </div>

            {expId === r.id && (
              <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid var(--border-muted)", background: "var(--surface-2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Kartu Keluarga</span>
                  <button type="button" onClick={() => setShowKk(!showKk)} className="text-xs font-medium" style={{ color: "var(--primary)" }}>+ Tambah KK</button>
                </div>

                {showKk && (
                  <form onSubmit={addKk} className="space-y-2 mb-3">
                    <input required placeholder="No. KK (16 digit)" value={noKk} onChange={e => setNoKk(e.target.value)} maxLength={16} className="input" />
                    <input required placeholder="Nama Kepala Keluarga" value={namaKK} onChange={e => setNamaKK(e.target.value)} className="input" />
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Simpan</button>
                      <button type="button" onClick={() => setShowKk(false)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>Batal</button>
                    </div>
                  </form>
                )}

                {kkList.length === 0 ? (
                  <div className="text-xs py-2 text-center" style={{ color: "var(--text-subtle)" }}>Belum ada KK.</div>
                ) : (
                  <div className="space-y-2">
                    {kkList.map(kk => (
                      <div key={kk.id} className="rounded-lg px-3 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--border-muted)" }}>
                        {/* Header KK */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{kk.namaKepalaKeluarga}</span>
                            <span className="ml-1.5 text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>{kk.noKk}</span>
                          </div>
                          <button type="button" onClick={() => hapusKk(kk.id)}
                            className="text-xs flex-shrink-0" style={{ color: "var(--danger)", textDecoration: "underline" }}>
                            Hapus KK
                          </button>
                        </div>

                        {/* Foto KK */}
                        <div className="mt-1" style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "0.5rem" }}>
                          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Foto KK</span>
                          <FotoKkUploader kk={kk} onDone={url => updateFotoKk(kk.id, url)} />
                        </div>

                        {/* Foto KTP */}
                        <FotoKtpManager kkId={kk.id} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {list.length === 0 && !show && <Empty text="Belum ada data rumah." />}
    </div>
  );
}
