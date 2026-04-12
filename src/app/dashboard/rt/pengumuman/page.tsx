"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader, Denied, Empty, Msg, Field, PageHeader } from "@/lib/ui";

type Pengumuman = { id: string; title: string; content: string; postedAt: string; createdBy: { nama: string } };

export default function PengumumanPage() {
  const { user, loading, apiFetch } = useAuth();
  const [list, setList]   = useState<Pengumuman[]>([]);
  const [show, setShow]   = useState(false);
  const [edit, setEdit]   = useState<Pengumuman | null>(null);
  const [msg, setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody]   = useState("");

  const load = async () => { const d = await apiFetch("/api/announcements").then(r => r.json()); setList(Array.isArray(d) ? d : []); };
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (!loading && user?.role === "pengurus_rt") load(); }, [user, loading]);

  function openCreate() { setEdit(null); setTitle(""); setBody(""); setShow(true); setMsg(null); }
  function openEdit(p: Pengumuman) { setEdit(p); setTitle(p.title); setBody(p.content); setShow(true); setMsg(null); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await apiFetch(edit ? `/api/announcements/${edit.id}` : "/api/announcements", { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content: body }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg({ text: d.error ?? "Gagal", ok: false }); return; }
    setMsg({ text: edit ? "Diperbarui." : "Pengumuman diterbitkan.", ok: true }); setShow(false); load();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    const res = await apiFetch(`/api/announcements/${id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({})); setMsg({ text: res.ok ? "Dihapus." : (d.error ?? "Gagal"), ok: res.ok }); if (res.ok) load();
  }

  if (loading || !user) return <Loader />;
  if (user.role !== "pengurus_rt") return <Denied />;

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <PageHeader title="Pengumuman" action={<button type="button" onClick={openCreate} className="btn-primary">+ Buat</button>} />
      <Msg msg={msg} />

      {show && (
        <form onSubmit={onSubmit} className="card mb-4 space-y-3">
          <h2 className="font-semibold text-sm">{edit ? "Edit" : "Buat"} Pengumuman</h2>
          <Field label="Judul"><input required value={title} onChange={e => setTitle(e.target.value)} className="input" /></Field>
          <Field label="Konten"><textarea required value={body} onChange={e => setBody(e.target.value)} rows={5} className="input" /></Field>
          <div className="flex gap-2 pt-1"><button type="submit" className="btn-primary">Publish</button><button type="button" onClick={() => setShow(false)} className="btn-ghost">Batal</button></div>
        </form>
      )}

      <div className="space-y-3">
        {list.map(p => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="font-semibold text-sm">{p.title}</div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => openEdit(p)} className="btn-ghost" style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}>Edit</button>
                <button type="button" onClick={() => hapus(p.id)} className="btn-danger" style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}>Hapus</button>
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>{p.content}</div>
            <div className="mt-2 text-xs" style={{ color: "var(--text-subtle)" }}>
              {new Date(p.postedAt).toLocaleString("id-ID")} · {p.createdBy.nama}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && !show && <Empty text="Belum ada pengumuman." />}
    </div>
  );
}
