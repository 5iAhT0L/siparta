"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

/* ─── Icon components ─── */
function Icon({ d, size = 20 }: { d: string | string[]; size?: number }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS = {
  home:    "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z",
  tagihan: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"],
  verify:  ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  users:   ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"],
  house:   ["M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z", "M9 21V12h6v9"],
  money:   ["M12 1v22", "M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"],
  wallet:  ["M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-5", "M16 12a2 2 0 104 0 2 2 0 00-4 0"],
  bell:    ["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"],
  chart:   ["M18 20V10", "M12 20V4", "M6 20v-6"],
  settings:["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  report:  ["M9 17H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v3", "M9 11h6", "M9 15h3", "M14 21l2 2 4-4"],
  megaphone: ["M3 11l19-9-9 19-2-8-8-2z"],
  monitor: ["M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z", "M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"],
  history: ["M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z", "M12 6v6l4 2"],
  logout:  ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  account: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
};

/* ─── Nav definitions ─── */
type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

const ACCOUNT_ITEM: NavItem = { href: "/dashboard/account", label: "Akun Saya", icon: "account" };

const RT_NAV: NavItem[] = [
  { href: "/dashboard",             label: "Beranda",     icon: "home" },
  { href: "/dashboard/rt/tagihan",  label: "Tagihan",     icon: "tagihan" },
  { href: "/dashboard/rt/pembayaran", label: "Pembayaran", icon: "verify" },
  { href: "/dashboard/rt/warga",    label: "Warga",       icon: "users" },
  { href: "/dashboard/rt/rumah",    label: "Rumah",       icon: "house" },
  { href: "/dashboard/rt/iuran",    label: "Jenis Iuran", icon: "money" },
  { href: "/dashboard/rt/kas",      label: "Kas RT",      icon: "wallet" },
  { href: "/dashboard/rt/pengumuman", label: "Pengumuman", icon: "megaphone" },
  { href: "/dashboard/rt/laporan",  label: "Laporan",     icon: "report" },
  { href: "/dashboard/rt/pengaturan", label: "Pengaturan", icon: "settings" },
  ACCOUNT_ITEM,
];

const WARGA_NAV: NavItem[] = [
  { href: "/dashboard",                  label: "Beranda",  icon: "home" },
  { href: "/dashboard/warga/tagihan",    label: "Tagihan",  icon: "tagihan" },
  { href: "/dashboard/warga/history",    label: "Riwayat",  icon: "history" },
  ACCOUNT_ITEM,
];

const RW_NAV: NavItem[] = [
  { href: "/dashboard",                  label: "Beranda",       icon: "home" },
  { href: "/dashboard/rw",               label: "Monitoring",    icon: "monitor" },
  { href: "/dashboard/rw-pengurus",      label: "Pengurus RT",   icon: "users" },
  { href: "/dashboard/rw-pengaturan",    label: "Pengaturan", icon: "settings" },
  ACCOUNT_ITEM,
];

// Bottom tab — max 5 per role (akun via sidebar desktop; mobile: avatar di top bar)
const RT_TABS:    NavItem[] = [RT_NAV[0], RT_NAV[1], RT_NAV[2], RT_NAV[3], RT_NAV[7]];
const WARGA_TABS: NavItem[] = [WARGA_NAV[0], WARGA_NAV[1], WARGA_NAV[2], ACCOUNT_ITEM];
const RW_TABS:    NavItem[] = [RW_NAV[0], RW_NAV[1], RW_NAV[2], RW_NAV[3], ACCOUNT_ITEM];

/* ─── Sidebar ─── */
function Sidebar({ nav, onLogout }: { nav: NavItem[]; onLogout: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col"
      style={{ background: "var(--surface)", borderRight: "1.5px solid var(--border-muted)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5"
        style={{ borderBottom: "1.5px solid var(--border-muted)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "var(--primary)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ color: "var(--primary)" }}>SIPARTA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={active ? {
                background: "var(--primary-light)",
                color: "var(--primary-dark)",
              } : {
                color: "var(--text-muted)",
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; } }}>
              <Icon d={ICONS[item.icon]} size={17} />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-3" style={{ borderTop: "1.5px solid var(--border-muted)" }}>
        <Link href="/dashboard/account" className="mb-2 flex items-center gap-2 rounded-lg px-2 py-2 transition-all"
          style={{ background: "var(--surface-2)", textDecoration: "none" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--primary-light)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}>
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
            style={{ background: "var(--primary)" }}>
            {user?.nama?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold" style={{ color: "var(--text)" }}>{user?.nama}</div>
            <div className="truncate text-[10px]" style={{ color: "var(--text-subtle)" }}>
              {user?.role === "pengurus_rt" ? "Pengurus RT"
                : user?.role === "pengurus_rw" ? "Pengurus RW"
                : "Warga"}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-subtle)", flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
        <button type="button" onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "var(--danger)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
          <Icon d={ICONS.logout} size={15} />
          <span className="text-xs font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}

/* ─── Bottom Tab Bar (mobile) ─── */
function BottomTabBar({ tabs }: { tabs: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex md:hidden"
      style={{
        background: "var(--surface)",
        borderTop: "1.5px solid var(--border-muted)",
        height: "var(--bottom-bar-h)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
      {tabs.map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.href} href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors"
            style={active ? { color: "var(--primary)" } : { color: "var(--text-subtle)" }}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={active ? { background: "var(--primary-light)" } : {}}>
              <Icon d={ICONS[item.icon]} size={18} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Hamburger Drawer (RT only) ─── */
function HamburgerDrawer({ nav, onLogout, open, onClose }: { nav: NavItem[]; onLogout: () => void; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={onClose} />
      )}
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-64 md:hidden transition-transform duration-200"
        style={{
          background: "var(--surface)",
          borderLeft: "1.5px solid var(--border-muted)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1.5px solid var(--border-muted)" }}>
          <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>Menu</span>
          <button type="button" onClick={onClose} className="rounded-md p-1"
            style={{ color: "var(--text-muted)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {nav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={active ? {
                  background: "var(--primary-light)",
                  color: "var(--primary-dark)",
                } : { color: "var(--text-muted)" }}>
                <Icon d={ICONS[item.icon]} size={17} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-3" style={{ borderTop: "1.5px solid var(--border-muted)" }}>
          <Link href="/dashboard/account" onClick={onClose}
            className="mb-2 flex items-center gap-2 rounded-lg px-2 py-2"
            style={{ background: "var(--surface-2)", textDecoration: "none" }}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ background: "var(--primary)" }}>
              {user?.nama?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold" style={{ color: "var(--text)" }}>{user?.nama}</div>
              <div className="truncate text-[10px]" style={{ color: "var(--text-subtle)" }}>Pengurus RT</div>
            </div>
          </Link>
          <button type="button" onClick={() => { onClose(); onLogout(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{ color: "var(--danger)" }}>
            <Icon d={ICONS.logout} size={15} />
            <span className="text-xs font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Mobile Top Bar ─── */
function MobileTopBar({ onLogout, showHamburger, nav }: { onLogout: () => void; showHamburger?: boolean; nav?: NavItem[] }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 md:hidden"
        style={{ background: "var(--surface)", borderBottom: "1.5px solid var(--border-muted)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--primary)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>SIPARTA</span>
        </div>
        <div className="flex items-center gap-2">
          {!showHamburger && (
            <Link href="/dashboard/account" style={{ textDecoration: "none" }}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--primary)" }}>
                {user?.nama?.[0]?.toUpperCase() ?? "?"}
              </div>
            </Link>
          )}
          {!showHamburger && (
            <button type="button" onClick={onLogout}
              className="rounded-md px-2 py-1 text-xs font-medium"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border-muted)" }}>
              Keluar
            </button>
          )}
          {showHamburger && (
            <button type="button" onClick={() => setDrawerOpen(true)}
              className="rounded-md p-1.5"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border-muted)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          )}
        </div>
      </header>
      {showHamburger && nav && (
        <HamburgerDrawer nav={nav} onLogout={onLogout} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}

/* ─── Main Layout ─── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--primary)", borderRightColor: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Silakan masuk terlebih dahulu.</p>
        <Link href="/login" className="btn-primary">Masuk</Link>
      </div>
    );
  }

  const nav   = user.role === "pengurus_rt" ? RT_NAV   : user.role === "pengurus_rw" ? RW_NAV   : WARGA_NAV;
  const tabs  = user.role === "pengurus_rt" ? RT_TABS  : user.role === "pengurus_rw" ? RW_TABS  : WARGA_TABS;

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar nav={nav} onLogout={handleLogout} />
      </div>

      {/* Mobile top bar */}
      <MobileTopBar onLogout={handleLogout}
        showHamburger={user.role === "pengurus_rt"}
        nav={nav} />

      {/* Main content */}
      <main
        className="md:pl-56"
        style={{ paddingBottom: "calc(var(--bottom-bar-h) + 0.5rem)" }}>
        <div className="md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden">
        <BottomTabBar tabs={tabs} />
      </div>
    </div>
  );
}
