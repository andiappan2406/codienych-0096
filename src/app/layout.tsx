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
        className={`${inter.variable} ${robotoMono.variable} font-sans min-h-screen flex flex-col`}
      >
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <footer className="w-full border-t border-border/40 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs font-mono text-foreground/40">
            Draft by darkplasma
          </div>
        </footer>
      </body>
    </html>
  );
}
