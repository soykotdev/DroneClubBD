import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Inbox, Wrench, Package, FolderKanban, FileText, Settings, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { RedCircle } from "@/components/brand/RedCircle";
import { useAuth } from "@/features/auth/AuthProvider";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  { label: "Leads", href: "/admin/leads", icon: Inbox },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Equipment", href: "/admin/equipment", icon: Package },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-brand-light">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-brand-border bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-brand-border px-5">
          <Logo variant="icon" height={36} />
          <span className="font-heading text-sm font-semibold text-brand-black">DCB Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
          {NAV_ITEMS.map(({ label, href, icon: Icon, end }) => (
            <NavLink
              key={href}
              to={href}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-red/10 text-brand-red" : "text-brand-graphite hover:bg-black/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                  {isActive && <RedCircle size={6} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="flex h-16 items-center justify-between border-b border-brand-border bg-white px-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg lg:hidden"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden text-sm text-brand-graphite lg:block">Drone Club Bangladesh — Admin Panel</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-black">{user?.name}</p>
              <p className="text-xs capitalize text-brand-graphite">{user?.role.replace("-", " ")}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-border px-4 text-sm font-medium text-brand-black hover:bg-black/5"
            >
              <LogOut size={16} aria-hidden="true" /> Log Out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
