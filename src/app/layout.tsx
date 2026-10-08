import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

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
        className={`${inter.variable} ${robotoMono.variable} font-sans min-h-screen flex flex-col relative`}
      >
        {/* Fixed Background Image to ensure it renders correctly */}
        <div 
          className="fixed inset-0 -z-50 bg-[#141518] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/smart-building-bg.jpg')" }}
        />
        {/* Gradient Overlay for readability */}
        <div className="fixed inset-0 -z-40 bg-gradient-to-b from-[#141518]/60 to-[#141518]/85" />
        
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
