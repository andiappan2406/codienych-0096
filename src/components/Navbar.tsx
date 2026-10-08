"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Box, BrainCircuit, LayoutDashboard, Settings2, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Buildings", href: "/buildings", icon: Box },
  { name: "Assets", href: "/assets", icon: Box },
  { name: "Simulation", href: "/simulation", icon: Activity },
  { name: "Maintenance", href: "/maintenance", icon: Settings2 },
  { name: "Analytics", href: "/analytics", icon: BrainCircuit },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/10 bg-gradient-to-r from-background via-background/95 to-primary/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md overflow-hidden bg-background border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <img src="/icon" alt="BuildGuard AI Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider hidden sm:block text-white leading-tight">BUILDGUARD</span>
            <span className="text-[10px] text-primary tracking-[0.2em] font-medium hidden sm:block leading-tight">PREDICTIVE AI</span>
          </div>
          <span className="font-bold tracking-wide sm:hidden text-white">BUILDGUARD</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/60 hover:text-primary hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" /> {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-foreground/50">SYSTEM_STATUS</div>
            <div className="text-xs text-healthy flex items-center justify-end gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healthy opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-healthy"></span>
              </span>
              NOMINAL
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-foreground/80 hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl py-4 px-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/80 hover:text-primary hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" /> {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
