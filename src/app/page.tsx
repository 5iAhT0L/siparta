import Link from "next/link";

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group bg-white rounded-xl border border-gray-100 p-6 flex gap-5 items-start transition-all duration-300 hover:shadow-lg hover:border-emerald-100">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-gray-900 font-semibold text-lg mb-1.5">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <svg
              width="18"
              height="18"
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
          <span className="font-bold text-xl text-gray-900 tracking-tight">SIPARTA</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Masuk
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6 sm:mb-8 text-xs font-semibold text-emerald-700">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              className="text-emerald-600"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Sistem Informasi RT/RW Digital
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
            Kelola RT/RW dengan
            <br />
            <span className="text-emerald-600">Mudah & Transparan</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Platform all-in-one untuk mengelola iuran, kas, data warga, dan
            pengumuman dengan lebih efisien.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-12 sm:mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow"
            >
              Mulai Sekarang
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center items-center">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-emerald-600">3</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
                  Peran Akses
                </p>
              </div>
              <div className="hidden sm:block h-12 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-emerald-600">
                  100%
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
                  Cloud-Based
                </p>
              </div>
              <div className="hidden sm:block h-12 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-emerald-600">
                  Real-time
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
                  Data Terkini
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 sm:py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-3">
              Fitur Lengkap
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Semua yang dibutuhkan untuk kelola RT/RW
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Manajemen Iuran"
              desc="Generate tagihan bulanan, lacak pembayaran, dan verifikasi bukti transfer."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
            />
            <FeatureCard
              title="Kas & Laporan"
              desc="Pantau pemasukan dan pengeluaran kas secara real-time dengan laporan transparan."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              }
            />
            <FeatureCard
              title="Data Warga & Rumah"
              desc="Kelola data KK, penghuni, KTP, dan kontrak hunian dalam satu tempat."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              }
            />
            <FeatureCard
              title="Pengumuman"
              desc="Sebar informasi dan pengumuman ke seluruh warga dengan cepat dan terstruktur."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
              }
            />
            <FeatureCard
              title="Multi-level Akses"
              desc="Tiga peran: Pengurus RT, Pengurus RW, dan Warga dengan hak akses sesuai."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              }
            />
            <FeatureCard
              title="Monitoring RW"
              desc="Pantau seluruh RT di wilayah, kelola pengurus, dan monitor iuran keseluruhan."
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto bg-emerald-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Siap digitalisasi RT/RW Anda?
          </h2>
          <p className="text-base sm:text-lg text-emerald-50 mb-8 leading-relaxed max-w-2xl mx-auto">
            Bergabunglah dengan ribuan RT/RW yang telah mempercayai SIPARTA
            untuk mengelola komunitas mereka dengan lebih efisien dan
            transparan.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-50 transition-colors shadow-md"
          >
            Coba Demo Sekarang
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-10 sm:py-12 text-center bg-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
            <svg
              width="12"
              height="12"
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
          <span className="font-bold text-emerald-600">SIPARTA</span>
        </div>
        <p className="text-xs text-gray-400">
          Sistem Informasi Pencatatan RT/RW Terpadu © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}