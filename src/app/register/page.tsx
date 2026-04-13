"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type RwRow = { id: string; nama: string; rts: { id: string; nama: string }[] };
type RumahRow = { id: string; nomorRumah: string };

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PwInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
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
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        autoComplete={autoComplete}
        required
        minLength={8}
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        style={{
          position: "absolute",
          right: "0.6rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-subtle)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
        }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

const NEW_ROOM_VALUE = "__new__";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [rwList, setRwList] = useState<RwRow[]>([]);
  const [rtId, setRtId] = useState("");
  const [rumahList, setRumahList] = useState<RumahRow[]>([]);
  const [rumahSel, setRumahSel] = useState(""); // id atau "__new__"
  const [nomorRumah, setNomorRumah] = useState("");
  const [tipeHunian, setTipeHunian] = useState<"milik" | "kontrak">("milik");
  const [kontak, setKontak] = useState("");
  const [noKk, setNoKk] = useState("");
  const [namaKk, setNamaKk] = useState("");
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [noKtp, setNoKtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingRumah, setLoadingRumah] = useState(false);
  const [loadingRw, setLoadingRw] = useState(true);
  const [rwError, setRwError] = useState<string | null>(null);

  const isNewRoom = rumahSel === NEW_ROOM_VALUE;

  // Redirect jika user tidak authenticated atau bukan admin
  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "pengurus_rt" && user.role !== "pengurus_rw")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setLoadingRw(true);
    setRwError(null);
    fetch("/api/public/rw")
      .then((r) => {
        if (!r.ok) throw new Error(`Error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          setRwError("Format data tidak valid");
          setRwList([]);
          return;
        }
        if (data.length === 0) {
          setRwError("Belum ada data RW/RT. Hubungi administrator.");
          setRwList([]);
          return;
        }
        // Filter RW jika user adalah pengurus_rt
        let filtered = data;
        if (user?.role === "pengurus_rt" && user?.rtId) {
          filtered = data
            .map((rw) => ({
              ...rw,
              rts: rw.rts.filter((rt: any) => rt.id === user.rtId),
            }))
            .filter((rw) => rw.rts.length > 0);

          // Jika user adalah pengurus_rt, set RT mereka secara otomatis
          if (filtered.length > 0 && filtered[0].rts.length > 0 && !rtId) {
            setRtId(filtered[0].rts[0].id);
          }
        }
        setRwList(filtered);
        setRwError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch RW list:", err);
        setRwError(`Gagal memuat data RW/RT: ${err.message}`);
        setRwList([]);
      })
      .finally(() => setLoadingRw(false));
  }, [user, rtId]);

  useEffect(() => {
    if (!rtId) {
      setRumahList([]);
      setRumahSel("");
      return;
    }
    setLoadingRumah(true);
    fetch(`/api/public/rt/${rtId}/rumah`)
      .then((r) => r.json())
      .then((d: RumahRow[]) => setRumahList(Array.isArray(d) ? d : []))
      .catch(() => setRumahList([]))
      .finally(() => setLoadingRumah(false));
    setRumahSel("");
  }, [rtId]);

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validasi lokasi
    if (!rtId) {
      setError("Pilih RW / RT terlebih dahulu");
      return;
    }
    if (!rumahSel) {
      setError("Pilih nomor rumah");
      return;
    }

    if (password !== confirmPw) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (noKk.length !== 16) {
      setError("No. KK harus 16 digit");
      return;
    }
    if (isNewRoom && !nomorRumah.trim()) {
      setError("Nomor rumah wajib diisi");
      return;
    }

    const body: Record<string, string> = {
      rtId,
      noKk,
      namaKepalaKeluarga: namaKk,
      nama,
      username,
      noKtp,
      password,
      tipeHunian,
    };
    if (isNewRoom) {
      body.nomorRumah = nomorRumah.trim();
      if (kontak.trim()) body.kontak = kontak.trim();
    } else {
      body.rumahId = rumahSel;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Registrasi gagal");
        return;
      }
      setMessage(
        data.message ?? "Registrasi berhasil. Tunggu verifikasi pengurus RT.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "pengurus_rt" && user.role !== "pengurus_rw")) {
    return null; // Will redirect in useEffect
  }

  const L: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text)",
    display: "block",
    marginBottom: 4,
  };

  if (message) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "0.75rem",
            }}
          >
            Pendaftaran Terkirim!
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: "1.75rem",
            }}
          >
            {message}
          </p>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ display: "inline-flex" }}
          >
            Kembali ke Dashboard
          </Link>
          <p className="text-xs mt-3">
            <Link
              href="/dashboard"
              style={{
                color: "var(--text-subtle)",
                textDecoration: "underline",
              }}
            >
              ← Kembali ke Dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem 1rem 4rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--primary)",
              marginBottom: "0.875rem",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <div
            className="font-bold"
            style={{ fontSize: "1.25rem", color: "var(--text)" }}
          >
            Pendaftaran Warga Baru
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {user?.role === "pengurus_rt"
              ? `Kelola warga di RT Anda`
              : `Kelola pendaftaran warga se-RW`}
          </div>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* ── Lokasi ── */}
            <div>
              <div
                className="text-xs font-bold mb-2"
                style={{
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Lokasi
              </div>
              <div className="space-y-3">
                <div>
                  <label style={L}>
                    RW / RT <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  {loadingRw ? (
                    <div
                      style={{
                        padding: "0.75rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "0.375rem",
                        color: "var(--text-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      Memuat data RW/RT…
                    </div>
                  ) : rwError ? (
                    <div
                      style={{
                        padding: "0.75rem",
                        background: "var(--danger-light)",
                        borderRadius: "0.375rem",
                        color: "var(--danger)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {rwError}
                    </div>
                  ) : (
                    <select
                      className="input"
                      value={rtId}
                      onChange={(e) => setRtId(e.target.value)}
                      required
                      disabled={user?.role === "pengurus_rt"}
                    >
                      <option value="">— Pilih RW / RT —</option>
                      {rwList.flatMap((rw) =>
                        rw.rts.map((rt) => (
                          <option key={rt.id} value={rt.id}>
                            {rw.nama} — {rt.nama}
                          </option>
                        )),
                      )}
                    </select>
                  )}
                </div>

                {rtId && (
                  <div>
                    <label style={L}>
                      No. Rumah{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={rumahSel}
                      onChange={(e) => {
                        setRumahSel(e.target.value);
                        setNomorRumah("");
                      }}
                      required
                      disabled={loadingRumah}
                    >
                      <option value="">
                        {loadingRumah ? "Memuat…" : "— Pilih rumah —"}
                      </option>
                      {rumahList.map((r) => (
                        <option key={r.id} value={r.id}>
                          No. {r.nomorRumah}
                        </option>
                      ))}
                      <option value={NEW_ROOM_VALUE}>
                        + Tambah nomor rumah baru
                      </option>
                    </select>
                  </div>
                )}

                {isNewRoom && (
                  <div
                    className="rounded-lg p-3 space-y-3"
                    style={{
                      background: "var(--primary-light)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "var(--primary-dark)" }}
                    >
                      Rumah baru akan dibuat saat pengurus RT menyetujui
                      pendaftaran Anda
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={L}>
                          No. Rumah{" "}
                          <span style={{ color: "var(--danger)" }}>*</span>
                        </label>
                        <input
                          className="input"
                          value={nomorRumah}
                          onChange={(e) => setNomorRumah(e.target.value)}
                          required
                          placeholder="cth: 12A, 07"
                        />
                      </div>
                      <div>
                        <label style={L}>Tipe Hunian</label>
                        <select
                          className="input"
                          value={tipeHunian}
                          onChange={(e) =>
                            setTipeHunian(e.target.value as "milik" | "kontrak")
                          }
                        >
                          <option value="milik">Milik</option>
                          <option value="kontrak">Kontrak / Sewa</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={L}>
                        No. Kontak{" "}
                        <span
                          style={{
                            color: "var(--text-subtle)",
                            fontWeight: 400,
                          }}
                        >
                          (opsional)
                        </span>
                      </label>
                      <input
                        className="input"
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        placeholder="cth: 08123456789"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-muted)" }} />

            {/* ── Kartu Keluarga ── */}
            <div>
              <div
                className="text-xs font-bold mb-2"
                style={{
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Kartu Keluarga
              </div>
              <div className="space-y-3">
                <div>
                  <label style={L}>
                    No. KK (16 digit){" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    className="input"
                    value={noKk}
                    onChange={(e) =>
                      setNoKk(e.target.value.replace(/\D/g, "").slice(0, 16))
                    }
                    required
                    minLength={16}
                    maxLength={16}
                    placeholder="3201xxxxxxxxxxxxxxxx"
                    style={{
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.05em",
                    }}
                  />
                  {noKk.length > 0 && noKk.length < 16 && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--warning)" }}
                    >
                      {noKk.length}/16 digit
                    </div>
                  )}
                </div>
                <div>
                  <label style={L}>
                    Nama Kepala Keluarga{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    className="input"
                    value={namaKk}
                    onChange={(e) => setNamaKk(e.target.value)}
                    required
                    placeholder="Nama sesuai KK"
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-muted)" }} />

            {/* ── Data Diri ── */}
            <div>
              <div
                className="text-xs font-bold mb-2"
                style={{
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Data Diri
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={L}>
                      Nama Lengkap{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      className="input"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                      placeholder="Nama sesuai KTP"
                    />
                  </div>
                  <div>
                    <label style={L}>
                      Username <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      className="input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Nama pengguna"
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <label style={L}>
                    NIK (16 digit){" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    className="input"
                    value={noKtp}
                    onChange={(e) =>
                      setNoKtp(e.target.value.replace(/\D/g, "").slice(0, 16))
                    }
                    required
                    minLength={16}
                    maxLength={16}
                    placeholder="3171xxxxxxxxxxxxxxxx"
                    style={{
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.05em",
                    }}
                  />
                  {noKtp.length > 0 && noKtp.length < 16 && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--warning)" }}
                    >
                      {noKtp.length}/16 digit
                    </div>
                  )}
                </div>
                <div>
                  <label style={L}>
                    Password (min. 8 karakter){" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <PwInput
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label style={L}>
                    Konfirmasi Password{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <PwInput
                    value={confirmPw}
                    onChange={setConfirmPw}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                  />
                  {confirmPw && password !== confirmPw && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      Password tidak cocok
                    </div>
                  )}
                  {confirmPw &&
                    password === confirmPw &&
                    confirmPw.length >= 8 && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: "var(--primary)" }}
                      >
                        Password cocok ✓
                      </div>
                    )}
                </div>
              </div>
            </div>

            {error && (
              <div
                className="text-sm rounded-lg px-3 py-2.5"
                style={{ background: "#fef2f2", color: "var(--danger)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full justify-center"
              style={{ width: "100%" }}
            >
              {busy ? "Mendaftar…" : "Daftar Sekarang"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-sm mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Sudah punya akun?{" "}
          <Link
            href="/login"
            style={{ color: "var(--primary)", textDecoration: "underline" }}
          >
            Masuk
          </Link>
        </p>
        <p className="text-center text-xs mt-2">
          <Link
            href="/"
            style={{ color: "var(--text-subtle)", textDecoration: "underline" }}
          >
            ← Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
