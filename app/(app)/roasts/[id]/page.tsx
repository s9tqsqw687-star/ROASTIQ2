import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RoastForm from "@/components/RoastForm";
import DeleteRoastButton from "@/components/DeleteRoastButton";
import type { Bean, Roast } from "@/lib/types";

export default async function RoastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: roast }, { data: beans }] = await Promise.all([
    supabase.from("roasts").select("*, beans(id, name, origin)").eq("id", id).single(),
    supabase.from("beans").select("id, name").order("name"),
  ]);

  if (!roast) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Roast</h1>
        <DeleteRoastButton roastId={id} />
      </div>
      <RoastForm
        roast={roast as Roast}
        beans={(beans ?? []) as Pick<Bean, "id" | "name">[]}
      />
    </div>
  );
}
