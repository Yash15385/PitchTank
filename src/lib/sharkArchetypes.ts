import { SharkType, SharkResponse, UnitEconomics } from '@/types/pitch';

export interface SharkMeta {
  type: SharkType;
  name: string;
  badge: string;
  role: string;
  avatarColor: string;
  accentColor: string;
  tagline: string;
  systemPrompt: string;
}

export const SHARK_PROFILES: Record<SharkType, SharkMeta> = {
  money: {
    type: 'money',
    name: "Vikram 'The Vault' Singhania",
    badge: "VALUATION HAWK",
    role: "VC General Partner & Deal Architect",
    avatarColor: "#1E293B",
    accentColor: "#F59E0B",
    tagline: "Your valuation isn't a forecast, it's science fiction.",
    systemPrompt: `You are Vikram 'The Vault' Singhania, a ruthless venture capitalist on PitchTank. You evaluate startups solely on deal structure, valuation reasonableness, cash runway, and exit multiples.
If the founder's valuation is unrealistic (e.g., asking for huge money with no proven scale) or dilution is flawed, you mercilessly declare "OUT".
Respond ONLY with a valid JSON object matching:
{
  "status": "OUT" or "IN",
  "sharpQuestion": "A biting 1-sentence question demanding valuation or capital sanity",
  "fixItem": "A concise actionable demand to fix before you would invest (e.g. Cut valuation by 40% and accept milestone-based tranches)",
  "harshQuote": "A dramatic retro Shark Tank style reaction (e.g. 'At this valuation, you're not selling equity, you're selling daydream lottery tickets!')",
  "offerDetails": "If IN, your exact offer terms, else null"
}`
  },
  customers: {
    type: 'customers',
    name: "Ananya 'Retention Queen' Roy",
    badge: "CONSUMER CRUSADER",
    role: "D2C Empress & Brand Alchemist",
    avatarColor: "#BE123C",
    accentColor: "#FB7185",
    tagline: "If your customer doesn't scream when you vanish, you have no business.",
    systemPrompt: `You are Ananya 'Retention Queen' Roy, an iconic consumer brand builder on PitchTank. You are obsessed with organic customer retention, Net Promoter Score, word-of-mouth virality, and customer acquisition cost (CAC).
If the startup relies on burning ads to get vanity users or has no loyal organic community, you say "OUT".
Respond ONLY with a valid JSON object matching:
{
  "status": "OUT" or "IN",
  "sharpQuestion": "A piercing 1-sentence question about customer repeat rate, churn, or user love",
  "fixItem": "A concise actionable demand for retention or community proof (e.g. Prove 35% repeat purchase rate over 90 days without paid ads)",
  "harshQuote": "A direct, stylish, no-nonsense assessment of their customer loyalty",
  "offerDetails": "If IN, your exact offer terms, else null"
}`
  },
  numbers: {
    type: 'numbers',
    name: "Prof. Murthy 'The Ledger' Swamy",
    badge: "MARGIN SURGEON",
    role: "Ex-CFO & Industrial Unit Economics Hawk",
    avatarColor: "#065F46",
    accentColor: "#34D399",
    tagline: "Revenue is vanity, profit is sanity, cash flow is reality.",
    systemPrompt: `You are Prof. Murthy 'The Ledger' Swamy, a meticulous numbers-driven shark on PitchTank. You interrogate unit economics: gross margin, COGS, supply chain leakage, packaging costs, and contribution margin per unit.
You MUST analyze the unit economics.
Respond ONLY with a valid JSON object matching:
{
  "status": "OUT" or "IN",
  "sharpQuestion": "A precise question about COGS, gross margin percentage, or logistics overhead",
  "fixItem": "A specific numerical threshold to fix (e.g. Bring manufacturing cost under 30% of MSRP and show positive contribution margin)",
  "harshQuote": "A dry, clinical critique of their leaky financial bucket",
  "offerDetails": "If IN, your exact offer terms, else null",
  "unitEconomics": {
    "sell": 1000,
    "cost": 680,
    "profit": 320,
    "currency": "₹",
    "unitLabel": "per unit/order"
  }
}`
  },
  rivals: {
    type: 'rivals',
    name: "Kabir 'The Moat' Malhotra",
    badge: "DEFENSE ARCHITECT",
    role: "Tech Monopolist & IP Strategist",
    avatarColor: "#334155",
    accentColor: "#F43F5E",
    tagline: "What stops a 500-pound gorilla from copying this over the weekend?",
    systemPrompt: `You are Kabir 'The Moat' Malhotra, an aggressive tech monopolist on PitchTank. You care about defensibility: proprietary IP, patents, high switching costs, regulatory barriers, and exclusive supplier lock-in.
If the startup is merely a wrapper, commodity reseller, or easily cloned by Amazon or Reliance, you say "OUT".
Respond ONLY with a valid JSON object matching:
{
  "status": "OUT" or "IN",
  "sharpQuestion": "A hard-hitting question challenging their defense against giants copying them",
  "fixItem": "A concrete defensibility requirement (e.g. File provisional patent on core algorithm and secure exclusive regional distribution)",
  "harshQuote": "A cynical roast regarding how easily big tech or deep-pocketed rivals will crush them",
  "offerDetails": "If IN, your exact offer terms, else null"
}`
  },
  founder: {
    type: 'founder',
    name: "Zoya 'Hustle Detective' Khan",
    badge: "GRIT & INTEGRITY",
    role: "Serial Bootstrapper & Talent Scout",
    avatarColor: "#92400E",
    accentColor: "#FBBF24",
    tagline: "I don't bet on the jockey's resume; I bet on blood, sweat, and obsession.",
    systemPrompt: `You are Zoya 'Hustle Detective' Khan, a fierce street-smart entrepreneur on PitchTank. You look deep into the founder's eyes: coachability, domain expertise, sacrifice, skin in the game, and operational endurance.
If the founder sounds like an entitled MBA pitching buzzwords without getting their hands dirty, you say "OUT".
Respond ONLY with a valid JSON object matching:
{
  "status": "OUT" or "IN",
  "sharpQuestion": "A raw, penetrating question about founder sacrifice, ground reality, or why YOU are the one to build this",
  "fixItem": "A non-negotiable operational proof of founder commitment (e.g. Commit 100% full-time and spend 60 days on the retail floor directly)",
  "harshQuote": "An intense, heartfelt, street-wise verdict on their founder conviction",
  "offerDetails": "If IN, your exact offer terms, else null"
}`
  }
};

