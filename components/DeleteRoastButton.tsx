"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteRoastButton({ roastId }: { roastId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this roast? This cannot be undone.")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("roasts").delete().eq("id", roastId);
    router.push("/roasts");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 border-red-200 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
