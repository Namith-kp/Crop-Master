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

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

// Crop information database
const cropInfo: Record<string, {
  name: string;
  description: string;
  growingSeason: string;
  waterRequirement: string;
  yieldPotential: string;
  marketPrice?: number;
  benefits: string[];
  growingTips: string[];
}> = {
  rice: {
    name: "Rice",
    description: "A staple food crop that thrives in warm, humid conditions with plenty of water.",
    growingSeason: "Kharif (June-October)",
    waterRequirement: "High (1200-1500mm)",
    yieldPotential: "4-6 tons/hectare",
    benefits: ["High nutritional value", "Staple food", "Good market demand"],
    growingTips: ["Ensure proper water management", "Use quality seeds", "Monitor for pests"]
  },
  wheat: {
    name: "Wheat",
    description: "A winter crop that requires cool temperatures and moderate rainfall.",
    growingSeason: "Rabi (October-March)",
    waterRequirement: "Medium (400-600mm)",
    yieldPotential: "3-5 tons/hectare",
    benefits: ["High protein content", "Good storage life", "Stable market"],
    growingTips: ["Plant in well-drained soil", "Use proper spacing", "Control weeds"]
  },
  maize: {
    name: "Maize",
    description: "A versatile crop that can be grown in various conditions and seasons.",
    growingSeason: "Kharif/Rabi (Year-round)",
    waterRequirement: "Medium (500-800mm)",
    yieldPotential: "5-8 tons/hectare",
    benefits: ["High yield potential", "Multiple uses", "Good for rotation"],
    growingTips: ["Plant in rows", "Ensure good drainage", "Fertilize properly"]
  },
  cotton: {
    name: "Cotton",
    description: "A cash crop that requires warm temperatures and moderate rainfall.",
    growingSeason: "Kharif (April-October)",
    waterRequirement: "Medium (600-1000mm)",
    yieldPotential: "2-4 bales/hectare",
    benefits: ["High value crop", "Industrial use", "Export potential"],
    growingTips: ["Control pests carefully", "Use proper spacing", "Monitor soil moisture"]
  },
  sugarcane: {
    name: "Sugarcane",
    description: "A tropical crop that requires high temperatures and abundant water.",
    growingSeason: "Year-round",
    waterRequirement: "Very High (1500-2500mm)",
    yieldPotential: "80-120 tons/hectare",
    benefits: ["High sugar content", "Multiple products", "Good income"],
    growingTips: ["Ensure adequate irrigation", "Use disease-resistant varieties", "Proper harvesting"]
  },
  potato: {
    name: "Potato",
    description: "A cool-season crop that grows well in well-drained, fertile soil.",
    growingSeason: "Rabi (October-March)",
    waterRequirement: "Medium (400-600mm)",
    yieldPotential: "25-40 tons/hectare",
    benefits: ["High nutritional value", "Good storage", "Multiple uses"],
    growingTips: ["Use certified seeds", "Control blight", "Proper curing"]
  },
  tomato: {
    name: "Tomato",
    description: "A warm-season crop that requires consistent moisture and good drainage.",
    growingSeason: "Year-round",
    waterRequirement: "Medium (500-700mm)",
    yieldPotential: "40-60 tons/hectare",
    benefits: ["High vitamin content", "Good market demand", "Multiple varieties"],
    growingTips: ["Support plants", "Control diseases", "Harvest regularly"]
  },
  onion: {
    name: "Onion",
    description: "A cool-season crop that requires well-drained soil and moderate water.",
    growingSeason: "Rabi (October-March)",
    waterRequirement: "Low-Medium (300-500mm)",
    yieldPotential: "20-35 tons/hectare",
    benefits: ["Good storage life", "High demand", "Export potential"],
    growingTips: ["Plant in raised beds", "Control thrips", "Proper curing"]
  }
};

// Mock market prices (in INR per kg)
const marketPrices: Record<string, number> = {
  rice: 45,
  wheat: 35,
  maize: 25,
  cotton: 120,
  sugarcane: 3,
  potato: 20,
  tomato: 30,
  onion: 25
};

export default function CropResultPage() {
  const params = useSearchParams();

  // get input values from query
  const input = {
    N: Number(params.get("N")),
    P: Number(params.get("P")),
    K: Number(params.get("K")),
    temperature: Number(params.get("temperature")),
    humidity: Number(params.get("humidity")),
    ph: Number(params.get("ph")),
    rainfall: Number(params.get("rainfall")),
  };

  // if invalid input, return error message
  if (Object.values(input).some((val) => isNaN(val))) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-red-600 font-semibold text-lg">
          ⚠ Invalid input values. Please go back and fill all fields.
        </p>
      </main>
    );
  }

  // compute distance for each crop
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
    .sort((a, b) => a.score - b.score);

  // pick top 3 unique crops
  const topUniqueCrops: Crop[] = [];
  const seen = new Set<string>();

  for (const crop of rankedCrops) {
    if (!seen.has(crop.label)) {
      topUniqueCrops.push(crop);
      seen.add(crop.label);
    }
    if (topUniqueCrops.length === 3) break;
  }

  // Calculate suitability percentage and match quality
  const maxScore = topUniqueCrops[topUniqueCrops.length - 1]?.score || 1;
  const minScore = topUniqueCrops[0]?.score || 0;
  
  const chartData = topUniqueCrops.map((crop, index) => {
    // Calculate suitability percentage (higher is better)
    const suitability = Math.max(0, Math.round(((maxScore - (crop.score ?? 0)) / (maxScore - minScore)) * 100));
    
    // Determine match quality
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
      score: crop.score
    };
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            🌾 Your Personalized Crop Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            Based on your soil and environmental conditions
          </p>
        </CardHeader>
        <CardContent>
          {topUniqueCrops.length > 0 ? (
            <>
              <ul className="space-y-4 mb-6">
                {chartData.map((crop, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-xl shadow-sm bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{crop.matchIcon}</span>
                        <div>
                          <p className="text-lg font-bold text-gray-800">
                            #{crop.rank}: {crop.name}
                          </p>
                          <p className={`text-sm font-medium ${crop.matchColor}`}>
                            {crop.matchQuality} Match
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {crop.suitability}%
                        </p>
                        <p className="text-xs text-gray-500">Suitability</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${crop.suitability}%` }}
                      ></div>
                    </div>
                    
                    {/* Additional insights */}
                    <div className="text-xs text-gray-600 mt-2">
                      {crop.suitability >= 80 && "🎯 Perfect match for your soil conditions!"}
                      {crop.suitability >= 60 && crop.suitability < 80 && "✅ Well-suited for your growing conditions"}
                      {crop.suitability < 60 && "⚠️ Consider soil amendments for better results"}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Suitability Chart */}
              <div className="h-64">
                <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
                  📊 Crop Suitability Comparison
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} label={{ value: 'Suitability %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Suitability']}
                      labelFormatter={(label) => `Crop: ${label}`}
                    />
                    <Bar dataKey="suitability" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-center text-red-600">No recommendations found.</p>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
              📋 Analysis Based On Your Input
            </h4>
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