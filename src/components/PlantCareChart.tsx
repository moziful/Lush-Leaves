"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const defaultChartData = [
  { name: "Snake Plant", purification: 92, successRate: 98 },
  { name: "Peace Lily", purification: 85, successRate: 88 },
  { name: "Boston Fern", purification: 78, successRate: 75 },
  { name: "Spider Plant", purification: 88, successRate: 92 },
  { name: "Pothos", purification: 90, successRate: 96 },
  { name: "Aloe Vera", purification: 70, successRate: 94 },
];

export default function PlantCareChart() {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState(defaultChartData);

  useEffect(() => {
    setMounted(true);
    fetch("/api/plants")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 6).map((plant: any) => {
            const successRate = plant.difficulty === "Easy" ? 95 : plant.difficulty === "Medium" ? 82 : 65;
            const desc = (plant.description || plant.short || "").toLowerCase();
            let purification = 70; // baseline
            if (desc.includes("purif") || desc.includes("clean") || desc.includes("air")) purification += 20;
            if (plant.category === "Foliage" || plant.category === "Pet Friendly") purification += 5;

            return {
              name: plant.title.split(" ")[0],
              purification: Math.min(purification, 98),
              successRate,
            };
          });
          setChartData(mapped);
        }
      })
      .catch(() => { });
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full p-2">
      <div className="mb-3">
        <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">Environmental Efficiency Metrics</h3>
        <p className="text-[9px] text-forest/70 font-medium font-sans">Air Purification Score (%) vs. Care Success Rate (%)</p>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPurification" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#95d5b2" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#95d5b2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="purification"
              name="Air Purification (%)"
              stroke="#2d6a4f"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPurification)"
            />
            <Area
              type="monotone"
              dataKey="successRate"
              name="Care Success Rate (%)"
              stroke="#95d5b2"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuccess)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
