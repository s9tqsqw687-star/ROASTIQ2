import { createClient } from "@/lib/supabase/server";
import RoastForm from "@/components/RoastForm";
import type { Bean } from "@/lib/types";

export default async function NewRoastPage() {
  const supabase = await createClient();
  const { data: beans } = await supabase
    .from("beans")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Log Roast</h1>
      <RoastForm beans={(beans ?? []) as Pick<Bean, "id" | "name">[]} />
    </div>
  );
}
