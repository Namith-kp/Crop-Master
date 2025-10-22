
/**
 * @fileOverview A Genkit tool to fetch live market prices for crops from the data.gov.in API.
 *
 * - getMarketPriceTool - A tool that returns the market price for a given crop type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

const MarketPriceOutputSchema = z.object({
  price: z.number().describe('The market price of the crop.'),
  currency: z.string().describe('The currency of the price (e.g., INR, USD, EUR).'),
  unit: z.string().describe('The unit for the price (e.g., kg, bushel, ton).'),
  cropType: z.string().describe('The type of crop for which the price is provided.'),
});
type MarketPriceOutput = z.infer<typeof MarketPriceOutputSchema>;

export const getMarketPriceTool = ai.defineTool(
  {
    name: 'getMarketPrice',
    description: 'Returns the current market price for a specified crop type using local JSON data (src/data/crop_price.json). This determines INR/kg from modal prices.',
    inputSchema: z.object({
      cropType: z.string().describe('The type of crop for which to fetch the market price (e.g., Wheat, Paddy, Cotton). The crop name should be in English.'),
    }),
    outputSchema: MarketPriceOutputSchema,
  },
  async (input) => {
    console.log(`[getMarketPriceTool] Received request for: ${input.cropType}`);

    // A fallback default price in INR (approx $0.20) for demonstration purposes.
    let priceInINR = 16.60;
    const currency = 'INR';
    const unit = 'kg';

    // Local JSON (only)
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'crop_price.json');
      const raw = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(raw);
      if (Array.isArray(json)) {
          // Helpers for robust matching
          const normalize = (v: string) => v
            .toLowerCase()
            .replace(/\((.*?)\)/g, ' ') // remove parenthetical variety names
            .replace(/[^a-z0-9\s]/g, ' ') // keep only alphanumerics/spaces
            .replace(/\s+/g, ' ') // collapse spaces
            .trim();

          const synonymMap: Record<string, string> = {
            'paddy': 'rice',
            'brinjal': 'eggplant',
            'ladyfinger': 'okra',
            'bhindi': 'okra',
            'chilli': 'dry chillies',
            'chillies': 'dry chillies',
            'chili': 'dry chillies',
            'groundnut': 'peanut',
            'arhar': 'pigeon pea',
            'arhar dal': 'pigeon pea',
            'bengal gram': 'chana',
            'green gram': 'moong',
          };

          const inputRaw = input.cropType || '';
          const inputNorm = normalize(inputRaw);
          const mapped = synonymMap[inputNorm] || inputNorm;

          const matches = json.filter((r: any) => {
            const commRaw = (r.Commodity || r.commodity || '').toString();
            const commNorm = normalize(commRaw);
            return commNorm === mapped || commNorm.includes(mapped) || mapped.includes(commNorm);
          });
          if (matches.length > 0) {
            // Sort by parsed Arrival_Date (dd/mm/yyyy). If invalid, push to end.
            const toDate = (d: string) => {
              if (!d) return 0;
              const parts = d.split('/');
              if (parts.length === 3) {
                const [dd, mm, yyyy] = parts;
                const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
                const t = date.getTime();
                return isNaN(t) ? 0 : t;
              }
              const t = new Date(d).getTime();
              return isNaN(t) ? 0 : t;
            };

            const parsed = matches
              .map((r: any) => ({ record: r, ts: toDate((r.Arrival_Date || r.arrival_date || '').toString()) }))
              .sort((a: any, b: any) => b.ts - a.ts);

            // Consider recent up to 10 records and use median to avoid outliers
            const recent = parsed.slice(0, 10).map((x: any) => x.record);
            const modals: number[] = recent
              .map((r: any) => Number(r.Modal_x0020_Price ?? r.ModalPrice ?? r.modal_price))
              .filter((n: number) => !isNaN(n) && n > 0);

            if (modals.length > 0) {
              modals.sort((a, b) => a - b);
              const mid = Math.floor(modals.length / 2);
              const median = modals.length % 2 === 0 ? (modals[mid - 1] + modals[mid]) / 2 : modals[mid];
              priceInINR = median / 100; // per quintal to per kg
              console.log(`[getMarketPriceTool] Local JSON fallback (matched='${mapped}', n=${modals.length}) price for ${input.cropType}: ₹${priceInINR.toFixed(2)}/kg`);
            } else {
              console.log('[getMarketPriceTool] Local JSON fallback had no valid modal prices in matched records.');
            }
          } else {
            console.log(`[getMarketPriceTool] Local JSON had no entries for '${inputRaw}' (normalized='${mapped}').`);
          }
      }
    } catch (e) {
      console.log('[getMarketPriceTool] Failed to read local crop_price.json:', e);
    }

    // Return a structured response
    return {
      price: parseFloat(priceInINR.toFixed(2)),
      currency,
      unit,
      cropType: input.cropType,
    };
  }
);
