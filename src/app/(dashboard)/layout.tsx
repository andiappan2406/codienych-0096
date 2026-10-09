"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  Activity,
  Bell,
  Calendar,
  HelpCircle,
  PlusSquare,
  Heart,
  Box,
  BrainCircuit,
  LayoutDashboard,
  Settings2,
  ShieldAlert,
  Menu,
  X,
  Database,
  Info,
  ChevronRight,
  Radio,
} from "lucide-react";

const OPERATION_LINKS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Buildings", href: "/buildings", icon: Box },
  { name: "Equipment Assets", href: "/assets", icon: Box },
  { name: "Maintenance Planner", href: "/maintenance", icon: Settings2 },
  { name: "Maintenance Calendar", href: "/calendar", icon: Calendar },
  { name: "Active Alerts", href: "/alerts", icon: Bell },
];

const AI_LINKS = [
  { name: "Mobile Sensor Lab", href: "/sensor-doctor", icon: Radio, highlight: true },
  { name: "Fleet Health Doctor", href: "/health", icon: Heart },
  { name: "What-If Studio", href: "/whatif", icon: HelpCircle },
  { name: "Pipeline Simulation", href: "/simulation", icon: Activity },
  { name: "Model Analytics", href: "/analytics", icon: BrainCircuit },
];

const SYSTEM_LINKS = [
  { name: "System Setup", href: "/setup", icon: Database },
  { name: "Architecture", href: "/about", icon: Info },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <Link 
          href="/" 
          onClick={onClose}
          className="flex items-center gap-3 text-primary group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <PlusSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight text-white tracking-wide">BuildGuard</span>
            <span className="text-[10px] text-primary tracking-[0.2em] font-medium leading-tight">PREDICTIVE AI</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* Operations */}
        <div>
          <h3 className="px-4 text-[11px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">Operations</h3>
          <nav className="flex flex-col gap-1">
            {OPERATION_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/assets" && pathname.startsWith("/asset/"));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-[#1e2532] text-white shadow-sm border border-white/5"
                      : "text-foreground/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                  <span className="flex-1">{link.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Intelligence */}
        <div>
          <h3 className="px-4 text-[11px] font-semibold text-foreground/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" /> AI Intelligence
          </h3>
          <nav className="flex flex-col gap-1">
            {AI_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-foreground/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "fill-current" : ""}`} />
                  <span className="flex-1">{link.name}</span>
                  {link.highlight && (
                    <span className="bg-primary/20 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1 border border-primary/30">
                      <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                      LIVE
                    </span>
                  )}
                  {isActive && !link.highlight && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System */}
        <div>
          <h3 className="px-4 text-[11px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">System</h3>
          <nav className="flex flex-col gap-1">
            {SYSTEM_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-foreground/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Pill */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-foreground/50 flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span>AI ENGINE</span>
          <span className="text-[#4ade80] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            LIVE MULTI-AGENT
          </span>
        </div>
        <div className="text-[11px] text-foreground/40">4 Trained Models Online</div>
      </div>
    </div>
  );
}

function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-[280px] max-w-[85vw] bg-[#12141a] border-r border-panel-border h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Suspense fallback={<div className="p-6 text-foreground/50">Loading navigation...</div>}>
          <NavContent onClose={onClose} />
        </Suspense>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex text-foreground bg-background selection:bg-primary selection:text-black">
      {/* Desktop Sidebar (visible on lg screens) */}
      <aside className="hidden lg:flex w-64 border-r border-panel-border/50 bg-[#12141a]/95 backdrop-blur-md flex-col flex-shrink-0 z-20 h-screen sticky top-0 overflow-hidden">
        <Suspense fallback={<div className="w-64 h-screen bg-[#12141a]" />}>
          <NavContent />
        </Suspense>
      </aside>

      {/* Mobile Drawer */}
      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-panel-border/50 bg-[#12141a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-foreground/70 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-base sm:text-lg font-medium text-white truncate">
              <PlusSquare className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="truncate">City Hospital · Pump Room</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-foreground/50 tracking-wider">SYSTEM_STATUS</div>
              <div className="text-xs text-healthy flex items-center justify-end gap-1.5 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healthy opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-healthy"></span>
                </span>
                NOMINAL
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1a2e26] text-[#4ade80] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider border border-[#4ade80]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span className="hidden xs:inline">Live Mode</span>
              <span className="xs:hidden">Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
