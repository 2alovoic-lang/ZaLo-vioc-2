import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isMobileOnlyMode: boolean;
  onToggleMode: () => void;
  appName?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isMobileOnlyMode,
  onToggleMode,
  appName = 'ZaLoVoice',
}) => {
  const [timeStr, setTimeStr] = useState('08:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Device Switcher Bar */}
      <header className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-cyan-400 tracking-wider">ZaLoVoice DZ</span>
          <span className="text-[11px] text-slate-400">المساعد الصوتي الذكي وإمكانية الوصول للجميع</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
          >
            {isMobileOnlyMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>عرض الشاشة الكاملة (سطح المكتب)</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>عرض شاشة هاتف Android</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 overflow-hidden flex items-center justify-center p-0 md:p-3 bg-slate-950">
        {isMobileOnlyMode ? (
          <div className="relative w-full max-w-[420px] h-[98%] max-h-[900px] bg-slate-900 border-4 border-slate-700/80 rounded-[44px] overflow-hidden android-device-shadow flex flex-col">
            {/* Android Status Bar */}
            <div className="h-8 bg-slate-900 px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 shrink-0 z-20">
              <span>{timeStr}</span>
              {/* Punch Hole Camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-sans font-semibold text-sky-400">Mobilis 5G</span>
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Application Inside Device */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-50">
              {children}
            </div>

            {/* Android Bottom Pill Gesture Line */}
            <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0 z-20">
              <div className="w-32 h-1 bg-slate-500 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
