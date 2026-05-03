export type RoastLevel = "light" | "medium" | "medium-dark" | "dark";

export interface Bean {
  id: string;
  user_id: string;
  name: string;
  origin: string | null;
  variety: string | null;
  processing: string | null;
  supplier: string | null;
  quantity_g: number | null;
  purchase_date: string | null;
  cost_per_kg: number | null;
  notes: string | null;
  created_at: string;
}

export interface Roast {
  id: string;
  user_id: string;
  bean_id: string | null;
  roasted_at: string;
  weight_in_g: number | null;
  weight_out_g: number | null;
  roast_level: RoastLevel | null;
  duration_min: number | null;
  notes: string | null;
  created_at: string;
  beans?: Pick<Bean, "id" | "name" | "origin">;
}