export const SAMPLE_PITCHES = [
  {
    startupName: "KulladKarts",
    oneLiner: "Automated artisanal clay-cup chai dispensing kiosks at Tier-1 metro railway stations brewing authentic tea in 30 seconds.",
    askAmount: "₹50 Lakh",
    askEquity: "5%",
    industry: "FoodTech & Robotics"
  },
  {
    startupName: "ScrapSync",
    oneLiner: "B2B Uber for scrap metal and industrial e-waste connecting factories with verified green smelters with live spot pricing.",
    askAmount: "₹75 Lakh",
    askEquity: "8%",
    industry: "ClimateTech / Circular Economy"
  },
  {
    startupName: "AyurGlow AI",
    oneLiner: "Computer vision smartphone camera scan that diagnoses skin dosha in 10 seconds and custom-blends fresh herbal serums delivered in 48 hours.",
    askAmount: "₹1 Crore",
    askEquity: "6%",
    industry: "BeautyTech & AI"
  },
  {
    startupName: "GullyGamer",
    oneLiner: "Hyper-casual vernacular voice-activated mobile gaming tournaments for Bharat with micro-entry fees of ₹5.",
    askAmount: "₹40 Lakh",
    askEquity: "4%",
    industry: "Gaming & Vernacular"
  }
];

// Helper to compute unit economics estimate based on ask and industry
export function estimateUnitEconomics(name: string, pitch: string): UnitEconomics {
  const lower = (name + ' ' + pitch).toLowerCase();
  
  if (lower.includes('chai') || lower.includes('food') || lower.includes('beverage') || lower.includes('snack')) {
    return { sell: 25, cost: 9, profit: 16, currency: '₹', unitLabel: 'per cup', marginPercent: 64 };
  }
  if (lower.includes('scrap') || lower.includes('b2b') || lower.includes('waste') || lower.includes('logistics')) {
    return { sell: 4500, cost: 3600, profit: 900, currency: '₹', unitLabel: 'per ton commission', marginPercent: 20 };
  }
  if (lower.includes('ai') || lower.includes('skin') || lower.includes('serum') || lower.includes('health')) {
    return { sell: 899, cost: 240, profit: 659, currency: '₹', unitLabel: 'per subscription bottle', marginPercent: 73 };
  }
  if (lower.includes('game') || lower.includes('app') || lower.includes('software') || lower.includes('saas')) {
    return { sell: 150, cost: 35, profit: 115, currency: '₹', unitLabel: 'per active user/mo', marginPercent: 76 };
  }
  // Default general product
  return { sell: 1200, cost: 650, profit: 550, currency: '₹', unitLabel: 'per unit sold', marginPercent: 45 };
}

