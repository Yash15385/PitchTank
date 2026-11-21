'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SharkFixRebuttal } from '@/types/pitch';
import { sound } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import { RefreshCw, RotateCcw, Zap, Trophy } from 'lucide-react';

interface Round2RePitchProps {
  rebuttals: SharkFixRebuttal[];
  onSubmitRePitch: () => Promise<void>;
  onResetAll: () => void;
  isLoading: boolean;
  round: number;
  inCount: number;
}

export const Round2RePitch: React.FC<Round2RePitchProps> = ({
  rebuttals,
  onSubmitRePitch,
  onResetAll,
  isLoading,
  round,
  inCount,
}) => {
  const checkedFixes = rebuttals.filter((r) => r.checked);
  const hasChecked = checkedFixes.length > 0;

  const handleRePitch = async () => {
    sound.playClickSound();
    await onSubmitRePitch();
    if (inCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D9534F', '#2E4A3E', '#F59E0B', '#2E7D32', '#FAF7F0'],
      });
    }
  };

  return (
    <div className="w-full my-8 p-5 md:p-6 bg-[#FAF7F0] rounded-2xl border-3 border-[#231F20] shadow-[6px_6px_0px_#231F20]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#D9534F] text-white rounded border border-[#231F20]">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <h4 className="font-serif font-black text-xl text-[#1F2937] tracking-tight">
              {round === 1 ? 'READY FOR ROUND 2 RE-PITCH?' : 'ROUND 2 COMPLETE!'}
            </h4>
          </div>
          <p className="text-xs md:text-sm text-[#57534E] font-sans mt-1">
            {round === 1 ? (
              <>
                You have prepared{' '}
                <strong className="text-[#881337]">{checkedFixes.length} fix rebuttals</strong>.
                Submit your updated answers to flip the sharks from <strong>OUT</strong> to{' '}
                <strong>IN</strong>!
              </>
            ) : (
              <>
                The sharks evaluated your counter-arguments!{' '}
                {inCount > 0
                  ? `🎉 You secured offers from ${inCount} shark${inCount > 1 ? 's' : ''}!`
                  : 'All sharks remained out. Refine your fixes and try again.'}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={onResetAll}
            className="flex-1 md:flex-initial px-4 py-3 rounded-xl border-2 border-[#231F20] bg-[#E7E5E4] hover:bg-[#D6D3D1] text-[#292524] font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#231F20] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset Pitch
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isLoading || (!hasChecked && round === 1)}
            onClick={handleRePitch}
            className={`flex-1 md:flex-initial px-6 py-3.5 rounded-xl border-3 border-[#231F20] font-serif font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_#231F20] transition-all cursor-pointer ${
              !hasChecked && round === 1
                ? 'bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed border-stone-400 shadow-none'
                : 'bg-[#D9534F] hover:bg-[#C9433F] text-white active:translate-x-[2px] active:translate-y-[2px]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>EVALUATING RE-PITCH...</span>
              </>
            ) : round === 1 ? (
              <>
                <Zap className="w-4 h-4" />
                <span>SUBMIT RE-PITCH (ROUND 2)</span>
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                <span>RE-RUN NEGOTIATIONS</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
