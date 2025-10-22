"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Fix Leaflet default marker
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ Mapping technical → human-friendly names + units
const propertyInfo: Record<
  string,
  { label: string; unit?: string; scale?: number }
> = {
  
  phh2o: { label: "Soil pH (H₂O)", scale: 0.1 }, // values are ×10
  nitrogen: { label: "Nitrogen", unit: "%", scale: 0.1 }, // values are ×10
  bdod: { label: "Phosphorus", unit: "mg/kg" },
  soc: { label: "Soil Organic Carbon", unit: "g/kg", scale: 1 },
  sand: { label: "Sand Content", unit: "%", scale: 0.1 },
  silt: { label: "Silt Content", unit: "%", scale: 0.1 },
  clay: { label: "Clay Content", unit: "%", scale: 0.1 },
  cec: { label: "Cation Exchange Capacity", unit: "cmol/kg", scale: 0.1 },
  ocd: { label: "Organic Carbon Density", unit: "kg/m²", scale: 1 },
  wv0033: { label: "Potassium Content", unit: "mg/kg" },
  wv1500: { label: "Water Retention at 1500 kPa", unit: "vol%" },
  
};

// ✅ Formatter with scaling
function formatValue(value: number, unit?: string, scale: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const scaled = value * scale;

  let formatted: string;
  if (scaled < 1) {
    formatted = scaled.toFixed(2);
  } else if (scaled < 100) {
    formatted = scaled.toFixed(1);
  } else {
    formatted = Math.round(scaled).toString();
  }

  return unit ? `${formatted} ${unit}` : formatted;
}

export default function SoilMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [soilData, setSoilData] = useState<string[]>([]);
  const [showRedirectButton, setShowRedirectButton] = useState(false);
  const { state, setSoilData: setContextSoilData } = useApp();
  const router = useRouter();

  // ✅ Prevent "already initialized" error
  useEffect(() => {
    const container = L.DomUtil.get("map");
    if (container != null) {
      (container as any)._leaflet_id = null;
    }
  }, []);

  function LocationMarker() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setSoilData([`Fetching soil data for Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}...`]);
        
        // Set loading state in context
        setContextSoilData({ isLoading: true });

        const apiUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&properties=phh2o,nitrogen,soc,clay,silt,sand,cec,bulkdensity,ocdstock,potassium_extractable,phosphorus_extractable&depth=0-5cm`;

        try {
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("API Error: " + response.status);

          const data = await response.json();
          const layers = data.properties?.layers || [];

          if (layers.length === 0) {
            setSoilData(["No soil data available for this location."]);
            setContextSoilData({ isLoading: false });
            setShowRedirectButton(false);
            return;
          }

          const results: string[] = [];
          const soilDataObj: any = {
            latitude: lat,
            longitude: lng,
            isLoading: false,
            lastUpdated: new Date(),
          };

          for (const layer of layers) {
            const meanValue = layer.depths?.[0]?.values?.mean;
            if (meanValue !== null && meanValue !== undefined) {
              const info = propertyInfo[layer.name] || { label: layer.name, scale: 1 };
              results.push(
                `${info.label}: ${formatValue(meanValue, info.unit, info.scale)}`
              );
              
              // Map API response to our context structure
              switch (layer.name) {
                case 'phh2o':
                  soilDataObj.phh2o = meanValue * (info.scale || 1);
                  break;
                case 'nitrogen':
                  soilDataObj.nitrogen = meanValue * (info.scale || 1);
                  break;
                case 'bdod':
                  soilDataObj.phosphorus = meanValue;
                  break;
                case 'soc':
                  soilDataObj.soc = meanValue * (info.scale || 1);
                  break;
                case 'sand':
                  soilDataObj.sand = meanValue * (info.scale || 1);
                  break;
                case 'silt':
                  soilDataObj.silt = meanValue * (info.scale || 1);
                  break;
                case 'clay':
                  soilDataObj.clay = meanValue * (info.scale || 1);
                  break;
                case 'cec':
                  soilDataObj.cec = meanValue * (info.scale || 1);
                  break;
                case 'ocd':
                  soilDataObj.ocd = meanValue * (info.scale || 1);
                  break;
                case 'wv0033':
                  soilDataObj.wv0033 = meanValue;
                  break;
                case 'wv1500':
                  soilDataObj.wv1500 = meanValue;
                  break;
                
              }
            }
          }
          
          setSoilData(results);
          setContextSoilData(soilDataObj);
          setShowRedirectButton(true);
        } catch (err: any) {
          setSoilData([`Failed to fetch soil data. ${err.message}`]);
          setContextSoilData({ isLoading: false });
          setShowRedirectButton(false);
        }
      },
    });

    return position ? <Marker position={position}></Marker> : null;
  }

  // Set world bounds to prevent horizontal repeat
  const worldBounds: [[number, number], [number, number]] = [
    [-85, -180], // Southwest
    [85, 180],   // Northeast
  ];

  return (
    <div className="w-full">
      <MapContainer
        id="map"
        center={[22.5937, 78.9629]}
        zoom={5}
        minZoom={2}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
  style={{ height: "80vh", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>

      <div className="p-4 font-sans">
        {soilData.length === 0 ? (
          <p>Click on any location to fetch soil properties...</p>
        ) : (
          <>
            <ul className="list-disc ml-5 mb-4">
              {soilData.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            {showRedirectButton && (
              <div className="text-center">
                <p className="text-sm text-green-600 mb-2">
                  ✅ Soil data loaded successfully!
                </p>
                <Button 
                  onClick={() => router.push('/home/croprecommendation')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  🌱 Go to Crop Recommendation
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}