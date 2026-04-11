"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, StatusBadge, PageHeader } from "@/lib/ui";

type Tagihan = {
  id: string;
  periode: string;
  status: string;
  nominal: number;
  jatuhTempo?: string;
  jenisIuran: { nama: string; tipe: string };
  rumah: { nomorRumah: string; kk: { namaKepalaKeluarga: string }[] };
};
type JenisIuran = { id: string; nama: string; tipe: string };

export default function TagihanPage() {
  const { user, loading, apiFetch } = useAuth();
  const [tagihan, setTagihan]   = useState<Tagihan[]>([]);
  const [jenis, setJenis]       = useState<JenisIuran[]>([]);
  const [periode, setPeriode]   = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; });
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy]         = useState(false);
  const [selJenis, setSelJenis] = useState("");
  const [search, setSearch]     = useState("");

  async function load() {
    const [t, j] = await Promise.all([
      apiFetch(`/api/iuran/tagihan?periode=${periode}`).then(r => r.json()),
      apiFetch("/api/iuran/jenis").then(r => r.json()),
    ]);
    setTagihan(Array.isArray(t) ? t : []);
    setJenis(Array.isArray(j) ? j : []);
  }

  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading, periode]);

  async function generate(tipe: "bulanan" | "insidental") {
    setBusy(true); setMsg(null);
    if (tipe === "insidental" && !selJenis) { setMsg({ text: "Pilih jenis iuran insidental.", ok: false }); setBusy(false); return; }
    const res = await apiFetch("/api/iuran/tagihan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tipe === "bulanan" ? { mode: "bulanan", periode } : { mode: "insidental", iuranId: selJenis }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      const n = tipe === "bulanan" ? (d.inserted ?? 0) : (d.count ?? 0);
      setMsg({ text: n > 0 ? `${n} tagihan ${tipe} berhasil dibuat.` : `Tagihan ${tipe} sudah ada untuk semua rumah aktif.`, ok: true });
      load();
    } else {
      setMsg({ text: d.error ?? "Gagal generate", ok: false });
    }
    setBusy(false);
  }

  async function hapus(id: string, label: string) {
    if (!confirm(`Hapus tagihan "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setMsg(null);
    const res  = await apiFetch(`/api/iuran/tagihan/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: data.error ?? "Gagal menghapus", ok: false }); return; }
    setMsg({ text: "Tagihan berhasil dihapus.", ok: true });
    load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  const insidJenis = jenis.filter(j => j.tipe === "insidental");

  // Filter client-side berdasarkan search (nomor rumah atau nama KK)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tagihan;
    return tagihan.filter(t =>
      t.rumah.nomorRumah.toLowerCase().includes(q) ||
      (t.rumah.kk[0]?.namaKepalaKeluarga ?? "").toLowerCase().includes(q)
    );
  }, [tagihan, search]);

  const lunas   = filtered.filter(t => t.status === "lunas").length;
  const belum   = filtered.filter(t => t.status === "belum_bayar").length;
  const pending = filtered.filter(t => t.status === "pending").length;

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto">
      <PageHeader title="Tagihan" />

      {/* Controls generate */}
      <div className="card mb-3 flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          Periode
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)} className="input" style={{ width: 160 }} />
        </label>
        <button type="button" disabled={busy} onClick={() => generate("bulanan")} className="btn-primary">
          Generate Bulanan
        </button>
        {insidJenis.length > 0 && (
          <>
            <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Iuran Insidental
              <select value={selJenis} onChange={e => setSelJenis(e.target.value)} className="input" style={{ width: 200 }}>
                <option value="">— pilih —</option>
                {insidJenis.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select>
            </label>
            <button type="button" disabled={busy} onClick={() => generate("insidental")} className="btn-ghost">
              Generate Insidental
            </button>
          </>
        )}
      </div>

      <Msg msg={msg} />

      {/* Search */}
      <div className="mb-3 relative">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="No rumah / nama…"
          className="input"
          style={{ paddingLeft: "2.25rem" }}
        />
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-4">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{filtered.length}</div></div>
          <div className="stat-card green"><div className="stat-label">Lunas</div><div className="stat-value" style={{ color: "var(--primary)" }}>{lunas}</div></div>
          <div className="stat-card"><div className="stat-label">Belum Bayar</div><div className="stat-value" style={{ color: "var(--danger)" }}>{belum}</div></div>
          <div className="stat-card"><div className="stat-label">Menunggu</div><div className="stat-value" style={{ color: "var(--warning)" }}>{pending}</div></div>
        </div>
      )}

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <Empty text={search ? "Tidak ada tagihan yang cocok dengan pencarian." : "Belum ada tagihan untuk periode ini."} />
        ) : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Rumah</th><th>Nama</th><th>Iuran</th>
                    <th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td className="font-medium">{t.rumah.nomorRumah}</td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {t.rumah.kk[0]?.namaKepalaKeluarga ?? "—"}
                      </td>
                      <td>
                        <div style={{ color: "var(--text-muted)" }}>{t.jenisIuran.nama}</div>
                        {t.jenisIuran.tipe === "insidental" && (
                          <div className="text-xs" style={{ color: "var(--warning)" }}>insidental</div>
                        )}
                      </td>
                      <td>Rp {Number(t.nominal).toLocaleString("id-ID")}</td>
                      <td style={{ color: "var(--text-subtle)" }}>
                        {t.jatuhTempo ? new Date(t.jatuhTempo).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {t.status !== "lunas" && (
                          <button type="button"
                            onClick={() => hapus(t.id, `${t.rumah.nomorRumah} – ${t.jenisIuran.nama}`)}
                            className="btn-danger" style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem" }}>
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="sm:hidden divide-y" style={{ borderColor: "var(--border-muted)" }}>
              {filtered.map(t => (
                <div key={t.id} className="px-4 py-3 space-y-1.5">
                  {/* Baris 1: rumah + status + hapus */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                        No. {t.rumah.nomorRumah}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.status !== "lunas" && (
                      <button type="button"
                        onClick={() => hapus(t.id, `${t.rumah.nomorRumah} – ${t.jenisIuran.nama}`)}
                        className="btn-danger flex-shrink-0"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.55rem" }}>
                        Hapus
                      </button>
                    )}
                  </div>
                  {/* Baris 2: nama KK */}
                  {t.rumah.kk[0]?.namaKepalaKeluarga && (
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.rumah.kk[0].namaKepalaKeluarga}
                    </div>
                  )}
                  {/* Baris 3: iuran + nominal */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.jenisIuran.nama}
                      {t.jenisIuran.tipe === "insidental" && (
                        <span className="ml-1" style={{ color: "var(--warning)" }}>· insidental</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--text)" }}>
                      Rp {Number(t.nominal).toLocaleString("id-ID")}
                    </div>
                  </div>
                  {/* Baris 4: jatuh tempo (jika ada) */}
                  {t.jatuhTempo && (
                    <div className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      Jatuh tempo: {new Date(t.jatuhTempo).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
