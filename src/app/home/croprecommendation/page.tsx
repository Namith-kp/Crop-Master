"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/contexts/AppContext";

// Field definitions with better labels and validation
const fieldDefinitions = {
  N: {
    label: "Nitrogen (N)",
    unit: "kg/ha",
    description: "Essential for leaf growth and protein synthesis",
    min: 0,
    max: 200,
    placeholder: "e.g., 90"
  },
  P: {
    label: "Phosphorus (P)",
    unit: "kg/ha", 
    description: "Important for root development and flowering",
    min: 0,
    max: 150,
    placeholder: "e.g., 42"
  },
  K: {
    label: "Potassium (K)",
    unit: "kg/ha",
    description: "Helps with disease resistance and fruit quality",
    min: 0,
    max: 200,
    placeholder: "e.g., 43"
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    description: "Average temperature during growing season",
    min: 0,
    max: 50,
    placeholder: "e.g., 25"
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    description: "Relative humidity in the growing area",
    min: 0,
    max: 100,
    placeholder: "e.g., 80"
  },
  ph: {
    label: "Soil pH",
    unit: "",
    description: "Soil acidity/alkalinity (6.0-7.5 is ideal for most crops)",
    min: 0,
    max: 14,
    placeholder: "e.g., 6.5"
  },
  rainfall: {
    label: "Rainfall",
    unit: "mm",
    description: "Annual or seasonal rainfall in your area",
    min: 0,
    max: 3000,
    placeholder: "e.g., 250"
  }
};

export default function CropRecommendationPage() {
  const [form, setForm] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSoilData, setHasSoilData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { state } = useApp();

  // Check if we have soil data available
  useEffect(() => {
    const soilData = state.soilData;
    const hasData = soilData.phh2o !== null || soilData.nitrogen !== null || soilData.phosphorus !== null || soilData.potassium !== null;
    setHasSoilData(hasData);
  }, [state.soilData]);

  const validateField = (name: string, value: string): string | null => {
    if (!value.trim()) {
      return `${fieldDefinitions[name as keyof typeof fieldDefinitions].label} is required`;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleAutoFill = () => {
    const soilData = state.soilData;
    setForm({
      N: soilData.nitrogen ? soilData.nitrogen.toString() : "",
      P: soilData.phosphorus ? soilData.phosphorus.toString() : "",
      K: soilData.wv0033 ? soilData.wv0033.toString() : "",
      temperature: "", // Not available from soil data
      humidity: "", // Not available from soil data
      ph: soilData.phh2o ? soilData.phh2o.toString() : "",
      rainfall: "", // Not available from soil data
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key as keyof typeof form]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    // Pass form values to result page
    const query = new URLSearchParams(form).toString();
    router.push(`/home/croprecommendation/result?${query}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            🌱 Crop Recommendation
          </CardTitle>
          {hasSoilData ? (
            <div className="text-center mt-2">
              <p className="text-sm text-green-600 mb-2">
                ✅ Soil data available from map!
              </p>
              <Button 
                onClick={handleAutoFill}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                🗺 Auto-fill from Soil Map
              </Button>
            </div>
          ) : (
            <div className="text-center mt-2">
              <p className="text-sm text-gray-500 mb-2">
                💡 Visit the Soil Map page to get soil data for auto-filling
              </p>
              <Button 
                onClick={() => router.push('/home/soildata')}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                🗺 Go to Soil Map
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(form).map((key) => {
              const field = fieldDefinitions[key as keyof typeof fieldDefinitions];
              const hasError = errors[key];
              
              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {field.label}
                      {field.unit && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {field.unit}
                        </Badge>
                      )}
                    </Label>
                  </div>
                  <Input
                    id={key}
                    name={key}
                    type="number"
                    value={(form as any)[key]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step="0.1"
                    className={hasError ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {hasError && (
                    <p className="text-red-500 text-xs">{hasError}</p>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="px-8 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Analyzing..." : "Get Recommendations"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}