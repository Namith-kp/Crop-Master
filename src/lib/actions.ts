
'use server';

import { estimateCropYield, type EstimateCropYieldInput, type EstimateCropYieldOutput } from '@/ai/flows/estimate-crop-yield';
import { suggestSuitableCrop, type SuggestCropInput, type SuggestCropOutput } from '@/ai/flows/suggest-suitable-crop';
import { z } from 'zod';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

export type EstimationHistory = EstimateCropYieldOutput & {
  id: string;
  createdAt: string;
  cropType: string;
  plotSize: number;
};

async function saveEstimation(
  data: EstimateCropYieldOutput,
  input: EstimateCropYieldInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await addDoc(collection(db, 'estimations'), {
      ...data,
      cropType: input.cropType,
      plotSize: input.plotSize,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving estimation to Firestore:', error);
    // This error is not returned to the user to avoid interrupting the main flow
    return { success: false, error: 'Failed to save estimation history.' };
  }
}

export async function handleEstimateCropYield(
  data: EstimateCropYieldInput
): Promise<{ success: boolean; data?: EstimateCropYieldOutput; error?: string }> {
  try {
    // The incoming data from the form should already match the EstimateCropYieldInput type.
    // We can perform any final cleaning or validation here if necessary.
    const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ) as EstimateCropYieldInput;

    if (!cleanedData.cropType) {
      return { success: false, error: "Crop type is required." };
    }
    if (cleanedData.plotSize === undefined) {
      return { success: false, error: "Plot size is required." };
    }
    
    const result = await estimateCropYield(cleanedData);

    // Save the result to Firestore, but don't block the user if it fails
    saveEstimation(result, cleanedData);

    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleEstimateCropYield:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ') };
    }
    if (error instanceof Error && error.message) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to estimate crop yield. Please try again.' };
  }
}

export async function handleSuggestCrop(
  data: Record<string, unknown>
): Promise<{ success: boolean; data?: SuggestCropOutput; error?: string }> {
  try {
    const cleanedEntries = Object.entries(data).filter(([key, v]) => 
      v !== undefined && v !== '' && v !== null && !['cropType', 'plotSize', 'photoDataUri'].includes(key)
    );
    const numericKeys: Array<keyof SuggestCropInput> = [
      'magnesium','sodium','nitrogen','water','sunlight','pH','phosphorus','potassium','calcium','sulfur','iron','manganese','zinc','copper','boron','molybdenum','chlorine','nickel','aluminum','silicon','cobalt','vanadium','selenium','iodine','arsenic','lead','cadmium','mercury'
    ];
    const cleanedData: SuggestCropInput = {} as SuggestCropInput;
    for (const [key, value] of cleanedEntries) {
      if (numericKeys.includes(key as keyof SuggestCropInput)) {
        const num = typeof value === 'string' ? parseFloat(value) : (value as number);
        if (!isNaN(num as number)) {
          (cleanedData as any)[key] = num;
        }
      } else if (key === 'atmosphericGases') {
        (cleanedData as any)[key] = String(value);
      }
    }

    const result = await suggestSuitableCrop(cleanedData);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleSuggestCrop:', error);
    if (error instanceof Error && error.message) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to suggest crops. Please try again.' };
  }
}

export async function getEstimationHistory(): Promise<{
  success: boolean;
  data?: EstimationHistory[];
  error?: string;
}> {
  try {
    const q = query(collection(db, 'estimations'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const history: EstimationHistory[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JSON-serializable string
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } as EstimationHistory;
    });
    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching estimation history:', error);
    return { success: false, error: 'Failed to fetch estimation history.' };
  }
}

// Location and commodity helpers using data.gov.in API
type ApiListResponse<T> = { success: true; data: T } | { success: false; error: string };

const DATA_GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

// Fallback list of Indian States and Union Territories when API key is missing
const FALLBACK_STATES: string[] = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

