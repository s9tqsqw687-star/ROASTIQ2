import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Roast } from "@/lib/types";

const roastLevelColors: Record<string, string> = {
  light: "bg-yellow-100 text-yellow-800",
  medium: "bg-amber-100 text-amber-800",
  "medium-dark": "bg-orange-100 text-orange-800",
  dark: "bg-stone-200 text-stone-800",
};

export default async function RoastsPage() {
  const supabase = await createClient();
  const { data: roasts } = await supabase
    .from("roasts")
    .select("*, beans(id, name, origin)")
    .order("roasted_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roast Log</h1>
        <Link href="/roasts/new" className={cn(buttonVariants({ size: "sm" }), "bg-amber-700 hover:bg-amber-800")}>
          <Plus className="h-4 w-4 mr-1" /> Log Roast
        </Link>
      </div>

      {!roasts || roasts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No roasts logged yet.</p>
            <Link href="/roasts/new" className="text-amber-700 font-medium hover:underline mt-1 block">
              Log your first roast →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(roasts as Roast[]).map((roast) => {
            const date = new Date(roast.roasted_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const weightOut = roast.weight_out_g ?? 0;
            const weightIn = roast.weight_in_g ?? 0;
            const loss = weightIn > 0 ? (((weightIn - weightOut) / weightIn) * 100).toFixed(1) : null;

            return (
              <Link key={roast.id} href={`/roasts/${roast.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {roast.beans?.name ?? "Unknown bean"}
                        </p>
                        <p className="text-sm text-muted-foreground">{date}</p>
                        {roast.weight_in_g && (
                          <p className="text-xs text-muted-foreground">
                            {roast.weight_in_g}g in
                            {roast.weight_out_g ? ` → ${roast.weight_out_g}g out` : ""}
                            {loss ? ` (${loss}% loss)` : ""}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        {roast.roast_level && (
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roastLevelColors[roast.roast_level] ?? ""}`}
                          >
                            {roast.roast_level}
                          </span>
                        )}
                        {roast.duration_min && (
                          <p className="text-xs text-muted-foreground">{roast.duration_min} min</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
