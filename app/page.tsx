import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: "☕",
    title: "Behmore-Optimized Logging",
    desc: "Log P1–P5 presets, drum speed, batch size, first & second crack times, and bean/exhaust temps in one tap.",
  },
  {
    icon: "📊",
    title: "Roast Analytics",
    desc: "Track yield %, first crack trends, preset performance, and weight roasted over time with visual charts.",
  },
  {
    icon: "🌱",
    title: "Bean Inventory",
    desc: "Track your green bean stock by origin, processing, and supplier. Auto-deducts on every roast.",
  },
  {
    icon: "📱",
    title: "Mobile First",
    desc: "Install on your iPhone or Android from the browser. No app store needed. Works in your roastery.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white border-b">
        <Image
          src="/logo.png"
          alt="Forge + Field Coffee"
          width={280}
          height={90}
          className="object-contain mb-8"
          priority
        />
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
          Your Behmore Roast Journal
        </h1>
        <p className="text-lg text-stone-500 mb-8 max-w-md">
          Log every Behmore roast, track your beans, and analyze your results — built for Forge + Field Coffee.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "bg-amber-700 hover:bg-amber-800 text-white px-8")}
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-8")}
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-stone-400 mt-5">
          Install on your phone from Safari or Chrome — no app store needed.
        </p>
      </section>

      {/* Behmore preset reference */}
      <section className="px-6 py-14 max-w-2xl mx-auto w-full">
        <h2 className="text-lg font-semibold text-stone-800 mb-4 text-center">Behmore Preset Guide</h2>
        <div className="space-y-3">
          {[
            { preset: "P1", label: "Fastest", desc: "100% power throughout. Best for Central/South American beans." },
            { preset: "P2", label: "All-Around", desc: "100% → 70% → 100%. The best general-purpose profile." },
            { preset: "P3", label: "Gradual", desc: "70% → 80% → 100%. Great for Brazilians & Africans." },
            { preset: "P4", label: "Soft/Espresso", desc: "70% → 85% → 100%. Recommended for espresso blends." },
            { preset: "P5", label: "Slowest", desc: "70% → 80% → 95%. Best for island coffees (Hawaiian, Jamaican)." },
          ].map(({ preset, label, desc }) => (
            <div key={preset} className="flex items-start gap-4 bg-white rounded-lg border px-4 py-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-sm">
                {preset}
              </div>
              <div>
                <p className="font-medium text-stone-800">{preset} — {label}</p>
                <p className="text-sm text-stone-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-stone-800 mb-6 text-center">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-lg border bg-stone-50">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{title}</p>
                  <p className="text-sm text-stone-500 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-14 text-center border-t bg-amber-50">
        <p className="text-stone-700 font-medium mb-4">Ready to log your next roast?</p>
        <Link
          href="/signup"
          className={cn(buttonVariants({ size: "lg" }), "bg-amber-700 hover:bg-amber-800 text-white")}
        >
          Start for free
        </Link>
      </section>

      <footer className="text-center text-xs text-stone-400 py-6 border-t">
        © {new Date().getFullYear()} Forge + Field Coffee · Built with RoastIQ
      </footer>
    </main>
  );
}
