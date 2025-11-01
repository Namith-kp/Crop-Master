"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import cropsData from "@/data/Crop_recommendation.json"; // CSV converted to JSON
import { ArrowLeft, TrendingUp, Droplets, Sun, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically load Recharts as a client-only component
const Chart = dynamic(
  async () => {
    const recharts = await import("recharts");
    const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = recharts as any;
    return function RechartsWrapper({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} label={{ value: "Suitability %", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value: number) => [`${value}%`, "Suitability"]} labelFormatter={(label: any) => `Crop: ${label}`} />
            <Bar dataKey="suitability" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    };
  },
  { ssr: false }
);

type Crop = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  label: string;
  score?: number;
};

export default function CropResultClient() {
  const params = useSearchParams();

  const input = {
    N: Number(params.get("N")),
    P: Number(params.get("P")),
    K: Number(params.get("K")),
    temperature: Number(params.get("temperature")),
    humidity: Number(params.get("humidity")),
    ph: Number(params.get("ph")),
    rainfall: Number(params.get("rainfall")),
  };

  if (Object.values(input).some((val) => isNaN(val))) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-red-600 font-semibold text-lg">
          ⚠ Invalid input values. Please go back and fill all fields.
        </p>
      </main>
    );
  }

  const rankedCrops = cropsData
    .map((crop: Crop) => {
      const diff =
        Math.abs(crop.N - input.N) +
        Math.abs(crop.P - input.P) +
        Math.abs(crop.K - input.K) +
        Math.abs(crop.temperature - input.temperature) +
        Math.abs(crop.humidity - input.humidity) +
        Math.abs(crop.ph - input.ph) +
        Math.abs(crop.rainfall - input.rainfall);

      return { ...crop, score: diff };
    })
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  const topUniqueCrops: Crop[] = [];
  const seen = new Set<string>();

  for (const crop of rankedCrops) {
    if (!seen.has(crop.label)) {
      topUniqueCrops.push(crop);
      seen.add(crop.label);
    }
    if (topUniqueCrops.length === 3) break;
  }

  const maxScore = topUniqueCrops[topUniqueCrops.length - 1]?.score || 1;
  const minScore = topUniqueCrops[0]?.score || 0;

  const chartData = topUniqueCrops.map((crop, index) => {
    const suitability = Math.max(0, Math.round(((maxScore - (crop.score ?? 0)) / (maxScore - minScore)) * 100));

    let matchQuality = "Excellent";
    let matchColor = "text-green-600";
    let matchIcon = "🌟";

    if (suitability < 60) {
      matchQuality = "Good";
      matchColor = "text-blue-600";
      matchIcon = "👍";
    } else if (suitability < 80) {
      matchQuality = "Very Good";
      matchColor = "text-green-500";
      matchIcon = "⭐";
    }

    return {
      name: crop.label,
      suitability,
      matchQuality,
      matchColor,
      matchIcon,
      rank: index + 1,
      score: crop.score,
    };
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">🌾 Your Personalized Crop Recommendations</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">Based on your soil and environmental conditions</p>
        </CardHeader>
        <CardContent>
          {topUniqueCrops.length > 0 ? (
            <>
              <ul className="space-y-4 mb-6">
                {chartData.map((crop, index) => (
                  <li key={index} className="p-4 border rounded-xl shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{crop.matchIcon}</span>
                        <div>
                          <p className="text-lg font-bold text-gray-800">#{crop.rank}: {crop.name}</p>
                          <p className={`text-sm font-medium ${crop.matchColor}`}>{crop.matchQuality} Match</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{crop.suitability}%</p>
                        <p className="text-xs text-gray-500">Suitability</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className={`bg-green-500 h-2 rounded-full transition-all duration-500 w-[${crop.suitability}%]`}></div>
                    </div>

                    <div className="text-xs text-gray-600 mt-2">
                      {crop.suitability >= 80 && "🎯 Perfect match for your soil conditions!"}
                      {crop.suitability >= 60 && crop.suitability < 80 && "✅ Well-suited for your growing conditions"}
                      {crop.suitability < 60 && "⚠️ Consider soil amendments for better results"}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="h-64">
                <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">📊 Crop Suitability Comparison</h3>
                <Chart data={chartData} />
              </div>
            </>
          ) : (
            <p className="text-center text-red-600">No recommendations found.</p>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">📋 Analysis Based On Your Input</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>🌱 Nitrogen: {input.N} ppm</div>
              <div>🌱 Phosphorus: {input.P} ppm</div>
              <div>🌱 Potassium: {input.K} ppm</div>
              <div>🌡 Temperature: {input.temperature}°C</div>
              <div>💧 Humidity: {input.humidity}%</div>
              <div>🧪 pH Level: {input.ph}</div>
              <div className="col-span-2 text-center">🌧 Rainfall: {input.rainfall} mm</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
