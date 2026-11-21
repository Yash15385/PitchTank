'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SharkType, SharkResponse, SharkFixRebuttal, PitchApiResponse } from '@/types/pitch';
import { SHARK_PROFILES } from '@/lib/sharkArchetypes';
import { GeometricSharkAvatar } from '@/components/GeometricSharkAvatar';
import { SharkCard } from '@/components/SharkCard';
import { ChalkboardFixList } from '@/components/ChalkboardFixList';
import { Round2RePitch } from '@/components/Round2RePitch';
import { TermSheetReceipt } from '@/components/TermSheetReceipt';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { sound } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import {
  Mic,
  Send,
  ArrowLeft,
  Radio,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Users,
  Flame,
  Volume2,
  VolumeX,
  Key,
  Building2,
  DollarSign,
  Play,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

// The 4 core sharks
const FOUR_SHARKS: SharkType[] = ['money', 'customers', 'numbers', 'rivals'];

function TankStageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pitch state
  const [startupName, setStartupName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [askAmount, setAskAmount] = useState('₹50 Lakh');
  const [askEquity, setAskEquity] = useState('5%');

  // Pitch delivery stage: false = founder hasn't delivered pitch yet; true = pitch delivered, sharks questioning
  const [hasDeliveredPitch, setHasDeliveredPitch] = useState(false);

  // Sharks state (strictly 4 sharks)
  const [sharks, setSharks] = useState<SharkResponse[]>([]);
  const [rebuttals, setRebuttals] = useState<SharkFixRebuttal[]>([]);
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Cross-examination dialogue state
  const [activeSharkType, setActiveSharkType] = useState<SharkType>('money');
  const [founderAnswer, setFounderAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<
    Array<{ shark: SharkType; text: string; sender: 'shark' | 'founder'; isReaction?: boolean }>
  >([]);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openrouter' | 'simulation'>('simulation');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // View phase: 'grilling' (live cross-questioning) | 'verdicts' (cards & chalkboard)
  const [stagePhase, setStagePhase] = useState<'grilling' | 'verdicts'>('grilling');

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('pitchtank_apikey') || '';
      const savedProvider = (localStorage.getItem('pitchtank_provider') as 'gemini' | 'openrouter' | 'simulation') || 'simulation';
      setApiKey(savedKey);
      setProvider(savedProvider);
      setIsMuted(sound.isMuted());

      // 1. Try URL Search Params first
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

      // 2. Fallback to sessionStorage
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

      // 3. Default starter pitch
      const defaultName = 'KulladKarts';
      const defaultPitch = 'Automated clay-cup chai dispensing kiosks brewing authentic tea in 30 seconds at railway stations';
      const defaultAsk = '₹50 Lakh';
      const defaultEquity = '5%';
      setStartupName(defaultName);
      setOneLiner(defaultPitch);
      setAskAmount(defaultAsk);
      setAskEquity(defaultEquity);
      initializePanel(defaultName, defaultPitch, defaultAsk, defaultEquity, savedKey, savedProvider);
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
        // Filter strictly to the 4 sharks
        const filtered = json.sharks.filter((s) => FOUR_SHARKS.includes(s.shark));
        setSharks(filtered);

        const initRebuttals: SharkFixRebuttal[] = filtered.map((s) => ({
          shark: s.shark,
          fixItem: s.fixItem,
          rebuttal: '',
          checked: false,
        }));
        setRebuttals(initRebuttals);

        // Seed initial cross-question from Money Shark (Vikram)
        const initialActive = filtered.find((s) => s.shark === 'money') || filtered[0];
        setDialogueHistory([
          {
            shark: initialActive.shark,
            text: initialActive.sharpQuestion,
            sender: 'shark',
          },
        ]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverPitch = () => {
    sound.playClickSound();
    sound.playDealSound();
    setHasDeliveredPitch(true);
  };

  const activeSharkMeta = SHARK_PROFILES[activeSharkType];
  const activeSharkResponse = sharks.find((s) => s.shark === activeSharkType);

  const handleSelectShark = (type: SharkType) => {
    sound.playClickSound();
    setActiveSharkType(type);
    const sharkObj = sharks.find((s) => s.shark === type);
    if (sharkObj) {
      const hasAsked = dialogueHistory.some((d) => d.shark === type && d.sender === 'shark');
      if (!hasAsked) {
        setDialogueHistory((prev) => [
          ...prev,
          { shark: type, text: sharkObj.sharpQuestion, sender: 'shark' },
        ]);
      }
    }
  };

  // Submit live answer to active shark's cross-question
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderAnswer.trim() || isAnswering) return;

    const answerText = founderAnswer.trim();
    setFounderAnswer('');
    sound.playClickSound();

    setDialogueHistory((prev) => [
      ...prev,
      { shark: activeSharkType, text: answerText, sender: 'founder' },
    ]);

    setIsAnswering(true);

    try {
      const res = await fetch('/api/tank/cross-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName,
          oneLiner,
          askAmount,
          askEquity,
          shark: activeSharkType,
          question: activeSharkResponse?.sharpQuestion || activeSharkMeta.tagline,
          founderAnswer: answerText,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDialogueHistory((prev) => [
          ...prev,
          { shark: activeSharkType, text: data.reaction, sender: 'shark', isReaction: true },
        ]);

        if (data.status === 'IN') {
          sound.playDealSound();
          setSharks((prev) =>
            prev.map((s) =>
              s.shark === activeSharkType
                ? {
                    ...s,
                    status: 'IN',
                    harshQuote: data.reaction,
                    offerDetails: data.offerDetails || `${askAmount} for ${askEquity}`,
                  }
                : s
            )
          );
        } else if (data.status === 'OUT') {
          sound.playStampSound();
          setSharks((prev) =>
            prev.map((s) =>
              s.shark === activeSharkType
                ? { ...s, status: 'OUT', harshQuote: data.reaction }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
    } finally {
      setIsAnswering(false);
      setTimeout(() => {
        dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
        const filtered = json.sharks.filter((s) => FOUR_SHARKS.includes(s.shark));
        setSharks(filtered);
        setRound(2);
        const inCount = filtered.filter((s) => s.status === 'IN').length;
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
  const outCount = sharks.filter((s) => s.status === 'OUT').length;

  return (
    <main className="min-h-screen py-5 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top Header Navigation */}
        <header className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#D4C3A3] text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#231F20] bg-white hover:bg-stone-100 shadow-[2px_2px_0px_#231F20] flex items-center gap-1.5 font-bold text-[#231F20] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pitch Room
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D9534F] text-white font-bold text-[10px] uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE TANK STAGE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Logo in Bar */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F0] px-2 py-1 rounded border border-[#231F20] shadow-xs">
              <img src="/logo.png" alt="PitchTank Logo" className="w-5 h-5 object-contain" />
              <span className="font-serif font-black text-xs text-[#231F20]">PITCHTANK</span>
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

        {/* ========================================================================= */}
        {/* STAGE 1: DELIVER YOUR PITCH TO THE 4 SHARKS                              */}
        {/* ========================================================================= */}
        {!hasDeliveredPitch ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6 p-6 sm:p-8 rounded-2xl bg-[#FAF7F0] border-4 border-[#231F20] shadow-[8px_8px_0px_#231F20] text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> STEPPING ONTO THE TANK CARPET
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#231F20] tracking-tight uppercase leading-tight">
              THE 4 SHARKS ARE WAITING FOR YOUR PITCH
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-sans text-[#57534E] max-w-lg mx-auto">
              Stand on the mark, face Vikram, Ananya, Prof. Murthy, and Kabir, and deliver your opening pitch!
            </p>

            {/* The 4 Sharks Seated at the Table Preview */}
            <div className="my-6 p-4 rounded-xl bg-[#231F20] border-3 border-[#141213] text-white">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 mb-3">
                THE 4 SHARKS ON DUTY:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FOUR_SHARKS.map((type) => {
                  const meta = SHARK_PROFILES[type];
                  return (
                    <div
                      key={type}
                      className="p-3 rounded-lg bg-stone-900 border border-stone-700 flex flex-col items-center text-center"
                    >
                      <GeometricSharkAvatar type={type} size={50} />
                      <span className="font-serif font-black text-xs text-white mt-1">
                        {meta.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-stone-400">
                        {meta.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Founder Pitch Teleprompter Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#EFE9DC] border-2 border-[#D4C3A3] text-left mb-6 shadow-inner">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                YOUR OPENING PITCH TO THE SHARKS:
              </span>
              <p className="font-serif text-base sm:text-lg font-bold text-[#1F2937] leading-relaxed">
                &ldquo;Hello Sharks! My venture is{' '}
                <span className="text-[#881337] underline decoration-wavy">{startupName}</span>.
                Today I am asking for{' '}
                <span className="text-[#15803D] font-mono font-black">{askAmount}</span> for{' '}
                <span className="text-[#15803D] font-mono font-black">{askEquity}</span> of my
                company. {oneLiner}&rdquo;
              </p>
            </div>

            {/* Big Deliver Pitch Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDeliverPitch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-3 border-[#231F20] bg-[#D9534F] hover:bg-[#C9433F] text-white font-serif font-black text-base sm:text-lg uppercase tracking-wider shadow-[5px_5px_0px_#231F20] flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            >
              <Mic className="w-5 h-5 animate-pulse" />
              <span>DELIVER PITCH TO THE 4 SHARKS</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* STAGE 2: LIVE SHARK CROSS-EXAMINATION & VERDICTS                          */
          /* ========================================================================= */
          <div>
            {/* Founder Podium Summary Card */}
            <section className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border-3 border-[#231F20] shadow-[5px_5px_0px_#231F20] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-[#D4C3A3]">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#2E4A3E] text-white">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h1 className="font-serif font-black text-xl sm:text-2xl text-[#231F20] uppercase tracking-tight">
                      {startupName}
                    </h1>
                    <p className="text-[11px] font-mono text-[#78716C]">
                      LIVE IN THE TANK • 4-SHARK CROSS EXAMINATION
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="px-3 py-1 rounded-lg bg-[#1F332A] text-[#86EFAC] font-mono text-xs font-bold border border-[#2E7D32] flex items-center gap-1 shadow-sm">
                    <DollarSign className="w-3.5 h-3.5" /> ASK: {askAmount} for {askEquity}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#57534E] block mb-0.5">
                  YOUR PITCH:
                </span>
                <p className="text-xs sm:text-sm font-sans text-[#1F2937] italic bg-[#EFE9DC] p-2.5 rounded-lg border border-[#D4C3A3] leading-relaxed">
                  &ldquo;{oneLiner}&rdquo;
                </p>
              </div>
            </section>

            {/* Phase Toggle Tabs: Cross-Questioning Stage vs Full Verdicts */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  setStagePhase('grilling');
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl border-3 border-[#231F20] font-serif font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  stagePhase === 'grilling'
                    ? 'bg-[#D9534F] text-white shadow-[4px_4px_0px_#231F20] translate-y-[-2px]'
                    : 'bg-white hover:bg-stone-100 text-[#231F20] shadow-[2px_2px_0px_#231F20]'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> 1. Live Shark Cross-Questions
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  setStagePhase('verdicts');
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl border-3 border-[#231F20] font-serif font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  stagePhase === 'verdicts'
                    ? 'bg-[#2E4A3E] text-white shadow-[4px_4px_0px_#231F20] translate-y-[-2px]'
                    : 'bg-white hover:bg-stone-100 text-[#231F20] shadow-[2px_2px_0px_#231F20]'
                }`}
              >
                <Users className="w-4 h-4" /> 2. Panel Verdicts &amp; Chalkboard
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW A: LIVE SHARK CROSS-QUESTIONING ARENA                   */}
            {/* ------------------------------------------------------------- */}
            {stagePhase === 'grilling' && (
              <div className="space-y-6">
                {/* The 4 Shark Judges Table */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#231F20] border-4 border-[#141213] text-white shadow-[7px_7px_0px_#2E4A3E]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-300">
                        THE 4 SHARKS ARE CROSS-QUESTIONING YOU
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400">
                      Click a shark to answer their question
                    </span>
                  </div>

                  {/* 4 Sharks Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FOUR_SHARKS.map((type) => {
                      const meta = SHARK_PROFILES[type];
                      const sharkObj = sharks.find((s) => s.shark === type);
                      const isActive = activeSharkType === type;
                      const isOut = sharkObj?.status === 'OUT';
                      const isIn = sharkObj?.status === 'IN';

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleSelectShark(type)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer relative ${
                            isActive
                              ? 'border-[#F59E0B] bg-[#2E3748] shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-102'
                              : 'border-stone-700 bg-stone-900/80 hover:bg-stone-800'
                          }`}
                        >
                          <GeometricSharkAvatar type={type} size={58} isOut={isOut} isIn={isIn} />
                          <span className="font-serif font-black text-xs sm:text-sm text-white mt-1 leading-tight truncate w-full">
                            {meta.name.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono uppercase text-stone-400 tracking-tight">
                            {meta.badge}
                          </span>

                          {/* Live Stance Badge */}
                          <span
                            className={`mt-1.5 text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
                              isIn
                                ? 'bg-emerald-500 text-white'
                                : isOut
                                ? 'bg-red-500 text-white'
                                : isActive
                                ? 'bg-amber-400 text-black'
                                : 'bg-stone-800 text-stone-300'
                            }`}
                          >
                            {isIn ? "I'M IN" : isOut ? 'OUT' : isActive ? 'GRILLING' : 'WAITING'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Shark Cross-Examination Arena */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F0] border-3 border-[#231F20] shadow-[6px_6px_0px_#231F20]">
                  {/* Active Shark Header */}
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b-2 border-dashed border-[#D4C3A3]">
                    <GeometricSharkAvatar
                      type={activeSharkType}
                      size={64}
                      isOut={activeSharkResponse?.status === 'OUT'}
                      isIn={activeSharkResponse?.status === 'IN'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#231F20]"
                          style={{ backgroundColor: activeSharkMeta.accentColor, color: '#18181B' }}
                        >
                          {activeSharkMeta.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-500">
                          CROSS-QUESTION
                        </span>
                      </div>
                      <h3 className="font-serif font-black text-lg text-[#1F2937] leading-tight mt-1">
                        {activeSharkMeta.name}
                      </h3>
                      <p className="text-xs text-[#57534E] font-sans italic">
                        &ldquo;{activeSharkMeta.tagline}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Transcript History */}
                  <div className="space-y-3 mb-5 max-h-[340px] overflow-y-auto pr-1">
                    {dialogueHistory
                      .filter((item) => item.shark === activeSharkType)
                      .map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3.5 rounded-xl border-2 leading-relaxed text-xs font-mono ${
                            item.sender === 'shark'
                              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F] shadow-[2px_2px_0px_#F59E0B]'
                              : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1] shadow-[2px_2px_0px_#0284C7] ml-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 font-bold text-[10px] uppercase tracking-wider opacity-80">
                            <span>
                              {item.sender === 'shark'
                                ? `${activeSharkMeta.name.split(' ')[0]} (Shark):`
                                : 'You (Founder):'}
                            </span>
                            {item.isReaction && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                                SHARK REACTION
                              </span>
                            )}
                          </div>
                          <p className="font-serif text-sm font-semibold text-[#1F2937]">
                            &ldquo;{item.text}&rdquo;
                          </p>
                        </motion.div>
                      ))}
                    <div ref={dialogueEndRef} />
                  </div>

                  {/* Live Response Mic Input Form */}
                  <form onSubmit={handleAnswerSubmit} className="pt-3 border-t-2 border-dashed border-[#D4C3A3]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#292524] flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-[#D9534F] animate-pulse" />
                        YOUR ANSWER TO {activeSharkMeta.name.split(' ')[0]}:
                      </label>
                      <span className="text-[10px] font-mono text-[#78716C]">
                        Type and press Reply
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        required
                        value={founderAnswer}
                        onChange={(e) => setFounderAnswer(e.target.value)}
                        placeholder={`e.g., We have locked in 65% gross margins and 35% repeat purchase rate...`}
                        className="flex-1 text-xs font-mono p-3 rounded-xl border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E] placeholder:text-stone-400 resize-none"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isAnswering || !founderAnswer.trim()}
                        className={`px-5 rounded-xl border-3 border-[#231F20] font-serif font-black text-xs sm:text-sm uppercase tracking-wider text-white shadow-[3px_3px_0px_#231F20] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          isAnswering || !founderAnswer.trim()
                            ? 'bg-stone-400 cursor-not-allowed'
                            : 'bg-[#2E4A3E] hover:bg-[#233B31]'
                        }`}
                      >
                        {isAnswering ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>REPLY</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Quick Rebuttal Suggestion Chips */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#78716C]">Quick Counter:</span>
                      {[
                        'We locked in 60% gross margins with local manufacturing',
                        '35% of monthly orders are 100% organic word of mouth',
                        'We hold proprietary provisional IP on our formulation',
                        'I am 100% full-time with 3 years founder vesting',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            sound.playClickSound();
                            setFounderAnswer(chip);
                          }}
                          className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#231F20] bg-white hover:bg-stone-100 shadow-[1px_1px_0px_#231F20] cursor-pointer"
                        >
                          ⚡ {chip}
                        </button>
                      ))}
                    </div>
                  </form>
                </div>

                {/* Big Proceed Button */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClickSound();
                      setStagePhase('verdicts');
                    }}
                    className="py-3.5 px-8 rounded-xl border-3 border-[#231F20] bg-[#D9534F] hover:bg-[#C9433F] text-white font-serif font-black text-sm sm:text-base uppercase tracking-wider shadow-[5px_5px_0px_#231F20] flex items-center gap-2 cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <Flame className="w-5 h-5 text-yellow-300" />
                    <span>REVEAL FINAL SHARK VERDICTS &amp; OFFERS ({inCount} IN, {outCount} OUT)</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW B: FULL VERDICTS, PLACARD SLAMS, CHALKBOARD & ROUND 2   */}
            {/* ------------------------------------------------------------- */}
            {stagePhase === 'verdicts' && (
              <div className="space-y-6">
                {/* 4-Shark Cards Grid with Framer Motion Placards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t-2 border-dashed border-[#D4C3A3] text-center font-mono text-[11px] text-[#78716C] pb-6">
        <p className="flex items-center justify-center gap-2">
          <span>PITCHTANK BROADCAST ARENA</span>
          <span>•</span>
          <span>THE 4 SHARKS PANEL</span>
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
