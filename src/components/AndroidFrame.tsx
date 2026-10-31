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
            {/* Android / iOS Unified Seamless Status Bar (Matching Screenshot) */}
            <div className="h-9 bg-[#010914] px-6 flex items-center justify-between text-xs font-semibold text-white shrink-0 z-20">
              <span className="tracking-tight text-white/95 font-sans text-[13px]">9:41</span>
              {/* Subtle Camera / Sensor */}
              <div className="w-3 h-3 rounded-full bg-black/80 border border-slate-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
              {/* Cellular, WiFi, Battery Status */}
              <div className="flex items-center gap-1.5 text-white/90">
                {/* 4 Cellular Signal Bars */}
                <div className="flex items-end gap-[1.5px] h-3 mr-0.5">
                  <span className="w-[2.5px] h-1 bg-white rounded-xs" />
                  <span className="w-[2.5px] h-1.5 bg-white rounded-xs" />
                  <span className="w-[2.5px] h-2 bg-white rounded-xs" />
                  <span className="w-[2.5px] h-3 bg-white rounded-xs" />
                </div>
                <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
                {/* Battery Pill */}
                <div className="w-5 h-2.5 rounded-sm border border-white/80 p-[1px] flex items-center">
                  <div className="h-full w-3.5 bg-white rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Application Inside Device */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[#010914]">
              {children}
            </div>

            {/* Android / Modern Gesture Navigation Bar */}
            <div className="h-4 bg-[#010914] flex items-center justify-center shrink-0 z-20">
              <div className="w-28 h-1 bg-slate-600/70 rounded-full" />
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
