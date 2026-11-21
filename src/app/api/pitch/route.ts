import { NextRequest, NextResponse } from 'next/server';
import { SharkType, SharkResponse, PitchApiResponse } from '@/types/pitch';
import {
  SHARK_PROFILES,
  generateSimulatedSharkResponse,
  evaluateRePitchRebuttal,
  estimateUnitEconomics,
} from '@/lib/sharkArchetypes';

export const maxDuration = 60; // Allow sufficient time for parallel LLM calls

const SHARK_TYPES: SharkType[] = ['money', 'customers', 'numbers', 'rivals', 'founder'];

async function callGeminiShark(
  sharkType: SharkType,
  startupName: string,
  oneLiner: string,
  askAmount: string,
  askEquity: string,
  apiKey: string
): Promise<SharkResponse | null> {
  const profile = SHARK_PROFILES[sharkType];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
You are evaluating this startup pitch on PitchTank.
Startup Name: ${startupName}
One-Line Pitch: ${oneLiner}
Ask: ${askAmount} for ${askEquity}

You must evaluate this pitch through your lens as ${profile.name} (${profile.badge}).
In Round 1, unless the pitch is shockingly flawless and dirt cheap, you should almost certainly be "OUT" and grill the founder with a sharp question, harsh reaction, and specific fix demand.
If you are Numbers Shark, provide realistic unit economics estimate (sell, cost, profit).

Respond strictly with a JSON object:
{
  "status": "OUT" | "IN",
  "sharpQuestion": "...",
  "fixItem": "...",
  "harshQuote": "...",
  "offerDetails": "..." ${sharkType === 'numbers' ? ',\n  "unitEconomics": { "sell": 100, "cost": 60, "profit": 40 }' : ''}
}
`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${profile.systemPrompt}\n\n${promptText}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      console.warn(`Gemini API call failed for ${sharkType}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return null;

    const parsed = JSON.parse(candidate);
    return {
      shark: sharkType,
      sharkName: profile.name,
      title: profile.badge,
      status: parsed.status === 'IN' ? 'IN' : 'OUT',
      sharpQuestion: parsed.sharpQuestion || profile.tagline,
      fixItem: parsed.fixItem || `Restructure terms to satisfy ${profile.badge} standards.`,
      harshQuote: parsed.harshQuote || `I cannot invest right now. For that reason, I am OUT.`,
      offerDetails: parsed.offerDetails || undefined,
      unitEconomics: parsed.unitEconomics || (sharkType === 'numbers' ? estimateUnitEconomics(startupName, oneLiner) : undefined),
    };
  } catch (err) {
    console.warn(`Gemini call error for ${sharkType}:`, err);
    return null;
  }
}

async function callOpenRouterShark(
  sharkType: SharkType,
  startupName: string,
  oneLiner: string,
  askAmount: string,
  askEquity: string,
  apiKey: string
): Promise<SharkResponse | null> {
  const profile = SHARK_PROFILES[sharkType];
  const url = `https://openrouter.ai/api/v1/chat/completions`;

  const userPrompt = `
Startup Name: ${startupName}
One-Line Pitch: ${oneLiner}
Ask: ${askAmount} for ${askEquity}

Evaluate as ${profile.name} (${profile.badge}).
Return pure JSON with:
{
  "status": "OUT" | "IN",
  "sharpQuestion": "...",
  "fixItem": "...",
  "harshQuote": "...",
  "offerDetails": "..." ${sharkType === 'numbers' ? ',\n  "unitEconomics": { "sell": 100, "cost": 60, "profit": 40 }' : ''}
}
`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pitchtank.app',
        'X-Title': 'PitchTank',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: profile.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      shark: sharkType,
      sharkName: profile.name,
      title: profile.badge,
      status: parsed.status === 'IN' ? 'IN' : 'OUT',
      sharpQuestion: parsed.sharpQuestion || profile.tagline,
      fixItem: parsed.fixItem || `Restructure terms for ${profile.badge}.`,
      harshQuote: parsed.harshQuote || `For that reason, I am OUT.`,
      offerDetails: parsed.offerDetails || undefined,
      unitEconomics: parsed.unitEconomics || (sharkType === 'numbers' ? estimateUnitEconomics(startupName, oneLiner) : undefined),
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupName, oneLiner, askAmount, askEquity, apiKey, provider, isRePitch, fixes } = body;

    if (!startupName || !oneLiner) {
      return NextResponse.json(
        { success: false, error: 'Startup Name and Pitch are required' },
        { status: 400 }
      );
    }

    const cleanAmount = askAmount || '₹50 Lakh';
    const cleanEquity = askEquity || '5%';
    const resolvedKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    const resolvedProvider = provider || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENROUTER_API_KEY ? 'openrouter' : 'auto');

    // ROUND 2 RE-PITCH HANDLER
    if (isRePitch && Array.isArray(fixes)) {
      const rePitchResults: SharkResponse[] = fixes.map((item: { shark: SharkType; fixItem: string; rebuttal: string; checked: boolean }) => {
        const appraisal = evaluateRePitchRebuttal(
          item.shark,
          item.fixItem,
          item.rebuttal,
          item.checked,
          cleanAmount
        );

        const profile = SHARK_PROFILES[item.shark];
        return {
          shark: item.shark,
          sharkName: profile.name,
          title: profile.badge,
          status: appraisal.status,
          sharpQuestion: appraisal.status === 'IN' ? `Can you scale this turnaround model nationwide?` : `Why should I trust this without third-party proof?`,
          fixItem: item.fixItem,
          harshQuote: appraisal.quote,
          offerDetails: appraisal.offerDetails,
          unitEconomics: item.shark === 'numbers' ? estimateUnitEconomics(startupName, oneLiner) : undefined,
        };
      });

      const res: PitchApiResponse = {
        success: true,
        round: 2,
        sharks: rePitchResults,
        message: 'Re-pitch evaluated by the 5-shark panel!',
      };
      return NextResponse.json(res);
    }

    // ROUND 1 PITCH EVALUATION: 5 System Prompts in Parallel using Promise.all
    let sharkResponses: SharkResponse[] = [];

    const targetSharks: SharkType[] = Array.isArray(body.sharks) && body.sharks.length > 0
      ? body.sharks
      : ['money', 'customers', 'numbers', 'rivals'];

    if (resolvedKey) {
      const promises = targetSharks.map(async (type) => {
        let res: SharkResponse | null = null;
        if (resolvedProvider === 'openrouter' || (resolvedKey.startsWith('sk-or-') && resolvedProvider !== 'gemini')) {
          res = await callOpenRouterShark(type, startupName, oneLiner, cleanAmount, cleanEquity, resolvedKey);
        } else {
          res = await callGeminiShark(type, startupName, oneLiner, cleanAmount, cleanEquity, resolvedKey);
        }

        // Fallback to high-quality simulation if LLM timeout/rate limit happens
        return res || generateSimulatedSharkResponse(type, startupName, oneLiner, cleanAmount, cleanEquity);
      });

      sharkResponses = await Promise.all(promises);
    } else {
      // High-performance intelligent simulation fallback
      sharkResponses = targetSharks.map((type) =>
        generateSimulatedSharkResponse(type, startupName, oneLiner, cleanAmount, cleanEquity)
      );
    }

    const responsePayload: PitchApiResponse = {
      success: true,
      round: 1,
      sharks: sharkResponses,
      message: 'Pitch evaluated by all 5 sharks in parallel!',
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('API /api/pitch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error evaluating pitch' },
      { status: 500 }
    );
  }
}
