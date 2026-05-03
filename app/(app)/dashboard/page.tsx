import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Bean, TrendingDown, Calendar } from "lucide-react";
import type { Bean as BeanType, Roast } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: roastsThisMonth }, { data: recentRoasts }, { data: lowBeans }] =
    await Promise.all([
      supabase
        .from("roasts")
        .select("weight_in_g")
        .gte("roasted_at", startOfMonth),
      supabase
        .from("roasts")
        .select("*, beans(id, name)")
        .order("roasted_at", { ascending: false })
        .limit(3),
      supabase
        .from("beans")
        .select("id, name, quantity_g")
        .lte("quantity_g", 500)
        .order("quantity_g", { ascending: true }),
    ]);

  const totalRoastsThisMonth = roastsThisMonth?.length ?? 0;
  const totalWeightKg = (
    (roastsThisMonth ?? []).reduce((sum, r) => sum + (r.weight_in_g ?? 0), 0) / 1000
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Coffee className="h-3 w-3" /> Roasts this month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold">{totalRoastsThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Weight roasted
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold">{totalWeightKg}<span className="text-base font-normal text-muted-foreground ml-1">kg</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock */}
      {lowBeans && lowBeans.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-800">
              <Bean className="h-4 w-4" /> Running low
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {(lowBeans as Pick<BeanType, "id" | "name" | "quantity_g">[]).map((bean) => (
              <Link key={bean.id} href={`/beans/${bean.id}`} className="flex items-center justify-between hover:opacity-75">
                <span className="text-sm font-medium">{bean.name}</span>
                <Badge variant="destructive" className="text-xs">
                  {bean.quantity_g != null ? `${bean.quantity_g}g` : "Unknown"}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent roasts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Recent roasts
          </h2>
          <Link href="/roasts" className="text-sm text-amber-700 hover:underline">
            View all
          </Link>
        </div>
        {!recentRoasts || recentRoasts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No roasts yet.{" "}
              <Link href="/roasts/new" className="text-amber-700 hover:underline">
                Log one now →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(recentRoasts as Roast[]).map((roast) => (
              <Link key={roast.id} href={`/roasts/${roast.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{roast.beans?.name ?? "Unknown bean"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(roast.roasted_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {roast.weight_in_g ? ` · ${roast.weight_in_g}g` : ""}
                      </p>
                    </div>
                    {roast.roast_level && (
                      <Badge variant="secondary" className="capitalize text-xs">
                        {roast.roast_level}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
