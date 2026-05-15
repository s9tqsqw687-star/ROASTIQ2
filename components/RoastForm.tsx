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

const PRESET_DESCRIPTIONS: Record<string, string> = {
  P1: "100% power — fastest, hottest. Best for Central/South American beans.",
  P2: "100% → 70% → 100%. Best all-around profile.",
  P3: "70% → 80% → 100%. Good for Brazilians & Africans.",
  P4: "70% → 85% → 100%. Recommended for soft/espresso blends.",
  P5: "70% → 80% → 95%. Slowest. Best for island coffees.",
  manual: "Full manual control of power via P buttons during roast.",
};

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
    // Behmore fields
    preset: roast?.preset ?? "",
    batch_size_lb: roast?.batch_size_lb ?? "",
    drum_speed: roast?.drum_speed ?? "",
    first_crack_min: roast?.first_crack_min?.toString() ?? "",
    second_crack_min: roast?.second_crack_min?.toString() ?? "",
    bean_temp_f: roast?.bean_temp_f?.toString() ?? "",
    exhaust_temp_f: roast?.exhaust_temp_f?.toString() ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
      preset: form.preset || null,
      batch_size_lb: form.batch_size_lb || null,
      drum_speed: form.drum_speed || null,
      first_crack_min: form.first_crack_min ? parseFloat(form.first_crack_min) : null,
      second_crack_min: form.second_crack_min ? parseFloat(form.second_crack_min) : null,
      bean_temp_f: form.bean_temp_f ? parseFloat(form.bean_temp_f) : null,
      exhaust_temp_f: form.exhaust_temp_f ? parseFloat(form.exhaust_temp_f) : null,
    };

    if (roast) {
      const { error } = await supabase.from("roasts").update(payload).eq("id", roast.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("roasts").insert(payload);
      if (error) { setError(error.message); setLoading(false); return; }

      if (form.bean_id && weightIn) {
        const { data: bean } = await supabase
          .from("beans").select("quantity_g").eq("id", form.bean_id).single();
        if (bean && bean.quantity_g != null) {
          await supabase.from("beans")
            .update({ quantity_g: Math.max(0, bean.quantity_g - weightIn) })
            .eq("id", form.bean_id);
        }
      }
    }

    router.push("/roasts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic info */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Roast Info</h2>

        <div className="space-y-2">
          <Label htmlFor="bean_id">Bean</Label>
          <Select value={form.bean_id} onValueChange={(v) => set("bean_id", v ?? "")}>
            <SelectTrigger id="bean_id"><SelectValue placeholder="Select a bean" /></SelectTrigger>
            <SelectContent>
              {beans.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roasted_at">Date & time *</Label>
          <Input id="roasted_at" type="datetime-local" value={form.roasted_at}
            onChange={(e) => set("roasted_at", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="weight_in_g">Weight in (g)</Label>
            <Input id="weight_in_g" type="number" min="0" step="1"
              value={form.weight_in_g} onChange={(e) => set("weight_in_g", e.target.value)}
              placeholder="e.g. 250" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_out_g">Weight out (g)</Label>
            <Input id="weight_out_g" type="number" min="0" step="1"
              value={form.weight_out_g} onChange={(e) => set("weight_out_g", e.target.value)}
              placeholder="e.g. 210" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="roast_level">Roast level</Label>
            <Select value={form.roast_level} onValueChange={(v) => set("roast_level", v ?? "")}>
              <SelectTrigger id="roast_level"><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_min">Total time (min)</Label>
            <Input id="duration_min" type="number" min="0" step="0.5"
              value={form.duration_min} onChange={(e) => set("duration_min", e.target.value)}
              placeholder="e.g. 14" />
          </div>
        </div>
      </div>

      {/* Behmore settings */}
      <div className="space-y-4 border-t pt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Behmore Settings</h2>

        <div className="space-y-2">
          <Label htmlFor="preset">Preset profile</Label>
          <Select value={form.preset} onValueChange={(v) => set("preset", v ?? "")}>
            <SelectTrigger id="preset"><SelectValue placeholder="Select preset" /></SelectTrigger>
            <SelectContent>
              {["P1","P2","P3","P4","P5","manual"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.preset && PRESET_DESCRIPTIONS[form.preset] && (
            <p className="text-xs text-muted-foreground">{PRESET_DESCRIPTIONS[form.preset]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="batch_size_lb">Batch size</Label>
            <Select value={form.batch_size_lb} onValueChange={(v) => set("batch_size_lb", v ?? "")}>
              <SelectTrigger id="batch_size_lb"><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">¼ lb (113g)</SelectItem>
                <SelectItem value="0.5">½ lb (227g)</SelectItem>
                <SelectItem value="1">1 lb (454g)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drum_speed">Drum speed</Label>
            <Select value={form.drum_speed} onValueChange={(v) => set("drum_speed", v ?? "")}>
              <SelectTrigger id="drum_speed"><SelectValue placeholder="Select speed" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (8 RPM)</SelectItem>
                <SelectItem value="high">High (16 RPM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first_crack_min">1st crack (min)</Label>
            <Input id="first_crack_min" type="number" min="0" step="0.25"
              value={form.first_crack_min} onChange={(e) => set("first_crack_min", e.target.value)}
              placeholder="e.g. 9.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="second_crack_min">2nd crack (min)</Label>
            <Input id="second_crack_min" type="number" min="0" step="0.25"
              value={form.second_crack_min} onChange={(e) => set("second_crack_min", e.target.value)}
              placeholder="e.g. 12.0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="bean_temp_f">Bean temp °F (A)</Label>
            <Input id="bean_temp_f" type="number" min="0" step="1"
              value={form.bean_temp_f} onChange={(e) => set("bean_temp_f", e.target.value)}
              placeholder="e.g. 385" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exhaust_temp_f">Exhaust temp °F (B)</Label>
            <Input id="exhaust_temp_f" type="number" min="0" step="1"
              value={form.exhaust_temp_f} onChange={(e) => set("exhaust_temp_f", e.target.value)}
              placeholder="e.g. 310" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="First crack sound, aroma, manual adjustments made, cup notes…"
          rows={3} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-amber-700 hover:bg-amber-800" disabled={loading}>
          {loading ? "Saving…" : roast ? "Save changes" : "Log roast"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
