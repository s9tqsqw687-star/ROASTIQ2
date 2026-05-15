"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Roast } from "@/lib/types";

interface Props {
  roasts: Roast[];
}

const AMBER = "#92400e";
const COLORS = ["#92400e", "#b45309", "#d97706", "#f59e0b", "#fbbf24", "#78350f"];
const LEVEL_COLORS: Record<string, string> = {
  light: "#fbbf24",
  medium: "#f59e0b",
  "medium-dark": "#d97706",
  dark: "#92400e",
};

export default function RoastCharts({ roasts }: Props) {
  if (roasts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No roast data yet. Log some roasts to see analytics.
        </CardContent>
      </Card>
    );
  }

  // Weight roasted over time (monthly)
  const monthlyData: Record<string, { month: string; kg: number; roasts: number }> = {};
  roasts.forEach((r) => {
    const d = new Date(r.roasted_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (!monthlyData[key]) monthlyData[key] = { month: label, kg: 0, roasts: 0 };
    monthlyData[key].kg += (r.weight_in_g ?? 0) / 1000;
    monthlyData[key].roasts += 1;
  });
  const monthlyArr = Object.values(monthlyData).map((d) => ({
    ...d,
    kg: Math.round(d.kg * 100) / 100,
  }));

  // Roast level distribution
  const levelCounts: Record<string, number> = {};
  roasts.forEach((r) => {
    const l = r.roast_level ?? "unknown";
    levelCounts[l] = (levelCounts[l] ?? 0) + 1;
  });
  const levelData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }));

  // Preset distribution
  const presetCounts: Record<string, number> = {};
  roasts.forEach((r) => {
    const p = r.preset ?? "unspecified";
    presetCounts[p] = (presetCounts[p] ?? 0) + 1;
  });
  const presetData = Object.entries(presetCounts)
    .map(([preset, count]) => ({ preset, count }))
    .sort((a, b) => b.count - a.count);

  // Yield % by roast (weight loss)
  const yieldData = roasts
    .filter((r) => r.weight_in_g && r.weight_out_g && r.weight_in_g > 0)
    .slice(-20)
    .map((r) => {
      const loss = (((r.weight_in_g! - r.weight_out_g!) / r.weight_in_g!) * 100);
      return {
        date: new Date(r.roasted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        yield: Math.round((100 - loss) * 10) / 10,
        loss: Math.round(loss * 10) / 10,
        bean: r.beans?.name ?? "Unknown",
      };
    });

  // First crack timing
  const crackData = roasts
    .filter((r) => r.first_crack_min)
    .slice(-20)
    .map((r) => ({
      date: new Date(r.roasted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      firstCrack: r.first_crack_min,
      devTime: r.second_crack_min && r.first_crack_min
        ? Math.round((r.second_crack_min - r.first_crack_min) * 10) / 10
        : null,
      total: r.duration_min,
      preset: r.preset ?? "—",
    }));

  // Avg yield by preset
  const presetYield: Record<string, { total: number; count: number }> = {};
  roasts.forEach((r) => {
    if (!r.preset || !r.weight_in_g || !r.weight_out_g) return;
    const loss = ((r.weight_in_g - r.weight_out_g) / r.weight_in_g) * 100;
    if (!presetYield[r.preset]) presetYield[r.preset] = { total: 0, count: 0 };
    presetYield[r.preset].total += 100 - loss;
    presetYield[r.preset].count += 1;
  });
  const presetYieldData = Object.entries(presetYield).map(([preset, { total, count }]) => ({
    preset,
    avgYield: Math.round((total / count) * 10) / 10,
  }));

  // Summary stats
  const totalRoasts = roasts.length;
  const totalKg = roasts.reduce((s, r) => s + (r.weight_in_g ?? 0), 0) / 1000;
  const avgYield = yieldData.length
    ? yieldData.reduce((s, d) => s + d.yield, 0) / yieldData.length
    : null;
  const avgFirstCrack = crackData.length
    ? crackData.reduce((s, d) => s + (d.firstCrack ?? 0), 0) / crackData.length
    : null;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total roasts", value: totalRoasts },
          { label: "Total weight", value: `${totalKg.toFixed(1)} kg` },
          { label: "Avg yield", value: avgYield ? `${avgYield.toFixed(1)}%` : "—" },
          { label: "Avg 1st crack", value: avgFirstCrack ? `${avgFirstCrack.toFixed(1)} min` : "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 px-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weight over time */}
      {monthlyArr.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weight Roasted per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyArr}>
                <defs>
                  <linearGradient id="kgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="kg" />
                <Tooltip formatter={(v) => [`${v} kg`, "Weight"]} />
                <Area type="monotone" dataKey="kg" stroke={AMBER} fill="url(#kgGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Yield % trend */}
      {yieldData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Yield % (Last 20 Roasts)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[75, 95]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v, name) => [`${v}%`, name === "yield" ? "Yield" : "Loss"]} />
                <Area type="monotone" dataKey="yield" stroke="#d97706" fill="url(#yieldGrad)" strokeWidth={2} name="yield" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* First crack timing */}
      {crackData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">First Crack Timing (min)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={crackData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} unit="m" />
                <Tooltip formatter={(v, name) => [`${v} min`, name === "firstCrack" ? "1st Crack" : "Dev Time"]} />
                <Bar dataKey="firstCrack" fill={AMBER} name="firstCrack" radius={[3, 3, 0, 0]} />
                <Bar dataKey="devTime" fill="#d97706" name="devTime" radius={[3, 3, 0, 0]} />
                <Legend formatter={(v) => v === "firstCrack" ? "1st Crack" : "Dev Time"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roast level distribution */}
        {levelData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Roast Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={levelData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={70} label={({ name, percent }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    } labelLine={false}>
                    {levelData.map((entry) => (
                      <Cell key={entry.name} fill={LEVEL_COLORS[entry.name] ?? COLORS[0]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Preset usage */}
        {presetData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Preset Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={presetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="preset" type="category" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill={AMBER} radius={[0, 3, 3, 0]} name="Roasts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Avg yield by preset */}
      {presetYieldData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Yield % by Preset</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={presetYieldData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="preset" tick={{ fontSize: 12 }} />
                <YAxis domain={[80, 95]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Avg Yield"]} />
                <Bar dataKey="avgYield" fill="#b45309" radius={[3, 3, 0, 0]} name="Avg Yield" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
