import Link from "next/link";
import { ArrowLeft, Search, Building2, Box, Activity, ShieldCheck } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 relative overflow-hidden">
      {/* Background styling to match theme */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background to-background" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-8 pt-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              placeholder="Search assets or facilities..."
              className="bg-panel border border-panel-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground w-64"
            />
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Discover <span className="text-primary">Facilities</span>
          </h1>
          <p className="text-foreground/70 text-lg max-w-2xl leading-relaxed">
            Explore AI-monitored buildings, active equipment networks, and live telemetry hubs deployed across your enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <DiscoverCard 
            icon={<Building2 className="w-6 h-6 text-primary" />}
            title="Global Headquarters"
            status="Nominal"
            assets={142}
            image="/assets/equip-0-1.jpg"
          />
          <DiscoverCard 
            icon={<Box className="w-6 h-6 text-primary" />}
            title="Regional Data Center Alpha"
            status="Elevated Risk"
            assets={85}
            image="/assets/equip-0-0.jpg"
          />
          <DiscoverCard 
            icon={<Activity className="w-6 h-6 text-primary" />}
            title="Manufacturing Plant 4"
            status="Critical Warning"
            assets={312}
            image="/assets/equip-1-0.jpg"
          />
        </div>

        <div className="mt-12 glass-panel p-8 rounded-2xl border border-white/5 bg-panel/30 text-center flex flex-col items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect New Facility</h2>
          <p className="text-foreground/70 text-sm max-w-md mb-6">
            Deploy BuildGuard Edge Agents to a new facility to start tracking asset health and predicting failures.
          </p>
          <Link href="/setup" className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg">
            Start Onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}

function DiscoverCard({ icon, title, status, assets, image }: { icon: React.ReactNode, title: string, status: string, assets: number, image: string }) {
  const isCritical = status.includes("Critical");
  const isWarning = status.includes("Elevated");
  
  return (
    <div className="glass-panel p-1 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="h-40 w-full rounded-xl bg-black/40 mb-4 overflow-hidden relative">
         <img src={image} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
         <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono border border-white/10 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-critical" : isWarning ? "bg-warning" : "bg-[#4ade80]"}`} />
            {status}
         </div>
      </div>
      <div className="p-4 pt-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <h3 className="font-semibold text-white truncate">{title}</h3>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs font-mono text-foreground/50">{assets} Active Assets</span>
          <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">View Dashboard →</span>
        </div>
      </div>
    </div>
  );
}
