import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Bean } from "@/lib/types";

export default async function BeansPage() {
  const supabase = await createClient();
  const { data: beans } = await supabase
    .from("beans")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bean Inventory</h1>
        <Link href="/beans/new" className={cn(buttonVariants({ size: "sm" }), "bg-amber-700 hover:bg-amber-800")}>
          <Plus className="h-4 w-4 mr-1" /> Add Bean
        </Link>
      </div>

      {!beans || beans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No beans yet.</p>
            <Link href="/beans/new" className="text-amber-700 font-medium hover:underline mt-1 block">
              Add your first bean →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(beans as Bean[]).map((bean) => (
            <Link key={bean.id} href={`/beans/${bean.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{bean.name}</p>
                      {bean.origin && (
                        <p className="text-sm text-muted-foreground">{bean.origin}</p>
                      )}
                      {bean.processing && (
                        <p className="text-xs text-muted-foreground capitalize">{bean.processing}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {bean.quantity_g != null && (
                        <Badge
                          variant={bean.quantity_g <= 500 ? "destructive" : "secondary"}
                        >
                          {bean.quantity_g >= 1000
                            ? `${(bean.quantity_g / 1000).toFixed(2)} kg`
                            : `${bean.quantity_g} g`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
