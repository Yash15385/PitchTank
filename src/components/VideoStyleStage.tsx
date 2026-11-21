'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SharkType, SharkResponse } from '@/types/pitch';
import { sound } from '@/lib/sounds';
import { Mic, MicOff, Volume2, Sparkles, Send, Play, RefreshCw, MessageCircle } from 'lucide-react';

export interface VideoSharkState {
  type: SharkType;
  name: string;
  badge: string;
  boardState: 'down' | 'question' | 'out' | 'in';
  questionText?: string;
  reactionText?: string;
}

interface VideoStyleStageProps {
  startupName: string;
  oneLiner: string;
  askAmount: string;
  askEquity: string;
  sharks: SharkResponse[];
  onAnswerShark: (sharkType: SharkType, answer: string) => Promise<void>;
  onProceedToVerdicts: () => void;
  isEvaluating: boolean;
}

export const VideoStyleStage: React.FC<VideoStyleStageProps> = ({
  startupName,
  oneLiner,
  askAmount,
  askEquity,
  sharks,
  onAnswerShark,
  onProceedToVerdicts,
  isEvaluating,
}) => {
  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  // Active shark being cross-examined
  const [activeShark, setActiveShark] = useState<SharkType>('money');
  const [founderReply, setFounderReply] = useState('');
  const [hasStartedPitch, setHasStartedPitch] = useState(false);
  const [sharksDeliberated, setSharksDeliberated] = useState(false);

  // Board states per shark
  const [boardStates, setBoardStates] = useState<Record<SharkType, 'down' | 'question' | 'out' | 'in'>>({
    money: 'down',
    customers: 'down',
    numbers: 'down',
    rivals: 'down',
    founder: 'down',
  });

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        try {
          const rec = new (SpeechRecognition as new () => {
            continuous: boolean;
            interimResults: boolean;
            lang: string;
            onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
            onerror: () => void;
            onend: () => void;
            start: () => void;
            stop: () => void;
          })();

          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event) => {
            let current = '';
            for (let i = 0; i < 100; i++) {
              if (event.results[i] && event.results[i][0]) {
                current += event.results[i][0].transcript + ' ';
              } else {
                break;
              }
            }
            if (current.trim()) {
              setTranscript(current.trim());
              setFounderReply(current.trim());
            }
          };

          rec.onerror = () => setIsListening(false);
          rec.onend = () => setIsListening(false);

          recognitionRef.current = rec;
        } catch {
          setSpeechSupported(false);
        }
      }
    }
  }, []);

  // Update board states when sharks prop updates
  useEffect(() => {
    if (sharks.length > 0 && sharksDeliberated) {
      const nextStates = { ...boardStates };
      sharks.forEach((s) => {
        nextStates[s.shark] = s.status === 'IN' ? 'in' : 'out';
      });
      setBoardStates(nextStates);
    }
  }, [sharks, sharksDeliberated]);

  const toggleVoicePitch = () => {
    if (!speechSupported || !recognitionRef.current) {
      // Fallback: simulate voice speech
      setTranscript(`Hello Sharks! I am presenting ${startupName}. We are seeking ${askAmount} for ${askEquity}. ${oneLiner}`);
      setHasStartedPitch(true);
      triggerSharksRaiseQuestionBoards();
      return;
    }

    const rec = recognitionRef.current as { start: () => void; stop: () => void };
    if (isListening) {
      rec.stop();
      setIsListening(false);
      if (transcript) {
        setHasStartedPitch(true);
        triggerSharksRaiseQuestionBoards();
      }
    } else {
      setTranscript('');
      try {
        rec.start();
        setIsListening(true);
        sound.playClickSound();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleManualDeliverPitch = () => {
    sound.playClickSound();
    setTranscript(`Hello Sharks! I am presenting ${startupName}. We are seeking ${askAmount} for ${askEquity}. ${oneLiner}`);
    setHasStartedPitch(true);
    triggerSharksRaiseQuestionBoards();
  };

  const triggerSharksRaiseQuestionBoards = () => {
    sound.playStampSound();
    // Sharks raise '?' question boards in sequence
    setBoardStates({
      money: 'question',
      customers: 'question',
      numbers: 'question',
      rivals: 'question',
      founder: 'question',
    });

    // Voice out Vikram's question using Web Speech Synthesis if available
    speakText("Wait a minute! At this valuation, where is the audited revenue to justify your multiple?");
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !sound.isMuted()) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis blocked
      }
    }
  };

  const handleSelectSharkForQuestion = (type: SharkType) => {
    sound.playClickSound();
    setActiveShark(type);
    const sharkObj = sharks.find((s) => s.shark === type);
    if (sharkObj) {
      speakText(sharkObj.sharpQuestion);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderReply.trim() || isEvaluating) return;

    const answer = founderReply.trim();
    setFounderReply('');
    if (isListening && recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }

    sound.playClickSound();
    await onAnswerShark(activeShark, answer);

    // Update the active shark's board
    const currentShark = sharks.find((s) => s.shark === activeShark);
    if (currentShark) {
      setBoardStates((prev) => ({
        ...prev,
        [activeShark]: currentShark.status === 'IN' ? 'in' : 'out',
      }));
    }
  };

  const handleCallAllVerdicts = () => {
    sound.playStampSound();
    setSharksDeliberated(true);
    const updated: Record<SharkType, 'out' | 'in'> = {
      money: 'out',
      customers: 'out',
      numbers: 'out',
      rivals: 'out',
      founder: 'out',
    };
    sharks.forEach((s) => {
      updated[s.shark] = s.status === 'IN' ? 'in' : 'out';
    });
    setBoardStates(updated);
    setTimeout(() => {
      onProceedToVerdicts();
    }, 1200);
  };

  const activeSharkObj = sharks.find((s) => s.shark === activeShark);

  return (
    <div className="relative w-full max-w-2xl mx-auto my-3 overflow-hidden rounded-3xl border-4 border-[#231F20] bg-[#F5F0E6] shadow-[8px_8px_0px_#231F20] select-none">
      
      {/* Background Concentric Radar Rings & Side Curtains */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Concentric sound rings */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-[#E8DEC8]/80 pointer-events-none" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-[#E8DEC8]/80 pointer-events-none" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[#E8DEC8]/80 pointer-events-none" />
        
        {/* Red Studio Curtains on Sides */}
        <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-12 bg-[#991B1B] border-r-3 border-[#231F20] opacity-90 shadow-lg" />
        <div className="absolute top-0 right-0 bottom-0 w-8 sm:w-12 bg-[#991B1B] border-l-3 border-[#231F20] opacity-90 shadow-lg" />
      </div>

      {/* Main Studio Arena Container */}
      <div className="relative z-10 px-4 sm:px-12 pt-6 pb-6 flex flex-col items-center">
        
        {/* Top Marquee Sign: "PITCH NIGHT" */}
        <div className="relative mb-5 px-6 py-2 bg-[#2E4A3E] border-3 border-[#231F20] rounded-xl shadow-[4px_4px_0px_#231F20] text-center">
          <div className="flex justify-between items-center gap-1.5 px-1 mb-1">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#FDE047] shadow-[0_0_6px_#FDE047]" />
            ))}
          </div>
          <h2 className="font-serif font-black text-xl sm:text-2xl text-[#FAF7F0] tracking-widest uppercase">
            PITCH NIGHT
          </h2>
        </div>

        {/* ============================================================== */}
        {/* THE 5 SHARKS JUDGES TABLE (MATCHING THE VIDEO)                 */}
        {/* ============================================================== */}
        <div className="w-full relative mt-1 mb-6">
          
          {/* Sharks Sitting Row (with Raised Boards) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 px-2 relative z-10 items-end">
            
            {/* 1. MONEY SHARK (Yellow, Pacifier, Raised Board) */}
            <SharkCharacterSlot
              type="money"
              label="MONEY"
              color="#EAB308"
              bellyColor="#FEF08A"
              boardState={boardStates.money}
              isActive={activeShark === 'money'}
              onClick={() => handleSelectSharkForQuestion('money')}
              feature="pacifier"
            />

            {/* 2. CUSTOMERS SHARK (Green, Napkin, Raised Board) */}
            <SharkCharacterSlot
              type="customers"
              label="CUSTOMERS"
              color="#22C55E"
              bellyColor="#BBF7D0"
              boardState={boardStates.customers}
              isActive={activeShark === 'customers'}
              onClick={() => handleSelectSharkForQuestion('customers')}
              feature="napkin"
            />

            {/* 3. NUMBERS SHARK (Blue/Gray, Round Glasses, Raised Board) */}
            <SharkCharacterSlot
              type="numbers"
              label="NUMBERS"
              color="#64748B"
              bellyColor="#CBD5E1"
              boardState={boardStates.numbers}
              isActive={activeShark === 'numbers'}
              onClick={() => handleSelectSharkForQuestion('numbers')}
              feature="glasses"
            />

            {/* 4. RIVALS SHARK (Red, Cool Sunglasses, Raised Board) */}
            <SharkCharacterSlot
              type="rivals"
              label="RIVALS"
              color="#EF4444"
              bellyColor="#FECACA"
              boardState={boardStates.rivals}
              isActive={activeShark === 'rivals'}
              onClick={() => handleSelectSharkForQuestion('rivals')}
              feature="sunglasses"
            />

            {/* 5. FOUNDER SHARK (Brown, Curled Mustache, Raised Board) */}
            <SharkCharacterSlot
              type="founder"
              label="FOUNDER"
              color="#854D0E"
              bellyColor="#FEF08A"
              boardState={boardStates.founder}
              isActive={activeShark === 'founder'}
              onClick={() => handleSelectSharkForQuestion('founder')}
              feature="mustache"
            />
          </div>

          {/* The Judges Table Front (Green Chalkboard with Labels) */}
          <div className="w-full relative -mt-3 z-20">
            {/* Tabletop Wood Trim */}
            <div className="h-4 bg-[#D97706] rounded-t-lg border-3 border-[#231F20] shadow-sm" />
            
            {/* Chalkboard Front Face */}
            <div className="bg-[#1E3A2F] border-x-3 border-b-3 border-[#231F20] p-2.5 sm:p-3 rounded-b-xl shadow-[5px_5px_0px_#231F20]">
              <div className="grid grid-cols-5 gap-1 text-center font-mono font-bold text-[8px] sm:text-[10px]">
                <span className="px-1 py-0.5 rounded bg-black/60 text-white border border-white/20 truncate">MONEY</span>
                <span className="px-1 py-0.5 rounded bg-black/60 text-white border border-white/20 truncate">CUSTOMERS</span>
                <span className="px-1 py-0.5 rounded bg-black/60 text-white border border-white/20 truncate">NUMBERS</span>
                <span className="px-1 py-0.5 rounded bg-black/60 text-white border border-white/20 truncate">RIVALS</span>
                <span className="px-1 py-0.5 rounded bg-black/60 text-white border border-white/20 truncate">FOUNDER</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* THE PAPER-CRAFT FOUNDER CHARACTER STANDING IN FRONT            */}
        {/* ============================================================== */}
        <div className="flex flex-col items-center my-3 relative z-10">
          
          {/* Founder Cartoon SVG */}
          <div className="relative flex flex-col items-center animate-bounce-slight">
            {/* Head & Hair */}
            <div className="relative">
              {/* Pointy Black Hair */}
              <div className="w-12 h-6 bg-[#231F20] rounded-t-full relative -mb-2" />
              {/* Round Face */}
              <div className="w-14 h-12 bg-[#D4A373] rounded-full border-2 border-[#231F20] relative flex items-center justify-center">
                {/* Eyes */}
                <div className="flex gap-4 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#231F20]" />
                  <span className="w-2 h-2 rounded-full bg-[#231F20]" />
                </div>
                {/* Mouth */}
                <div className="absolute bottom-2.5 w-2 h-1 bg-[#231F20] rounded-full" />
              </div>
            </div>

            {/* Body Holding the Cardboard Presentation Chart */}
            <div className="relative -mt-1 flex flex-col items-center">
              {/* Yellow Shirt */}
              <div className="w-10 h-7 bg-[#EAB308] border-2 border-[#231F20] rounded-t-md relative z-10" />

              {/* The Presentation Board Held in Hands */}
              <div className="absolute top-1 w-20 h-14 bg-[#EADDC9] border-2 border-[#231F20] rounded-lg shadow-sm p-1.5 flex flex-col justify-between z-20">
                {/* Graph Title Line */}
                <div className="h-1 bg-[#D9534F] w-12 rounded" />
                {/* Mini Bar Graph */}
                <div className="flex items-end justify-between h-6 px-1">
                  <div className="w-2.5 h-3 bg-[#15803D] rounded-t-xs" />
                  <div className="w-2.5 h-5 bg-[#15803D] rounded-t-xs" />
                  <div className="w-2.5 h-4 bg-[#15803D] rounded-t-xs" />
                  <div className="w-2.5 h-6 bg-[#15803D] rounded-t-xs" />
                </div>
              </div>

              {/* Green Trousers & Black Shoes */}
              <div className="flex gap-2 mt-8 z-10">
                <div className="w-3.5 h-6 bg-[#1F4D36] border-2 border-[#231F20] relative">
                  <span className="absolute bottom-0 -left-1 w-5 h-2.5 bg-[#231F20] rounded-full" />
                </div>
                <div className="w-3.5 h-6 bg-[#1F4D36] border-2 border-[#231F20] relative">
                  <span className="absolute bottom-0 -left-1 w-5 h-2.5 bg-[#231F20] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Founder Live Ticker (From Video: LIVE | STARTUP • SEEKING ₹50L FOR 5%) */}
          <div className="mt-4 flex items-center rounded-lg border-2 border-[#231F20] shadow-[3px_3px_0px_#231F20] overflow-hidden text-xs font-mono">
            <span className="bg-[#EAB308] text-black px-2.5 py-1 font-black flex items-center gap-1.5 border-r-2 border-[#231F20]">
              <span className="w-2 h-2 rounded-full bg-[#D9534F] animate-pulse" /> LIVE
            </span>
            <span className="bg-[#231F20] text-white px-3 py-1 font-bold truncate max-w-[260px] sm:max-w-md">
              {startupName.toUpperCase()} • SEEKING {askAmount.toUpperCase()} FOR {askEquity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LIVE SPEECH / SUBTITLE RIPPED PAPER STRIP (MATCHING VIDEO)     */}
        {/* ============================================================== */}
        <div className="w-full my-3">
          <div className="relative mx-auto max-w-lg p-3 bg-[#FAF7F0] border-2 border-[#D4C3A3] shadow-md rounded-md transform -rotate-0.5">
            {/* Paper jagged tape effect */}
            <div className="text-[10px] font-mono uppercase font-bold text-[#78716C] mb-1 flex items-center justify-between">
              <span>FOUNDER LIVE PITCH TRANSCRIPT:</span>
              {isListening && (
                <span className="text-red-600 animate-pulse flex items-center gap-1">
                  ● RECORDING LIVE
                </span>
              )}
            </div>
            <p className="font-serif font-black text-sm sm:text-base text-[#1F2937] leading-relaxed">
              &ldquo;
              {transcript ? (
                <span>{transcript}</span>
              ) : hasStartedPitch ? (
                <span>{oneLiner}</span>
              ) : (
                <span className="italic text-stone-400 font-normal">
                  Tap &apos;Speak Your Pitch&apos; or press Deliver to begin your live pitch to the sharks...
                </span>
              )}
              &rdquo;
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTION CONTROLS: LIVE VOICE PITCH & CROSS-EXAMINATION     */}
        {/* ============================================================== */}
        <div className="w-full max-w-lg space-y-3 mt-1">
          
          {/* Pitch Action Buttons (When not yet pitched) */}
          {!hasStartedPitch && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {/* Live Voice Pitch Button */}
              <button
                type="button"
                onClick={toggleVoicePitch}
                className={`py-3.5 px-5 rounded-xl border-3 border-[#231F20] font-serif font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_#231F20] transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#D9534F] hover:bg-[#C9433F] text-white active:translate-x-[2px] active:translate-y-[2px]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>STOP SPEAKING &amp; SUBMIT PITCH</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 animate-bounce" />
                    <span>🎙️ LIVE VOICE PITCH (SPEAK MIC)</span>
                  </>
                )}
              </button>

              {/* Or Quick Deliver Pitch */}
              <button
                type="button"
                onClick={handleManualDeliverPitch}
                className="py-3.5 px-4 rounded-xl border-3 border-[#231F20] bg-white hover:bg-stone-100 text-[#1F2937] font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#231F20] cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-700" />
                <span>DELIVER WRITTEN PITCH</span>
              </button>
            </div>
          )}

          {/* Cross-Question Dialogue Box (When Sharks Raised Boards) */}
          {hasStartedPitch && (
            <div className="p-4 bg-white rounded-xl border-3 border-[#231F20] shadow-[4px_4px_0px_#231F20]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
                <span className="text-[11px] font-mono font-bold text-[#D9534F] uppercase flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  SHARK CROSS-QUESTION FROM {activeShark.toUpperCase()}:
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Select any shark above to answer
                </span>
              </div>

              {/* Active Shark Question Quote */}
              <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs font-serif font-bold text-[#78350F] italic mb-3">
                &ldquo;{activeSharkObj?.sharpQuestion || 'Why should I invest in this multiple?'}&rdquo;
              </div>

              {/* Live Answer Box */}
              <form onSubmit={handleSubmitAnswer} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={founderReply}
                    onChange={(e) => setFounderReply(e.target.value)}
                    placeholder={`Speak or type your answer to ${activeShark}...`}
                    className="flex-1 text-xs font-mono p-2.5 rounded-lg border-2 border-[#231F20] bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E4A3E]"
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleVoicePitch}
                      className={`p-2.5 rounded-lg border-2 border-[#231F20] shadow-[2px_2px_0px_#231F20] cursor-pointer ${
                        isListening ? 'bg-red-500 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                      title="Speak Answer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isEvaluating || !founderReply.trim()}
                    className={`px-4 py-2.5 rounded-lg border-2 border-[#231F20] font-serif font-black text-xs uppercase text-white shadow-[2px_2px_0px_#231F20] cursor-pointer ${
                      isEvaluating || !founderReply.trim()
                        ? 'bg-stone-400 cursor-not-allowed'
                        : 'bg-[#2E4A3E] hover:bg-[#233B31]'
                    }`}
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1">
                  {[
                    '65% gross margins locked in',
                    '35% organic 90-day repeat rate',
                    'Provisional patent filed',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFounderReply(chip)}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 border border-stone-300 cursor-pointer"
                    >
                      ⚡ {chip}
                    </button>
                  ))}
                </div>
              </form>

              {/* Bottom Call for Final Verdicts */}
              <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex justify-center">
                <button
                  type="button"
                  onClick={handleCallAllVerdicts}
                  className="py-2.5 px-6 rounded-xl border-2 border-[#231F20] bg-[#D9534F] hover:bg-[#C9433F] text-white font-serif font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_#231F20] cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CALL FINAL VERDICTS &amp; RAISINGS</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// =========================================================================
// SHARK CHARACTER COMPONENT WITH PHYSICAL RAISED BOARD PLACARD
// =========================================================================
interface SharkCharacterSlotProps {
  type: SharkType;
  label: string;
  color: string;
  bellyColor: string;
  boardState: 'down' | 'question' | 'out' | 'in';
  isActive: boolean;
  onClick: () => void;
  feature: 'pacifier' | 'napkin' | 'glasses' | 'sunglasses' | 'mustache';
}

const SharkCharacterSlot: React.FC<SharkCharacterSlotProps> = ({
  type,
  color,
  bellyColor,
  boardState,
  isActive,
  onClick,
  feature,
}) => {
  const isRaised = boardState !== 'down';

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
        isActive ? 'scale-105' : 'hover:scale-102'
      }`}
    >
      {/* ============================================================== */}
      {/* THE RAISED BOARD ON WOODEN STICK (MATCHING VIDEO FRAME 35)      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isRaised && (
          <motion.div
            initial={{ y: 50, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 2 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 260 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
          >
            {/* The Placard Sign */}
            <div
              className={`px-2.5 py-1 rounded-md border-2 border-white shadow-md font-serif font-black text-[11px] sm:text-xs tracking-wider uppercase text-white ${
                boardState === 'out'
                  ? 'bg-[#DC2626] border-dashed'
                  : boardState === 'in'
                  ? 'bg-[#16A34A]'
                  : 'bg-[#D97706]'
              }`}
            >
              {boardState === 'out' ? 'OUT' : boardState === 'in' ? "I'M IN" : '?'}
            </div>

            {/* The Wooden Stick */}
            <div className="w-1.5 h-7 bg-[#92400E] border-x border-[#451A03] shadow-xs" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* THE CUTE ROUNDED-CUBE SHARK CHARACTER                          */}
      {/* ============================================================== */}
      <div className="relative flex flex-col items-center">
        {/* Dorsal Fin on Head */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[#475569] mb-[-2px] relative z-0" />

        {/* Rounded Cube Body */}
        <div
          className="w-12 h-14 sm:w-16 sm:h-18 rounded-2xl border-2 border-[#231F20] shadow-sm relative flex flex-col items-center justify-between p-1 overflow-hidden"
          style={{ backgroundColor: color }}
        >
          {/* Eyebrows & Eyes */}
          <div className="w-full flex items-center justify-around pt-1">
            {/* Left Eye */}
            <div className="relative">
              <span className="block w-2.5 h-0.5 bg-[#231F20] mb-0.5" />
              <div className="w-3 h-3 rounded-full bg-white border border-[#231F20] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#231F20]" />
              </div>
            </div>

            {/* Right Eye */}
            <div className="relative">
              <span className="block w-2.5 h-0.5 bg-[#231F20] mb-0.5" />
              <div className="w-3 h-3 rounded-full bg-white border border-[#231F20] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#231F20]" />
              </div>
            </div>
          </div>

          {/* Unique Feature per Shark (from Video) */}
          <div className="relative my-0.5 flex justify-center">
            {/* Money Shark: Pacifier / Green Ring */}
            {feature === 'pacifier' && (
              <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-[#231F20] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              </div>
            )}

            {/* Customers Shark: White Napkin on cheek */}
            {feature === 'napkin' && (
              <div className="w-3.5 h-3.5 bg-white border border-[#231F20] transform rotate-45 -mt-1 shadow-xs" />
            )}

            {/* Numbers Shark: Thick Black Round Glasses */}
            {feature === 'glasses' && (
              <div className="absolute -top-4 flex items-center gap-1">
                <div className="w-4 h-4 rounded-full border-2 border-[#1E293B] bg-transparent" />
                <span className="w-1 h-0.5 bg-[#1E293B]" />
                <div className="w-4 h-4 rounded-full border-2 border-[#1E293B] bg-transparent" />
              </div>
            )}

            {/* Rivals Shark: Dark Cool Sunglasses */}
            {feature === 'sunglasses' && (
              <div className="absolute -top-3 flex items-center gap-0.5">
                <div className="w-4 h-2.5 bg-[#111827] border border-[#231F20] rounded-xs" />
                <span className="w-1 h-0.5 bg-[#111827]" />
                <div className="w-4 h-2.5 bg-[#111827] border border-[#231F20] rounded-xs" />
              </div>
            )}

            {/* Founder Shark: White Curled Mustache */}
            {feature === 'mustache' && (
              <div className="flex items-center -mt-0.5">
                <div className="w-3 h-1.5 bg-[#FAF7F0] border border-[#231F20] rounded-t-full transform -rotate-12" />
                <div className="w-3 h-1.5 bg-[#FAF7F0] border border-[#231F20] rounded-t-full transform rotate-12" />
              </div>
            )}
          </div>

          {/* Mouth (if no pacifier/mustache) */}
          {feature !== 'pacifier' && feature !== 'mustache' && (
            <div className="w-3 h-0.5 bg-[#231F20] rounded-full mb-1" />
          )}

          {/* Light Belly patch */}
          <div
            className="w-8 h-3 rounded-t-full border-t border-[#231F20]/30"
            style={{ backgroundColor: bellyColor }}
          />
        </div>

        {/* Hand Holding the Stick if Raised */}
        {isRaised && (
          <div className="absolute -top-2 right-1 w-2.5 h-2.5 rounded-full bg-[#D4A373] border border-[#231F20] z-20" />
        )}

        {/* Shark Feet */}
        <div className="flex gap-2 -mt-1">
          <span className="w-2.5 h-2 bg-[#231F20] rounded-b-xs" />
          <span className="w-2.5 h-2 bg-[#231F20] rounded-b-xs" />
        </div>
      </div>
    </div>
  );
};
