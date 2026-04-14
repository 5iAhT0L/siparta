"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const DEMO_ACCOUNTS = [
  {
    label: "Pengurus RW 001",
    username: "pengurus_rw",
    password: "demo123",
    badge: "RW",
  },
  {
    label: "Pengurus RT 001",
    username: "bendahara_rt1",
    password: "demo123",
    badge: "RT",
  },
  {
    label: "Pengurus RT 002",
    username: "bendahara_rt2",
    password: "demo123",
    badge: "RT",
  },
  {
    label: "Warga (Rumah 12A)",
    username: "warga_demo",
    password: "demo123",
    badge: "Warga",
  },
  {
    label: "Warga (Rumah 07)",
    username: "warga2_rt1",
    password: "demo123",
    badge: "Warga",
  },
  {
    label: "Warga (Rumah 07)",
    username: "warga3_rt1",
    password: "demo123",
    badge: "Warga",
  },
  {
    label: "Penyewa (Rumah 15)",
    username: "penyewa_demo",
    password: "demo123",
    badge: "Warga",
  },
];

export default function LoginPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function pickDemo(username: string) {
    const acc = DEMO_ACCOUNTS.find((a) => a.username === username);
    if (!acc) return;
    setIdentifier(acc.username);
    setPassword(acc.password);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login gagal");
        return;
      }
      setSession(data.accessToken, data.user);

      // Redirect based on role
      const role = data.user?.role;
      if (role === "pengurus_rw") {
        router.push("/dashboard/rw-pengurus");
      } else if (role === "pengurus_rt") {
        router.push("/dashboard/rt");
      } else {
        router.push("/dashboard/warga");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div
            className="font-bold"
            style={{ fontSize: "1.25rem", color: "var(--text)" }}
          >
            Masuk SIPARTA
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Sistem Informasi RT/RW Terpadu
          </div>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Demo account picker */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1.5px solid var(--border)",
                borderRadius: 10,
                padding: "0.75rem",
              }}
            >
              <label
                className="text-xs font-semibold"
                style={{
                  color: "var(--primary-dark)",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Akun Demo
              </label>
              <select
                className="input"
                style={{ fontSize: "0.8125rem" }}
                defaultValue=""
                onChange={(e) => pickDemo(e.target.value)}
              >
                <option value="" disabled>
                  — Pilih akun untuk mengisi otomatis —
                </option>
                {DEMO_ACCOUNTS.map((a) => (
                  <option key={a.username} value={a.username}>
                    [{a.badge}] {a.label}
                  </option>
                ))}
              </select>
              <div
                className="text-xs mt-1.5"
                style={{ color: "var(--text-subtle)" }}
              >
                Semua akun demo menggunakan password:{" "}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  demo123
                </span>
              </div>
            </div>

            <div>
              <label
                className="text-sm font-medium"
                style={{
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Username atau NIK
              </label>
              <input
                className="input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
                placeholder="Masukkan username atau NIK"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{
                  color: "var(--text)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
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
                  {showPw ? (
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
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div
                className="text-sm rounded px-3 py-2"
                style={{ background: "#fef2f2", color: "var(--danger)" }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full justify-center"
              style={{ width: "100%" }}
            >
              {pending ? "Memproses…" : "Masuk"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-sm mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Belum punya akun?{" "}
          <Link
            href="/register"
            style={{ color: "var(--primary)", textDecoration: "underline" }}
          >
            Registrasi Warga
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
