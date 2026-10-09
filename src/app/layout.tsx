import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildGuard AI | Predictive Maintenance",
  description: "Context-Aware Predictive Maintenance for Buildings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans min-h-screen flex flex-col relative antialiased"
      >
        {/* Fixed Background Image with Sunset Dusk Tone */}
        <div 
          className="fixed inset-0 -z-50 bg-[#151019] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/smart-building-bg.jpg')" }}
        />
        {/* Gradient Overlay for warm sunset readability */}
        <div className="fixed inset-0 -z-40 bg-gradient-to-b from-[#151019]/60 via-[#1b1420]/75 to-[#151019]/90 pointer-events-none" />
        
        <div className="flex-1 flex flex-col z-0 relative">
          {children}
        </div>
        <footer className="w-full border-t border-border/40 py-4 mt-auto relative z-0">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs font-mono text-foreground/40">
            Draft by darkplasma
          </div>
        </footer>
      </body>
    </html>
  );
}
