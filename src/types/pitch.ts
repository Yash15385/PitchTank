export type SharkType = 'money' | 'customers' | 'numbers' | 'rivals' | 'founder';

export type SharkStatus = 'WAITING' | 'LISTENING' | 'OUT' | 'IN';

export interface UnitEconomics {
  sell: number;
  cost: number;
  profit: number;
  currency?: string;
  unitLabel?: string;
  marginPercent?: number;
}

export interface SharkResponse {
  shark: SharkType;
  sharkName: string;
  title: string;
  avatarEmoji?: string;
  status: 'OUT' | 'IN';
  sharpQuestion: string;
  fixItem: string;
  harshQuote: string;
  offerDetails?: string;
  unitEconomics?: UnitEconomics;
}

export interface PitchSubmission {
  startupName: string;
  oneLiner: string;
  askAmount: string;
  askEquity: string;
  apiKey?: string;
  provider?: 'gemini' | 'openrouter' | 'simulation';
}

export interface SharkFixRebuttal {
  shark: SharkType;
  fixItem: string;
  rebuttal: string;
  checked: boolean;
}

export interface RePitchSubmission {
  startupName: string;
  oneLiner: string;
  askAmount: string;
  askEquity: string;
  fixes: SharkFixRebuttal[];
  apiKey?: string;
  provider?: 'gemini' | 'openrouter' | 'simulation';
}

export interface PitchApiResponse {
  success: boolean;
  sharks: SharkResponse[];
  round: number;
  message?: string;
  error?: string;
}
