'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, X, Sparkles, ExternalLink } from 'lucide-react';
import { sound } from '@/lib/sounds';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: 'gemini' | 'openrouter' | 'simulation';
  onSave: (key: string, provider: 'gemini' | 'openrouter' | 'simulation') => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  provider,
  onSave,
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempProvider, setTempProvider] = useState<'gemini' | 'openrouter' | 'simulation'>(provider);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playClickSound();
    onSave(tempKey.trim(), tempProvider);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md p-6 bg-[#FAF7F0] rounded-2xl border-4 border-[#231F20] shadow-[8px_8px_0px_#231F20]"
        >
          {/* Top Classified Folder Tab */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#D4C3A3]">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#2E4A3E]" />
              <h3 className="font-serif font-black text-lg text-[#1F2937] tracking-tight uppercase">
                AI ENGINE CONFIGURATION
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-stone-200 text-stone-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#57534E] font-sans mb-4">
            PitchTank runs out-of-the-box using the built-in <strong>Intelligent Shark Heuristic Engine</strong>. To connect live LLMs (Gemini 2.5 Flash or OpenRouter), plug in your key below:
          </p>

          {/* Provider Selector */}
          <div className="mb-4">
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#292524] mb-1.5">
              Select AI Engine:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTempProvider('simulation')}
                className={`p-2 rounded-lg border-2 text-xs font-mono font-bold transition-all cursor-pointer ${tempProvider === 'simulation'
                    ? 'border-[#2E4A3E] bg-[#2E4A3E] text-white shadow-[2px_2px_0px_#231F20]'
                    : 'border-stone-300 bg-white text-stone-700'
                  }`}
              >
                Auto Demo
              </button>
              <button
                type="button"
                onClick={() => setTempProvider('gemini')}
                className={`p-2 rounded-lg border-2 text-xs font-mono font-bold transition-all cursor-pointer ${tempProvider === 'gemini'
                    ? 'border-[#2E4A3E] bg-[#2E4A3E] text-white shadow-[2px_2px_0px_#231F20]'
                    : 'border-stone-300 bg-white text-stone-700'
                  }`}
              >
                Gemini API
              </button>
              <button
                type="button"
                onClick={() => setTempProvider('openrouter')}
                className={`p-2 rounded-lg border-2 text-xs font-mono font-bold transition-all cursor-pointer ${tempProvider === 'openrouter'
                    ? 'border-[#2E4A3E] bg-[#2E4A3E] text-white shadow-[2px_2px_0px_#231F20]'
                    : 'border-stone-300 bg-white text-stone-700'
                  }`}
              >
                OpenRouter
              </button>
            </div>
          </div>

          {/* API Key Input (if not simulation) */}
          {tempProvider !== 'simulation' && (
            <div className="mb-4">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#292524] mb-1">
                {tempProvider === 'gemini' ? 'Google Gemini API Key:' : 'OpenRouter API Key:'}
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-or-v1-...'}
                className="w-full text-xs font-mono p-2.5 rounded-lg border-2 border-[#231F20] bg-white shadow-[2px_2px_0px_#231F20] focus:outline-none focus:ring-2 focus:ring-[#2E4A3E]"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-[#78716C] font-mono">
                <span>Stored locally in your browser</span>
                <a
                  href={tempProvider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://openrouter.ai/keys'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2E4A3E] underline flex items-center gap-0.5 font-bold"
                >
                  Get Key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {tempProvider === 'simulation' && (
            <div className="mb-4 p-3 rounded-lg bg-[#EFE9DC] border border-[#D4C3A3] text-xs font-mono text-[#57534E]">
              <div className="flex items-center gap-1.5 font-bold text-[#2E4A3E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Auto Demo Mode Active
              </div>
              Runs instant parallel pitch evaluations with authentic valuation calculations, unit economics audits, and tailored shark critiques without needing any external key.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 font-mono text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg border-2 border-[#231F20] bg-[#2E4A3E] hover:bg-[#253D33] text-white font-serif font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#231F20] cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
