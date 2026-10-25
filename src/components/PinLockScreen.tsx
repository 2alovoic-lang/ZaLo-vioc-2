import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  lang: Language;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ correctPin, onUnlock, lang }) => {
  const t = translations[lang];
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setHasError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setHasError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 select-none animate-in fade-in">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">ZaLo Voici</h2>
        <p className="text-xs text-slate-400 mb-6">{t.unlockApp}</p>

        {/* 4 dots for PIN entry */}
        <div className={`flex items-center gap-4 mb-6 ${hasError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  hasError
                    ? 'bg-rose-500 scale-110'
                    : isFilled
                    ? 'bg-blue-500 scale-110 shadow-sm shadow-blue-500/50'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {hasError && (
          <p className="text-xs text-rose-400 font-medium mb-4 animate-in fade-in">
            {t.wrongPin}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-white text-xl font-semibold transition-all cursor-pointer flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}

          <div className="flex items-center justify-center">
            <span className="text-xs text-slate-600">PIN: 1234</span>
          </div>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-white text-xl font-semibold transition-all cursor-pointer flex items-center justify-center shadow-xs"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            title="Xóa"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Bảo vệ quyền riêng tư người dùng</span>
        </div>
      </div>
    </div>
  );
};
