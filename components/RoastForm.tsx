"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bean, Roast } from "@/lib/types";

interface Props {
  roast?: Roast;
  beans: Pick<Bean, "id" | "name">[];
}

export default function RoastForm({ roast, beans }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    bean_id: roast?.bean_id ?? "",
    roasted_at: roast?.roasted_at
      ? new Date(roast.roasted_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    weight_in_g: roast?.weight_in_g?.toString() ?? "",
    weight_out_g: roast?.weight_out_g?.toString() ?? "",
    roast_level: roast?.roast_level ?? "",
    duration_min: roast?.duration_min?.toString() ?? "",
    notes: roast?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const weightIn = form.weight_in_g ? parseFloat(form.weight_in_g) : null;

    const payload = {
      user_id: user!.id,
      bean_id: form.bean_id || null,
      roasted_at: form.roasted_at,
      weight_in_g: weightIn,
      weight_out_g: form.weight_out_g ? parseFloat(form.weight_out_g) : null,
      roast_level: form.roast_level || null,
      duration_min: form.duration_min ? parseFloat(form.duration_min) : null,
      notes: form.notes || null,
    };

    if (roast) {
      const { error } = await supabase.from("roasts").update(payload).eq("id", roast.id);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("roasts").insert(payload);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Deduct weight from bean inventory
      if (form.bean_id && weightIn) {
        const { data: bean } = await supabase
          .from("beans")
          .select("quantity_g")
          .eq("id", form.bean_id)
          .single();

        if (bean && bean.quantity_g != null) {
          const newQty = Math.max(0, bean.quantity_g - weightIn);
          await supabase.from("beans").update({ quantity_g: newQty }).eq("id", form.bean_id);
        }
      }
    }

    router.push("/roasts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bean_id">Bean</Label>
        <Select value={form.bean_id} onValueChange={(v) => set("bean_id", v ?? "")}>
          <SelectTrigger id="bean_id">
            <SelectValue placeholder="Select a bean" />
          </SelectTrigger>
          <SelectContent>
            {beans.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roasted_at">Roast date & time *</Label>
        <Input
          id="roasted_at"
          type="datetime-local"
          value={form.roasted_at}
          onChange={(e) => set("roasted_at", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="weight_in_g">Weight in (g)</Label>
          <Input
            id="weight_in_g"
            type="number"
            min="0"
            step="1"
            value={form.weight_in_g}
            onChange={(e) => set("weight_in_g", e.target.value)}
            placeholder="e.g. 250"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight_out_g">Weight out (g)</Label>
          <Input
            id="weight_out_g"
            type="number"
            min="0"
            step="1"
            value={form.weight_out_g}
            onChange={(e) => set("weight_out_g", e.target.value)}
            placeholder="e.g. 210"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="roast_level">Roast level</Label>
          <Select value={form.roast_level} onValueChange={(v) => set("roast_level", v ?? "")}>
            <SelectTrigger id="roast_level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="medium-dark">Medium-Dark</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_min">Duration (min)</Label>
          <Input
            id="duration_min"
            type="number"
            min="0"
            step="0.5"
            value={form.duration_min}
            onChange={(e) => set("duration_min", e.target.value)}
            placeholder="e.g. 12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="First crack time, aroma, cup notes, etc."
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-amber-700 hover:bg-amber-800" disabled={loading}>
          {loading ? "Saving…" : roast ? "Save changes" : "Log roast"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
