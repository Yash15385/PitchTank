'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SharkResponse, SharkFixRebuttal, PitchApiResponse } from '@/types/pitch';
import { MarqueeHeader } from '@/components/MarqueeHeader';
import { PitchForm } from '@/components/PitchForm';
import { SharkPanel } from '@/components/SharkPanel';
import { ChalkboardFixList } from '@/components/ChalkboardFixList';
import { Round2RePitch } from '@/components/Round2RePitch';
import { TermSheetReceipt } from '@/components/TermSheetReceipt';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { sound } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import { AlertCircle, Download, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PitchTankApp() {
  const router = useRouter();
  const [startupName, setStartupName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [askAmount, setAskAmount] = useState('₹50 Lakh');
  const [askEquity, setAskEquity] = useState('5%');

  const [sharks, setSharks] = useState<SharkResponse[]>([]);
  const [rebuttals, setRebuttals] = useState<SharkFixRebuttal[]>([]);
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openrouter' | 'simulation'>('simulation');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // PWA Install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Refs for smooth scrolling
  const panelRef = useRef<HTMLDivElement>(null);
  const chalkboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load local storage preferences
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('pitchtank_apikey') || '';
      const savedProvider = (localStorage.getItem('pitchtank_provider') as 'gemini' | 'openrouter' | 'simulation') || 'simulation';
      setApiKey(savedKey);
      setProvider(savedProvider);

      // Listen for PWA install event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      });
    }
  }, []);

  const handleSaveApiKey = (key: string, prov: 'gemini' | 'openrouter' | 'simulation') => {
    setApiKey(key);
    setProvider(prov);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pitchtank_apikey', key);
      localStorage.setItem('pitchtank_provider', prov);
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Submit Round 1 Pitch -> Directs founder to the live Tank Stage
  const handlePitchSubmit = async (data: {
    startupName: string;
    oneLiner: string;
    askAmount: string;
    askEquity: string;
  }) => {
    setStartupName(data.startupName);
    setOneLiner(data.oneLiner);
    setAskAmount(data.askAmount);
    setAskEquity(data.askEquity);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pitchtank_pitch', JSON.stringify(data));
      localStorage.setItem('pitchtank_pitch', JSON.stringify(data));
    }

    const params = new URLSearchParams({
      name: data.startupName,
      pitch: data.oneLiner,
      ask: data.askAmount,
      eq: data.askEquity,
    });
    router.push(`/tank?${params.toString()}`);
  };

  // Checkbox toggle for fixes
  const handleToggleCheck = (sharkType: string) => {
    setRebuttals((prev) =>
      prev.map((r) => (r.shark === sharkType ? { ...r, checked: !r.checked } : r))
    );
  };

  // Text update for rebuttals
  const handleUpdateRebuttal = (sharkType: string, text: string) => {
    setRebuttals((prev) =>
      prev.map((r) => (r.shark === sharkType ? { ...r, rebuttal: text } : r))
    );
  };

  // Submit Round 2 Re-Pitch
  const handleSubmitRePitch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName,
          oneLiner,
          askAmount,
          askEquity,
          isRePitch: true,
          fixes: rebuttals,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const json: PitchApiResponse = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to evaluate re-pitch');
      }

      setSharks(json.sharks);
      setRound(2);

      const inCount = json.sharks.filter((s) => s.status === 'IN').length;
      if (inCount > 0) {
        sound.playDealSound();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#2E7D32', '#D9534F', '#F59E0B', '#2E4A3E', '#F5F0E6'],
        });
      }

      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error evaluating Round 2';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    sound.playClickSound();
    setSharks([]);
    setRebuttals([]);
    setRound(1);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inCount = sharks.filter((s) => s.status === 'IN').length;

  return (
    <main className="min-h-screen py-6 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* App Download Banner */}
        <div className="mb-4 p-3.5 bg-[#2E4A3E] text-white rounded-xl border-3 border-[#1E332A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0px_#231F20]">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <Download className="w-5 h-5 text-yellow-300 shrink-0" />
            <div>
              <span className="font-bold text-yellow-300">ANDROID APP &amp; APK: </span>
              <span className="text-stone-200">
                Download the real installable <strong>PitchTank.apk</strong> file or install as PWA.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href="/downloads/PitchTank.apk"
              download="PitchTank.apk"
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#D9534F] hover:bg-[#C9433F] text-white text-xs font-mono font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer text-center flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Download className="w-3.5 h-3.5" /> Download APK (.apk)
            </a>
            {isInstallable && (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-mono font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                PWA
              </button>
            )}
          </div>
        </div>

        {/* Marquee Header */}
        <MarqueeHeader
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasCustomKey={!!apiKey}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="my-4 p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-900 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pitch Input Section */}
        <PitchForm onSubmitPitch={handlePitchSubmit} isLoading={isLoading} />

        {/* 5-Shark Panel Section */}
        {sharks.length > 0 && (
          <div ref={panelRef} className="pt-4">
            <SharkPanel sharks={sharks} round={round} />

            {/* Interactive Chalkboard Fix List */}
            <div ref={chalkboardRef}>
              <ChalkboardFixList
                sharks={sharks}
                rebuttals={rebuttals}
                onToggleCheck={handleToggleCheck}
                onUpdateRebuttal={handleUpdateRebuttal}
              />
            </div>

            {/* Round 2 Re-Pitch Actions */}
            <Round2RePitch
              rebuttals={rebuttals}
              onSubmitRePitch={handleSubmitRePitch}
              onResetAll={handleReset}
              isLoading={isLoading}
              round={round}
              inCount={inCount}
            />

            {/* Deal Term Sheet Receipt if any shark is IN */}
            {inCount > 0 && (
              <TermSheetReceipt
                startupName={startupName}
                askAmount={askAmount}
                askEquity={askEquity}
                sharks={sharks}
                onNewPitch={handleReset}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Vintage Watermark */}
      <footer className="mt-12 pt-6 border-t-2 border-dashed border-[#D4C3A3] text-center font-mono text-[11px] text-[#78716C] pb-6">
        <p className="flex items-center justify-center gap-2">
          <span>PITCHTANK • THE RETRO TACTILE SHARK TANK SIMULATOR</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E4A3E]" /> PWA READY
          </span>
        </p>
        <p className="mt-1 text-[10px] text-[#A8A29E]">
          #F5F0E6 Cream • #2E4A3E Chalkboard Green • #D9534F Stamp Red • Next.js App Router &amp; Tailwind CSS
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
