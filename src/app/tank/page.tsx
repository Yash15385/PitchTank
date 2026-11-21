'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SharkType, SharkResponse, SharkFixRebuttal, PitchApiResponse } from '@/types/pitch';
import { VideoStyleStage } from '@/components/VideoStyleStage';
import { SharkCard } from '@/components/SharkCard';
import { ChalkboardFixList } from '@/components/ChalkboardFixList';
import { Round2RePitch } from '@/components/Round2RePitch';
import { TermSheetReceipt } from '@/components/TermSheetReceipt';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { sound } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  Key,
  Users,
  Eye,
} from 'lucide-react';

const FOUR_SHARKS: SharkType[] = ['money', 'customers', 'numbers', 'rivals'];

function TankStageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pitch state
  const [startupName, setStartupName] = useState('KulladKarts');
  const [oneLiner, setOneLiner] = useState('Automated clay-cup chai dispensing kiosks brewing authentic tea in 30 seconds at railway stations');
  const [askAmount, setAskAmount] = useState('₹50 Lakh');
  const [askEquity, setAskEquity] = useState('5%');

  // Sharks state
  const [sharks, setSharks] = useState<SharkResponse[]>([]);
  const [rebuttals, setRebuttals] = useState<SharkFixRebuttal[]>([]);
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'video' | 'chalkboard'>('video');

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openrouter' | 'simulation'>('simulation');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('pitchtank_apikey') || '';
      const savedProvider = (localStorage.getItem('pitchtank_provider') as 'gemini' | 'openrouter' | 'simulation') || 'simulation';
      setApiKey(savedKey);
      setProvider(savedProvider);
      setIsMuted(sound.isMuted());

      // 1. Check URL Search Params
      const qName = searchParams.get('name');
      const qPitch = searchParams.get('pitch');
      const qAsk = searchParams.get('ask');
      const qEq = searchParams.get('eq');

      if (qName && qPitch) {
        const resolvedName = decodeURIComponent(qName);
        const resolvedPitch = decodeURIComponent(qPitch);
        const resolvedAsk = qAsk ? decodeURIComponent(qAsk) : '₹50 Lakh';
        const resolvedEq = qEq ? decodeURIComponent(qEq) : '5%';

        setStartupName(resolvedName);
        setOneLiner(resolvedPitch);
        setAskAmount(resolvedAsk);
        setAskEquity(resolvedEq);

        initializePanel(resolvedName, resolvedPitch, resolvedAsk, resolvedEq, savedKey, savedProvider);
        return;
      }

      // 2. Fallback to Storage
      const rawPitch = sessionStorage.getItem('pitchtank_pitch') || localStorage.getItem('pitchtank_pitch');
      if (rawPitch) {
        try {
          const parsed = JSON.parse(rawPitch);
          const resolvedName = parsed.startupName || 'KulladKarts';
          const resolvedPitch = parsed.oneLiner || 'Automated clay-cup chai dispensing kiosks brewing authentic tea in 30 seconds';
          const resolvedAsk = parsed.askAmount || '₹50 Lakh';
          const resolvedEq = parsed.askEquity || '5%';

          setStartupName(resolvedName);
          setOneLiner(resolvedPitch);
          setAskAmount(resolvedAsk);
          setAskEquity(resolvedEq);

          initializePanel(resolvedName, resolvedPitch, resolvedAsk, resolvedEq, savedKey, savedProvider);
          return;
        } catch {
          // fallback
        }
      }

      // 3. Default
      initializePanel(startupName, oneLiner, askAmount, askEquity, savedKey, savedProvider);
    }
  }, [searchParams]);

  const initializePanel = async (
    name: string,
    pitch: string,
    askAmt: string,
    askEq: string,
    key: string,
    prov: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName: name,
          oneLiner: pitch,
          askAmount: askAmt,
          askEquity: askEq,
          sharks: FOUR_SHARKS,
          apiKey: key || undefined,
          provider: prov,
        }),
      });

      const json: PitchApiResponse = await res.json();
      if (json.success && json.sharks) {
        setSharks(json.sharks);
        const initRebuttals: SharkFixRebuttal[] = json.sharks.map((s) => ({
          shark: s.shark,
          fixItem: s.fixItem,
          rebuttal: '',
          checked: false,
        }));
        setRebuttals(initRebuttals);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerShark = async (sharkType: SharkType, answerText: string) => {
    setIsLoading(true);
    try {
      const activeSharkObj = sharks.find((s) => s.shark === sharkType);
      const res = await fetch('/api/tank/cross-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName,
          oneLiner,
          askAmount,
          askEquity,
          shark: sharkType,
          question: activeSharkObj?.sharpQuestion || 'Why should I invest?',
          founderAnswer: answerText,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.status === 'IN') {
          sound.playDealSound();
          setSharks((prev) =>
            prev.map((s) =>
              s.shark === sharkType
                ? {
                    ...s,
                    status: 'IN',
                    harshQuote: data.reaction,
                    offerDetails: data.offerDetails || `${askAmount} for ${askEquity}`,
                  }
                : s
            )
          );
        } else {
          sound.playStampSound();
          setSharks((prev) =>
            prev.map((s) =>
              s.shark === sharkType
                ? { ...s, status: 'OUT', harshQuote: data.reaction }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error('Answer submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleSaveApiKey = (key: string, prov: 'gemini' | 'openrouter' | 'simulation') => {
    setApiKey(key);
    setProvider(prov);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pitchtank_apikey', key);
      localStorage.setItem('pitchtank_provider', prov);
    }
  };

  const handleToggleCheck = (sharkType: string) => {
    setRebuttals((prev) =>
      prev.map((r) => (r.shark === sharkType ? { ...r, checked: !r.checked } : r))
    );
  };

  const handleUpdateRebuttal = (sharkType: string, text: string) => {
    setRebuttals((prev) =>
      prev.map((r) => (r.shark === sharkType ? { ...r, rebuttal: text } : r))
    );
  };

  const handleSubmitRePitch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName,
          oneLiner,
          askAmount,
          askEquity,
          sharks: FOUR_SHARKS,
          isRePitch: true,
          fixes: rebuttals,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const json: PitchApiResponse = await res.json();
      if (json.success && json.sharks) {
        setSharks(json.sharks);
        setRound(2);
        const inCount = json.sharks.filter((s) => s.status === 'IN').length;
        if (inCount > 0) {
          sound.playDealSound();
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#2E7D32', '#D9534F', '#F59E0B', '#2E4A3E', '#F5F0E6'],
          });
        }
      }
    } catch (err) {
      console.error('Re-pitch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const inCount = sharks.filter((s) => s.status === 'IN').length;

  return (
    <main className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between pb-3 mb-2 border-b-2 border-dashed border-[#D4C3A3] text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#231F20] bg-white hover:bg-stone-100 shadow-[2px_2px_0px_#231F20] flex items-center gap-1.5 font-bold text-[#231F20] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pitch Room
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D9534F] text-white font-bold text-[10px] uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE TANK BROADCAST
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border-2 border-[#231F20] rounded-lg overflow-hidden shadow-[2px_2px_0px_#231F20]">
              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  setViewMode('video');
                }}
                className={`px-2.5 py-1 text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'video'
                    ? 'bg-[#2E4A3E] text-white'
                    : 'bg-white hover:bg-stone-100 text-[#231F20]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Stage Arena
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  setViewMode('chalkboard');
                }}
                className={`px-2.5 py-1 text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'chalkboard'
                    ? 'bg-[#2E4A3E] text-white'
                    : 'bg-white hover:bg-stone-100 text-[#231F20]'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Chalkboard Fixes
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded border border-[#231F20] bg-white hover:bg-stone-100 shadow-[1px_1px_0px_#231F20] cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
            </button>

            {/* API Key Modal Button */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-1.5 rounded border border-[#231F20] bg-white hover:bg-stone-100 shadow-[1px_1px_0px_#231F20] cursor-pointer"
              title="Configure AI Engine"
            >
              <Key className="w-3.5 h-3.5 text-[#2E4A3E]" />
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* PRIMARY VIEW: THE VIDEO-STYLE LIVE STAGE ARENA                 */}
        {/* ============================================================== */}
        {viewMode === 'video' ? (
          <div>
            <VideoStyleStage
              startupName={startupName}
              oneLiner={oneLiner}
              askAmount={askAmount}
              askEquity={askEquity}
              sharks={sharks}
              onAnswerShark={handleAnswerShark}
              onProceedToVerdicts={() => {
                sound.playDealSound();
                setViewMode('chalkboard');
              }}
              isEvaluating={isLoading}
            />
          </div>
        ) : (
          /* ============================================================== */
          /* SECONDARY VIEW: CHALKBOARD FIX LIST, VERDICTS & ROUND 2         */
          /* ============================================================== */
          <div className="space-y-6 pt-2">
            {/* The 4 Shark Cards with Placards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharks.map((shark, idx) => (
                <SharkCard key={shark.shark} shark={shark} index={idx} />
              ))}
            </div>

            {/* Interactive Chalkboard Fix List */}
            <ChalkboardFixList
              sharks={sharks}
              rebuttals={rebuttals}
              onToggleCheck={handleToggleCheck}
              onUpdateRebuttal={handleUpdateRebuttal}
            />

            {/* Round 2 Re-Pitch Actions */}
            <Round2RePitch
              rebuttals={rebuttals}
              onSubmitRePitch={handleSubmitRePitch}
              onResetAll={() => router.push('/')}
              isLoading={isLoading}
              round={round}
              inCount={inCount}
            />

            {/* Deal Term Sheet Receipt */}
            {inCount > 0 && (
              <TermSheetReceipt
                startupName={startupName}
                askAmount={askAmount}
                askEquity={askEquity}
                sharks={sharks}
                onNewPitch={() => router.push('/')}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t-2 border-dashed border-[#D4C3A3] text-center font-mono text-[11px] text-[#78716C] pb-4">
        <p className="flex items-center justify-center gap-2">
          <span>PITCHTANK LIVE BROADCAST ARENA</span>
          <span>•</span>
          <span>THE SHARKS PANEL</span>
        </p>
        <p className="mt-1.5 text-xs font-serif font-medium text-[#57534E]">
          Made with 💖 by Yash
        </p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        provider={provider}
        onSave={handleSaveApiKey}
      />
    </main>
  );
}

export default function TankStagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-sm">
          Entering the Tank...
        </div>
      }
    >
      <TankStageContent />
    </Suspense>
  );
}
