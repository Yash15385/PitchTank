import { NextRequest, NextResponse } from 'next/server';
import { SharkType } from '@/types/pitch';
import { SHARK_PROFILES } from '@/lib/sharkArchetypes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startupName, oneLiner, askAmount, askEquity, shark, question, founderAnswer, apiKey, provider } = body;

    if (!shark || !question || !founderAnswer) {
      return NextResponse.json(
        { success: false, error: 'Shark, question, and founder answer are required.' },
        { status: 400 }
      );
    }

    const profile = SHARK_PROFILES[shark as SharkType] || SHARK_PROFILES.money;
    const resolvedKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

    // If API Key is present, call Gemini or OpenRouter
    if (resolvedKey) {
      try {
        const isOR = provider === 'openrouter' || resolvedKey.startsWith('sk-or-');
        const systemPrompt = `You are ${profile.name} (${profile.badge}), a shark on PitchTank.
The founder just pitched: ${startupName} ("${oneLiner}") asking for ${askAmount} for ${askEquity}.
You previously cross-questioned them: "${question}".
The founder responded: "${founderAnswer}".

Evaluate their response in character. Be dramatic, honest, and sharp like in Shark Tank.
Return STRICT JSON:
{
  "reaction": "Your 1-2 sentence spoken reaction to their answer directly addressed to the founder",
  "status": "IN" | "OUT" | "LEANING_IN" | "SKEPTICAL",
  "followUp": "A quick follow-up poke or final comment",
  "offerDetails": "If IN, your deal offer terms e.g. '₹50 Lakh for 8%', else null"
}`;

        if (!isOR) {
          // Gemini API
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${resolvedKey}`;
          const gemRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (gemRes.ok) {
            const data = await gemRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return NextResponse.json({ success: true, ...parsed });
            }
          }
        }
      } catch (err) {
        console.warn('Live LLM cross-question failed, falling back to heuristic:', err);
      }
    }

    // Heuristic Fallback
    const ansLower = founderAnswer.toLowerCase();
    const length = founderAnswer.trim().length;

    let status: 'IN' | 'OUT' | 'LEANING_IN' | 'SKEPTICAL' = 'SKEPTICAL';
    let reaction = '';
    let followUp = '';
    let offerDetails: string | null = null;

    if (length < 15) {
      status = 'OUT';
      reaction = `That answer is way too vague! In the real world, you just lost the customer and the investor. For that reason, I am OUT!`;
      followUp = `Give me numbers and concrete facts, not half-baked slogans.`;
    } else if (
      ansLower.includes('margin') ||
      ansLower.includes('patent') ||
      ansLower.includes('exclusive') ||
      ansLower.includes('organic') ||
      ansLower.includes('repeat') ||
      ansLower.includes('cogs') ||
      ansLower.includes('customer') ||
      ansLower.includes('mrr') ||
      ansLower.includes('full-time') ||
      ansLower.includes('contract')
    ) {
      status = 'IN';
      reaction = `Now you're speaking my language! That shows real operational depth and command of your business.`;
      followUp = `You've got conviction and the data to back it up.`;
      offerDetails = `${askAmount} for ${askEquity} (matching your ask)`;
    } else {
      status = 'LEANING_IN';
      reaction = `Interesting perspective, but I need to see how you execute on that when competitors drop their prices.`;
      followUp = `Keep sharpening those numbers.`;
    }

    return NextResponse.json({
      success: true,
      reaction,
      status,
      followUp,
      offerDetails,
    });
  } catch (err) {
    console.error('Cross-question error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process cross question' }, { status: 500 });
  }
}
