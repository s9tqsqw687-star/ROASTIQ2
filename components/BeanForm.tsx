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
import type { Bean } from "@/lib/types";

interface Props {
  bean?: Bean;
}

export default function BeanForm({ bean }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: bean?.name ?? "",
    origin: bean?.origin ?? "",
    variety: bean?.variety ?? "",
    processing: bean?.processing ?? "",
    supplier: bean?.supplier ?? "",
    quantity_g: bean?.quantity_g?.toString() ?? "",
    purchase_date: bean?.purchase_date ?? "",
    cost_per_kg: bean?.cost_per_kg?.toString() ?? "",
    notes: bean?.notes ?? "",
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

    const payload = {
      user_id: user!.id,
      name: form.name,
      origin: form.origin || null,
      variety: form.variety || null,
      processing: form.processing || null,
      supplier: form.supplier || null,
      quantity_g: form.quantity_g ? parseFloat(form.quantity_g) : null,
      purchase_date: form.purchase_date || null,
      cost_per_kg: form.cost_per_kg ? parseFloat(form.cost_per_kg) : null,
      notes: form.notes || null,
    };

    const { error } = bean
      ? await supabase.from("beans").update(payload).eq("id", bean.id)
      : await supabase.from("beans").insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/beans");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bean name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Ethiopia Yirgacheffe"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            value={form.origin}
            onChange={(e) => set("origin", e.target.value)}
            placeholder="e.g. Ethiopia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input
            id="variety"
            value={form.variety}
            onChange={(e) => set("variety", e.target.value)}
            placeholder="e.g. Heirloom"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="processing">Processing method</Label>
        <Select value={form.processing} onValueChange={(v) => set("processing", v ?? "")}>
          <SelectTrigger id="processing">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="washed">Washed</SelectItem>
            <SelectItem value="natural">Natural</SelectItem>
            <SelectItem value="honey">Honey</SelectItem>
            <SelectItem value="anaerobic">Anaerobic</SelectItem>
            <SelectItem value="wet-hulled">Wet-hulled</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={form.supplier}
          onChange={(e) => set("supplier", e.target.value)}
          placeholder="e.g. Sweet Maria's"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="quantity_g">Quantity (g)</Label>
          <Input
            id="quantity_g"
            type="number"
            min="0"
            step="1"
            value={form.quantity_g}
            onChange={(e) => set("quantity_g", e.target.value)}
            placeholder="e.g. 5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost_per_kg">Cost per kg ($)</Label>
          <Input
            id="cost_per_kg"
            type="number"
            min="0"
            step="0.01"
            value={form.cost_per_kg}
            onChange={(e) => set("cost_per_kg", e.target.value)}
            placeholder="e.g. 12.50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchase_date">Purchase date</Label>
        <Input
          id="purchase_date"
          type="date"
          value={form.purchase_date}
          onChange={(e) => set("purchase_date", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Tasting notes, lot info, etc."
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-amber-700 hover:bg-amber-800" disabled={loading}>
          {loading ? "Saving…" : bean ? "Save changes" : "Add bean"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
