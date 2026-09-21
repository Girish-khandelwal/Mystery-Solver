"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  LayoutGrid,
  Compass,
  Network,
  UserRound,
  Award,
  Settings,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useDetective } from "./Provider";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile, current, error } = useDetective();
  const links = [
    { href: "/", label: "Headquarters", icon: LayoutGrid },
    { href: "/archive", label: "Case archive", icon: FolderOpen },
    {
      href: `/case/${current ?? "001"}`,
      label: "Current investigation",
      icon: Compass,
    },
    {
      href: `/case/${current ?? "001"}?tab=board`,
      label: "Evidence board",
      icon: Network,
    },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="CASEFILE headquarters">
          <div className="brand-mark">
            <FolderOpen size={23} />
          </div>
          <span>
            CASEFILE<small>INVESTIGATION BUREAU</small>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              className={path === href ? "nav-item active" : "nav-item"}
              href={href}
              title={label}
              key={label}
            >
              <Icon size={18} />
              {label}
              {path === href && <span className="nav-active" />}
            </Link>
          ))}
        </nav>
        <div className="nav-label second">DETECTIVE</div>
        <nav aria-label="Detective navigation">
          {[
            { href: "/profile", label: "Your profile", icon: UserRound },
            { href: "/achievements", label: "Achievements", icon: Award },
            { href: "/settings", label: "Settings", icon: Settings },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              className={path === href ? "nav-item active" : "nav-item"}
              href={href}
              title={label}
              key={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="bureau-seal">
            <ShieldCheck size={31} />
          </div>
          <p>THE TRUTH IS IN THE DETAILS.</p>
          <Link href="/profile" className="mini-profile">
            <div className="avatar">{profile?.username.slice(0, 1) ?? "D"}</div>
            <span>
              {profile?.username ?? "Detective"}
              <small>{profile?.rank ?? "Rookie Investigator"}</small>
            </span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            BUREAU <span>/</span>{" "}
            {path === "/"
              ? "HEADQUARTERS"
              : path.startsWith("/case")
                ? "INVESTIGATION"
                : path.slice(1).toUpperCase()}
          </span>
          <div>
            <Link
              href="/archive"
              className="icon-button"
              aria-label="Search case archive"
            >
              <Search size={18} />
            </Link>
            <span className="clearance">LOCAL DETECTIVE PROFILE</span>
            <Link
              href="/profile"
              className="avatar small"
              aria-label="Open detective profile"
            >
              {profile?.username.slice(0, 1) ?? "D"}
            </Link>
          </div>
        </header>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <main id="main-content">{children}</main>
        <footer className="page-footer">
          <span>CASEFILE BUREAU · FICTIONAL CASES. REAL DEDUCTION.</span>
          <span>INVESTIGATE. DEDUCE. SOLVE.</span>
        </footer>
      </div>
    </div>
  );
}