// Intelligent fallback simulation when no live API key is configured
export function generateSimulatedSharkResponse(
  type: SharkType,
  startupName: string,
  oneLiner: string,
  askAmount: string,
  askEquity: string
): SharkResponse {
  const profile = SHARK_PROFILES[type];
  const unitEco = estimateUnitEconomics(startupName, oneLiner);

  const cleanAmount = askAmount.trim();
  const cleanEquity = askEquity.trim();

  switch (type) {
    case 'money':
      return {
        shark: 'money',
        sharkName: profile.name,
        title: profile.badge,
        status: 'OUT',
        sharpQuestion: `You're valuing ${startupName} based on hope and air—where is the audited pathway to a 10x return in 3 years?`,
        fixItem: `Recalibrate your ask to match real post-money valuation benchmarks: offer 10% equity or cap valuation at ₹5 Cr with milestone release.`,
        harshQuote: `Asking ${cleanAmount} for ${cleanEquity} on an early concept isn't an investment proposition—it's highway robbery with slide decks! For that reason, I am OUT.`,
      };

    case 'customers':
      return {
        shark: 'customers',
        sharkName: profile.name,
        title: profile.badge,
        status: 'OUT',
        sharpQuestion: `What is your 90-day organic repeat rate, and why won't customers abandon you the second discount coupons dry up?`,
        fixItem: `Demonstrate that at least 30% of monthly sales come through word-of-mouth with a zero-dollar ad spend cohort.`,
        harshQuote: `You have downloads, not disciples. You bought traffic, but you don't own the customer's heart yet. Until you fix retention, I am OUT.`,
      };

    case 'numbers':
      return {
        shark: 'numbers',
        sharkName: profile.name,
        title: profile.badge,
        status: 'OUT',
        sharpQuestion: `When you factor in reverse logistics, damaged returns, and gateway fees, what is your true net contribution margin?`,
        fixItem: `Reduce bill-of-materials and distribution overhead to lock in a minimum 40% clean gross margin after all fulfillment costs.`,
        harshQuote: `Your gross margin looks pretty on paper, but your operating leaks will bleed this business dry before month 18. The numbers don't lie, and I am OUT.`,
        unitEconomics: unitEco
      };

    case 'rivals':
      return {
        shark: 'rivals',
        sharkName: profile.name,
        title: profile.badge,
        status: 'OUT',
        sharpQuestion: `If a well-funded incumbent copies your feature set next Tuesday with 10x your marketing budget, what is your moat?`,
        fixItem: `Secure proprietary IP, exclusive channel lock-ins, or build proprietary data flywheels that cannot be replicated with capital alone.`,
        harshQuote: `You built a nifty feature, not a company. The moment the sleeping giants wake up, they will swallow you whole. I'm OUT.`,
      };

    case 'founder':
      return {
        shark: 'founder',
        sharkName: profile.name,
        title: profile.badge,
        status: 'OUT',
        sharpQuestion: `How many hours have you personally spent in the trenches dealing directly with angry users, and are you 100% full-time?`,
        fixItem: `Resign from any external consulting/day-jobs, lock in 3 years founder vesting, and personally manage the frontline customer complaints.`,
        harshQuote: `You sound like a polished pitch artist, but I need a street fighter who won't quit when the bank balance hits zero. Prove your grit, but right now, I am OUT.`,
      };
  }
}

// Round 2 Re-pitch evaluation: checks if rebuttal has substance and flips OUT to IN
export function evaluateRePitchRebuttal(
  type: SharkType,
  originalFix: string,
  rebuttal: string,
  checked: boolean,
  askAmount: string
): { status: 'IN' | 'OUT'; quote: string; offerDetails?: string } {
  if (!checked || !rebuttal || rebuttal.trim().length < 10) {
    return {
      status: 'OUT',
      quote: `You didn't address my non-negotiable requirement with genuine substance. My decision remains OUT!`
    };
  }

  const text = rebuttal.toLowerCase();
  
  // Custom appraisal per shark persona
  if (type === 'money') {
    return {
      status: 'IN',
      quote: `Now that is what I call financial maturity! You listened, adjusted the terms, and gave me downside protection. I respect that.`,
      offerDetails: `${askAmount} for 8.5% equity + 2% royalty until 1.5x returned`
    };
  } else if (type === 'customers') {
    return {
      status: 'IN',
      quote: `That proof of customer obsession gave me goosebumps! You turned your users into brand evangelists. I'm proud to back you!`,
      offerDetails: `${askAmount} for original ${askAmount.includes('50') ? '6%' : '7%'} equity + D2C retail distribution access`
    };
  } else if (type === 'numbers') {
    return {
      status: 'IN',
      quote: `Your revised cost structure and tightened supply chain pass the stress test. You've plugged the leak. I am IN!`,
      offerDetails: `${askAmount} as 50% Equity / 50% low-interest venture debt`
    };
  } else if (type === 'rivals') {
    return {
      status: 'IN',
      quote: `That exclusive distribution barrier changes everything. The giants can't touch you now. Let's conquer the market!`,
      offerDetails: `${askAmount} for 10% equity with board observer seat`
    };
  } else {
    // founder
    return {
      status: 'IN',
      quote: `I see the hunger in your eyes now! That is true founder hustle. I'm putting my money where my mouth is—I'm in!`,
      offerDetails: `${askAmount} for 5% equity + personal weekly mentorship`
    };
  }
}
