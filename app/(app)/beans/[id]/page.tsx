import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BeanForm from "@/components/BeanForm";
import DeleteBeanButton from "@/components/DeleteBeanButton";
import type { Bean } from "@/lib/types";

export default async function BeanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bean } = await supabase.from("beans").select("*").eq("id", id).single();

  if (!bean) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Bean</h1>
        <DeleteBeanButton beanId={id} />
      </div>
      <BeanForm bean={bean as Bean} />
    </div>
  );
}
