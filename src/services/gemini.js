/**
 * CarbonLedger — Gemini AI Service
 * Wrapper for Google Generative AI with structured prompts and fallback handling.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EMISSION_FACTORS } from './carbon-data.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
}

// ── Activity Parser ───────────────────────────────────────────────────────────

/**
 * Parse a natural language activity description into carbon entries.
 * @param {string} text - e.g. "drove to work, had a beef burger for lunch"
 * @returns {Promise<Array<{ category: string, label: string, kgCO2: number }>>}
 */
export async function parseActivity(text) {
  const prompt = `You are a carbon footprint calculator. Parse the user's description into carbon-emitting activities.

User said: "${text}"

Return a JSON array (only JSON, no markdown) of activities. Each object must have:
- "category": one of "transport", "food", "energy", "shopping", "lifestyle", "other"
- "label": short human-readable label (max 6 words)
- "kgCO2": estimated kg CO₂ equivalent (number, use these reference values):
  - Driving 10km by car: 1.92 kg
  - Bus ride 30min: 0.80 kg
  - Beef meal: 6.61 kg
  - Chicken meal: 1.38 kg
  - Veg meal: 0.40 kg
  - Hot shower 10min: 0.74 kg
  - New t-shirt: 5.5 kg
  - Short-haul flight: 195 kg
  - Coffee: 0.21 kg
  - Online grocery order: 2.8 kg

Example output: [{"category":"transport","label":"Car drive to work","kgCO2":2.88},{"category":"food","label":"Beef burger","kgCO2":5.5}]

Rules:
- Only include activities that have a carbon footprint
- kgCO2 must be a positive number
- Return empty array [] if nothing carbon-relevant was described
- Return ONLY valid JSON, nothing else`;

  try {
    const result = await getModel().generateContent(prompt);
    const text   = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(item =>
      item.category && item.label && typeof item.kgCO2 === 'number' && item.kgCO2 >= 0
    );
  } catch (err) {
    console.error('Gemini parseActivity error:', err);
    window.showToast('AI Error: ' + err.message, 'error');
    return null; // null = error, [] = no activities found
  }
}

// ── Insights Generator ────────────────────────────────────────────────────────

/**
 * Generate a 2-sentence eco insight from period data.
 * @param {{ totalKg: number, budget: number, topCategory: string, period: string, activities: Array }} periodData
 * @returns {Promise<string>}
 */
export async function getInsight(periodData) {
  const { totalKg, budget, topCategory, period, activities } = periodData;
  const budgetStatus = totalKg <= budget ? 'under budget' : `${((totalKg - budget) / budget * 100).toFixed(0)}% over budget`;

  const prompt = `You are an encouraging eco-coach. Write exactly 2 sentences of personalized insight.

User data for ${period}:
- Total emissions: ${totalKg.toFixed(1)} kg CO₂
- Budget: ${budget.toFixed(1)} kg CO₂  
- Status: ${budgetStatus}
- Top emission category: ${topCategory}
- Number of activities logged: ${activities?.length || 0}

Rules:
- Be encouraging and specific, not generic
- Mention the top category with a practical improvement tip
- Keep it to exactly 2 sentences
- No bullet points, just plain sentences
- If under budget, celebrate it`;

  try {
    const result = await getModel().generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini getInsight error:', err);
    return `You logged ${totalKg.toFixed(1)} kg CO₂ this ${period}. Your biggest opportunity is in ${topCategory} — small changes there can make the biggest difference.`;
  }
}

// ── What-If Simulator ─────────────────────────────────────────────────────────

/**
 * Analyze a what-if scenario using natural language.
 * @param {string} question - e.g. "What if I went vegetarian?"
 * @param {{ baseline: number, topCategories: Object }} userData
 * @returns {Promise<{ summary: string, annualSavingKg: number, equivalent: string }>}
 */
export async function whatIf(question, userData) {
  const prompt = `You are a carbon footprint analyst. Answer a what-if scenario.

User's current daily footprint: ${userData.baseline?.toFixed(1)} kg CO₂/day
User's question: "${question}"

Respond with ONLY a JSON object (no markdown) with these exact fields:
{
  "summary": "2-3 sentence explanation of the impact",
  "annualSavingKg": <number: estimated annual kg CO₂ saved, negative if it increases emissions>,
  "equivalent": "plain English equivalent (e.g. '= 12 trees planted per year' or '= 3 fewer flights')"
}

Base your calculation on:
- Average car produces 1.92 kg CO₂ per 10km
- Beef-free diet saves ~5 kg CO₂/day vs heavy meat eating
- Each tree absorbs ~21.7 kg CO₂/year
- Average short-haul flight emits ~255 kg CO₂

Return ONLY valid JSON.`;

  try {
    const result = await getModel().generateContent(prompt);
    const text   = result.response.text().trim();
    const clean  = text.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini whatIf error:', err);
    window.showToast('AI Error: ' + err.message, 'error');
    return {
      summary: 'Unable to calculate this scenario right now. Try rephrasing your question.',
      annualSavingKg: 0,
      equivalent: '',
    };
  }
}
