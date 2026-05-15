import { createClient } from "@/lib/supabase/server";
import RoastCharts from "@/components/RoastCharts";
import type { Roast } from "@/lib/types";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: roasts } = await supabase
    .from("roasts")
    .select("*, beans(id, name, origin)")
    .order("roasted_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Trends across all your roasts</p>
      </div>
      <RoastCharts roasts={(roasts ?? []) as Roast[]} />
    </div>
  );
}