async function fetchDataGovRecords(filters: Record<string, string | undefined> = {}): Promise<any[]> {
  // Use provided key if available, otherwise fall back to the public demo key
  // from data.gov.in so the app works out of the box.
  const apiKey = process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23bdd000001b7573d90ad594b8c6f7c3356222ef31c';

  const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: '10000' });
  // Apply filters like state, district, market, commodity
  Object.entries(filters).forEach(([key, value]) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (trimmed && trimmed.length > 0) {
      params.append(`filters[${key}]`, trimmed);
    }
  });

  const url = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`data.gov.in request failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  const records = Array.isArray(json?.records) ? json.records : [];
  return records;
}

async function loadLocalCropPriceRecords(): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'crop_price.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error('loadLocalCropPriceRecords error:', error);
    return [];
  }
}

function normalizeString(value: string): string {
  return value
    .toLowerCase()
    .replace(/\((.*?)\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getString(r: any, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return '';
}

function isLooseMatch(a: string, b: string): boolean {
  const an = normalizeString(a);
  const bn = normalizeString(b);
  if (!an || !bn) return false;
  if (an === bn) return true;
  if (an.includes(bn) || bn.includes(an)) return true;
  const aTokens = new Set(an.split(' '));
  const bTokens = new Set(bn.split(' '));
  const [small, large] = aTokens.size <= bTokens.size ? [aTokens, bTokens] : [bTokens, aTokens];
  for (const t of small) {
    if (!large.has(t)) return false;
  }
  return true;
}

export async function getStates(): Promise<ApiListResponse<string[]>> {
  try {
    const local = await loadLocalCropPriceRecords();
    const set = new Set<string>();
    for (const r of local) {
      const state = (r.State || r.state || '').toString().trim();
      if (state) set.add(state);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return { success: true, data: list };
  } catch (error) {
    console.error('getStates (JSON) error:', error);
    return { success: false, error: 'Failed to read local states' };
  }
}

export async function getDistrictsByState(state: string): Promise<ApiListResponse<string[]>> {
  try {
    const local = await loadLocalCropPriceRecords();
    const set = new Set<string>();
    for (const r of local) {
      const rState = getString(r, 'State', 'state');
      if (!rState) continue;
      if (!isLooseMatch(rState, state)) continue;
      const district = getString(r, 'District', 'district').trim();
      if (district) set.add(district);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return { success: true, data: list };
  } catch (error) {
    console.error('getDistrictsByState (JSON) error:', error);
    return { success: false, error: 'Failed to read local districts' };
  }
}

export async function getMarkets(state: string, district?: string): Promise<ApiListResponse<string[]>> {
  try {
    const local = await loadLocalCropPriceRecords();
    const set = new Set<string>();
    for (const r of local) {
      const rState = getString(r, 'State', 'state');
      if (!rState || !isLooseMatch(rState, state)) continue;
      if (district) {
        const rDistrict = getString(r, 'District', 'district');
        if (!rDistrict || !isLooseMatch(rDistrict, district)) continue;
      }
      const market = getString(r, 'Market', 'market').trim();
      if (market) set.add(market);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return { success: true, data: list };
  } catch (error) {
    console.error('getMarkets (JSON) error:', error);
    return { success: false, error: 'Failed to read local markets' };
  }
}

export async function getCommodities(params: { state?: string; district?: string; market?: string }): Promise<ApiListResponse<string[]>> {
  // JSON-only: derive commodities from local crop_price.json using provided filters
  try {
    const local = await loadLocalCropPriceRecords();
    const set = new Set<string>();
    const stateNorm = params.state ? normalizeString(params.state) : undefined;
    const districtNorm = params.district ? normalizeString(params.district) : undefined;
    const marketNorm = params.market ? normalizeString(params.market) : undefined;
    for (const r of local) {
      if (stateNorm) {
        const rState = getString(r, 'State', 'state');
        if (!rState || !isLooseMatch(rState, params.state!)) continue;
      }
      if (districtNorm) {
        const rDistrict = getString(r, 'District', 'district');
        if (!rDistrict || !isLooseMatch(rDistrict, params.district!)) continue;
      }
      if (marketNorm) {
        const rMarket = getString(r, 'Market', 'market');
        if (!rMarket || !isLooseMatch(rMarket, params.market!)) continue;
      }
      const commodity = getString(r, 'Commodity', 'commodity').trim();
      if (commodity) set.add(commodity);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return { success: true, data: list };
  } catch (error) {
    console.error('getCommodities (JSON) error:', error);
    return { success: false, error: 'Failed to read local commodities' };
  }
}
