export type RoastLevel = "light" | "medium" | "medium-dark" | "dark";
export type BehmorPreset = "P1" | "P2" | "P3" | "P4" | "P5" | "manual";
export type BehmorBatchSize = "0.25" | "0.5" | "1";
export type BehmorDrumSpeed = "low" | "high";

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
  // Behmore-specific fields
  preset: BehmorPreset | null;
  batch_size_lb: BehmorBatchSize | null;
  drum_speed: BehmorDrumSpeed | null;
  first_crack_min: number | null;
  second_crack_min: number | null;
  bean_temp_f: number | null;
  exhaust_temp_f: number | null;
  beans?: Pick<Bean, "id" | "name" | "origin">;
}
