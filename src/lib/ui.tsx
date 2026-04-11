import type { ReactNode } from "react";

export function Loader() {
  return (
    <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--primary)", borderRightColor: "var(--primary)" }} />
        Memuat…
      </div>
    </div>
  );
}

export function Denied() {
  return <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>Akses ditolak.</div>;
}

export function Empty({ text = "Belum ada data." }: { text?: string }) {
  return (
    <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
      {text}
    </div>
  );
}

export function Msg({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <div className="mb-3 rounded-lg px-3 py-2 text-sm font-medium"
      style={{ background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#15803d" : "#991b1b" }}>
      {msg.text}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
    </label>
  );
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    lunas:       { cls: "badge-green",  label: "Lunas" },
    pending:     { cls: "badge-yellow", label: "Menunggu" },
    belum_bayar: { cls: "badge-red",    label: "Belum Bayar" },
    approved:    { cls: "badge-green",  label: "Disetujui" },
    rejected:    { cls: "badge-red",    label: "Ditolak" },
    request_resubmit: { cls: "badge-yellow", label: "Perlu Revisi" },
    aktif:       { cls: "badge-green",  label: "Aktif" },
    tidak_aktif: { cls: "badge-gray",   label: "Tidak Aktif" },
    proses:      { cls: "badge-yellow", label: "Proses" },
    selesai:     { cls: "badge-green",  label: "Selesai" },
  };
  const { cls, label } = map[status] ?? { cls: "badge-gray", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}
