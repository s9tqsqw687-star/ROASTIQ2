import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-4xl font-bold text-stone-900 mb-3">RoastIQ</h1>
        <p className="text-lg text-stone-600 mb-8">
          The mobile-first roast logger and bean inventory tracker for serious coffee roasters.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-amber-700 hover:bg-amber-800")}>
            Get started free
          </Link>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Sign in
          </Link>
        </div>
        <p className="text-sm text-stone-400 mt-6">
          No app store needed — install from your browser on any phone.
        </p>
      </div>
    </main>
  );
}
