"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Activity, Bell, Calendar, HelpCircle, PlusSquare, Heart, CheckCircle2, Box, BrainCircuit, LayoutDashboard, Settings2, ShieldAlert } from "lucide-react";

function Sidebar() {
  const pathname = usePathname();

  const PLATFORM_LINKS = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "Buildings", href: "/buildings", icon: Box },
    { name: "Assets", href: "/assets", icon: Box },
    { name: "Simulation", href: "/simulation", icon: Activity },
    { name: "Maintenance", href: "/maintenance", icon: Settings2 },
    { name: "Analytics", href: "/analytics", icon: BrainCircuit },
  ];

  const DOCTOR_LINKS = [
    { name: "Health", href: "/health", icon: Heart },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "What if", href: "/whatif", icon: HelpCircle },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  return (
    <aside className="w-64 border-r border-panel-border/50 bg-[#12141a]/80 backdrop-blur-md flex flex-col flex-shrink-0 z-20 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-3 text-primary mb-8">
          <PlusSquare className="w-8 h-8 fill-primary text-background" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight text-white tracking-wide">BuildGuard</span>
            <span className="text-[10px] text-primary tracking-[0.2em] font-medium leading-tight">PREDICTIVE AI</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 px-4 pb-6 flex flex-col gap-6">
        
        {/* Main Navigation */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Platform</h3>
          <nav className="flex flex-col gap-1">
            {PLATFORM_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? "bg-[#1e2532] text-white" 
                      : "text-foreground/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Asset Deep Dive (Building Doctor) */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Doctor Analysis
          </h3>
          <nav className="flex flex-col gap-1">
            {DOCTOR_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-foreground bg-background">
      {/* Sidebar */}
      <Suspense fallback={<aside className="w-64 border-r border-panel-border/50 bg-[#12141a]/80 backdrop-blur-md flex flex-col flex-shrink-0 z-20 h-screen sticky top-0 overflow-y-auto custom-scrollbar" />}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-panel-border/50 bg-[#12141a]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 text-lg font-medium text-white">
            <PlusSquare className="w-5 h-5 text-primary" />
            City Hospital · Pump Room
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2 bg-[#1a2e26] text-[#4ade80] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#4ade80]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              Live Mode
            </div>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
