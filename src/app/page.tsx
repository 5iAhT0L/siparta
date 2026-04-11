import Link from "next/link";

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1.5px solid var(--border-muted)",
      borderRadius: 16,
      padding: "1.25rem 1.5rem",
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}>
      <div style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "var(--primary-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--primary)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.25rem" }}>{title}</div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{label}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1.5px solid var(--border-muted)",
        padding: "0 1.5rem",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--primary)", letterSpacing: "-0.01em" }}>SIPARTA</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background blob */}
        <div style={{
          position: "absolute",
          top: -80, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, #dcfce7 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "var(--primary-light)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: "0.3rem 0.9rem",
          marginBottom: "1.5rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--primary-dark)",
          letterSpacing: "0.04em",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--primary)" stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Sistem Informasi RT/RW Digital
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)",
          fontWeight: 800,
          color: "var(--text)",
          lineHeight: 1.15,
          marginBottom: "1.25rem",
          letterSpacing: "-0.02em",
          maxWidth: 640,
        }}>
          Kelola RT/RW<br />
          <span style={{ color: "var(--primary)" }}>Lebih Mudah & Transparan</span>
        </h1>

        <p style={{
          fontSize: "clamp(0.9rem, 2vw, 1.0625rem)",
          color: "var(--text-muted)",
          lineHeight: 1.65,
          maxWidth: 520,
          marginBottom: "2.25rem",
        }}>
          SIPARTA membantu pengurus RT/RW mengelola iuran, kas, data warga, dan pengumuman — semua dalam satu platform yang mudah digunakan.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" }}>
          <Link href="/login" className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            Coba Demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          gap: "2.5rem",
          padding: "1.25rem 2rem",
          background: "var(--surface)",
          borderRadius: 16,
          border: "1.5px solid var(--border-muted)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <StatBadge value="3 Peran" label="RT · RW · Warga" />
          <div style={{ width: 1, background: "var(--border-muted)", alignSelf: "stretch" }} />
          <StatBadge value="100%" label="Berbasis Web" />
          <div style={{ width: 1, background: "var(--border-muted)", alignSelf: "stretch" }} />
          <StatBadge value="Real-time" label="Data Terkini" />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Fitur Utama</div>
          <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            Semua yang dibutuhkan pengurus RT/RW
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <FeatureCard
            title="Manajemen Iuran"
            desc="Generate tagihan bulanan & insidental, lacak pembayaran, dan verifikasi bukti transfer dengan mudah."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
          />
          <FeatureCard
            title="Kas & Laporan"
            desc="Pantau pemasukan dan pengeluaran kas RT secara real-time dengan laporan yang lengkap dan transparan."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>}
          />
          <FeatureCard
            title="Data Warga & Rumah"
            desc="Kelola data KK, penghuni, foto KTP, status kepemilikan, dan kontrak hunian dalam satu tempat."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>}
          />
          <FeatureCard
            title="Pengumuman"
            desc="Sebar informasi dan pengumuman kepada seluruh warga secara cepat dan terstruktur."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>}
          />
          <FeatureCard
            title="Multi-level Akses"
            desc="Tiga peran berbeda: Pengurus RT, Pengurus RW, dan Warga — masing-masing dengan hak akses sesuai."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
          />
          <FeatureCard
            title="Monitoring RW"
            desc="Pengurus RW dapat memantau seluruh RT di wilayahnya, mengelola pengurus, dan memantau iuran."
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>}
          />
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: "0 1.5rem 4rem",
        maxWidth: 860,
        marginLeft: "auto",
        marginRight: "auto",
        padding: "2.5rem 2rem",
        background: "linear-gradient(135deg, var(--primary) 0%, #15803d 100%)",
        borderRadius: 20,
        textAlign: "center",
        color: "white",
      }}>
        <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>
          Siap digitalisasi RT/RW Anda?
        </h2>
        <p style={{ fontSize: "0.9375rem", opacity: 0.85, marginBottom: "1.75rem", lineHeight: 1.6 }}>
          Mulai kelola iuran dan data warga dengan lebih efisien hari ini.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            background: "white",
            color: "var(--primary-dark)",
            padding: "0.6rem 1.5rem",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            Coba Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1.5px solid var(--border-muted)",
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.8125rem",
        color: "var(--text-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.875rem" }}>SIPARTA</span>
        </div>
        <div>Sistem Informasi Pencatatan RT/RW Terpadu &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
