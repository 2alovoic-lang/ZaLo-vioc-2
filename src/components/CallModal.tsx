import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Shield } from 'lucide-react';
import { sound } from '../utils/audio';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface CallModalProps {
  type: 'audio' | 'video';
  contactName: string;
  contactAvatar: string;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CallModal: React.FC<CallModalProps> = ({
  type,
  contactName,
  contactAvatar,
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const [callStatus, setCallStatus] = useState<'calling' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      sound.stopRingtone();
      setCallStatus('calling');
      setCallDuration(0);
      return;
    }

    // Play ringtone while calling
    sound.startRingtone();

    // Auto connect after 3.5 seconds
    const timer = setTimeout(() => {
      sound.stopRingtone();
      setCallStatus('connected');
    }, 3500);

    return () => {
      sound.stopRingtone();
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval: number;
    if (isOpen && callStatus === 'connected') {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    sound.stopRingtone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center">
        {/* Top security tag */}
        <div className="w-full px-6 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Mã hóa đầu cuối ZaLo Voici</span>
          </div>
          <span className="font-mono text-slate-300">
            {callStatus === 'calling' ? t.calling : formatDuration(callDuration)}
          </span>
        </div>

        {/* Video / Avatar view */}
        <div className="w-full h-80 relative flex flex-col items-center justify-center p-6 bg-radial from-slate-800 to-slate-950">
          {type === 'video' && isVideoEnabled ? (
            <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800 flex items-center justify-center">
              <img
                src={contactAvatar.length > 5 ? contactAvatar : '/src/assets/images/zalo_avatar_lan_1792935067919.jpg'}
                alt={contactName}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur px-2.5 py-1 rounded-md text-xs text-white">
                HD 1080p
              </div>
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-950 border border-slate-600 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                <img
                  src="/src/assets/images/zalo_avatar_user_1792935066874.jpg"
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full border-2 border-sky-400/80 overflow-hidden shadow-xl bg-slate-800 flex items-center justify-center text-3xl">
                  {contactAvatar.length > 5 ? (
                    <img src={contactAvatar} alt={contactName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{contactAvatar}</span>
                  )}
                </div>
                {callStatus === 'calling' && (
                  <div className="absolute -inset-2 rounded-full border border-sky-400/40 animate-ping pointer-events-none" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{contactName}</h3>
              <p className="text-sm text-sky-400">
                {callStatus === 'calling' ? t.calling : t.connected}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full p-6 bg-slate-900/95 flex items-center justify-center gap-6 border-t border-slate-800">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? t.micActive : t.micMuted}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isVideoEnabled
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
            }`}
            title={isVideoEnabled ? t.cameraOff : t.cameraOn}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Speaker button */}
          <button
            className="w-12 h-12 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition-all"
            title="Loa ngoài"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* End Call button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={t.endCall}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
