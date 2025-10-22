"use client";

import dynamic from "next/dynamic";

// Dynamically load client-side only
const SoilMap = dynamic(() => import("@/components/SoilMap"), { ssr: false });

export default function SoilDataPage() {
  return (
    <main className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">
        🗺️ Click on the Map to Get Soil Data (India)
      </h2>
      <SoilMap />
    </main>
  );
}
