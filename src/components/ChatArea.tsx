import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Search,
  Sidebar as SidebarIcon,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  Send,
  ThumbsUp,
  BarChart2,
  Check,
  CheckCheck,
  Pin,
  Play,
  Pause,
  Download,
  Copy,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { Conversation, Message, UserProfile, Language, MessageType } from '../types';
import { translations } from '../utils/translations';
import { STICKER_LIST, EMOJI_REACTIONS } from '../data/mockData';
import { sound } from '../utils/audio';

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: UserProfile;
  onSendMessage: (msg: {
    text: string;
    type: MessageType;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    voiceDuration?: number;
    stickerIcon?: string;
  }) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onTogglePinMessage: (messageId: string) => void;
  onOpenCall: (type: 'audio' | 'video') => void;
  onToggleInfo: () => void;
  onSelectImage: (url: string) => void;
  onOpenPollModal: () => void;
  lang: Language;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onVotePoll,
  onReactMessage,
  onDeleteMessage,
  onTogglePinMessage,
  onOpenCall,
  onToggleInfo,
  onSelectImage,
  onOpenPollModal,
  lang,
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Playing voice memo
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle voice recording timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      text: inputText.trim(),
      type: 'text',
    });
    setInputText('');
  };

  const handleSendLike = () => {
    onSendMessage({
      text: '',
      type: 'sticker',
      stickerIcon: '👍',
    });
  };

  const handleSendSticker = (icon: string) => {
    onSendMessage({
      text: '',
      type: 'sticker',
      stickerIcon: icon,
    });
    setShowStickers(false);
  };

  const handleFinishVoiceRecord = () => {
    if (recordingSeconds > 0) {
      onSendMessage({
        text: `[Tin nhắn thoại: ${recordingSeconds}s]`,
        type: 'voice',
        voiceDuration: recordingSeconds,
      });
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleCancelVoiceRecord = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handlePlayVoice = (msgId: string) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
    } else {
      sound.playVoiceNoteBeep();
      setPlayingVoiceId(msgId);
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSendMessage({
            text: file.name,
            type: 'image',
            mediaUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      onSendMessage({
        text: file.name,
        type: 'file',
        fileName: file.name,
        fileSize: `${sizeMB} MB`,
      });
    }
    if (e.target) e.target.value = '';
  };

  // Filter messages by search
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div
      className="flex-1 h-full flex flex-col min-w-0 relative bg-white"
      style={{ backgroundColor: conversation.wallpaper || '#FFFFFF' }}
    >
      {/* Top Header */}
      <div className="h-16 px-4 bg-white/95 backdrop-blur-xs border-b border-slate-200 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 border border-slate-200 flex items-center justify-center text-lg font-bold">
              {conversation.avatar.length > 5 ? (
                <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
              ) : (
                <span>{conversation.avatar}</span>
              )}
            </div>
            {conversation.id !== 'conv_cloud' && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-slate-900 text-sm truncate">{conversation.name}</h2>
              {conversation.isPinned && <Pin className="w-3 h-3 text-blue-600 fill-blue-600 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 truncate">
              {conversation.isGroup
                ? `${conversation.members.length} ${t.members}`
                : conversation.id === 'conv_cloud'
                ? 'Lưu trữ đám mây cá nhân'
                : t.justNow}
            </p>
          </div>
        </div>

        {/* Header Right Action icons */}
        <div className="flex items-center gap-1 text-slate-600">
          {showSearchBox ? (
            <div className="relative flex items-center mr-1">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchChat}
                className="w-48 pl-7 pr-6 py-1 text-xs bg-slate-100 rounded-md border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <button
                onClick={() => {
                  setShowSearchBox(false);
                  setSearchQuery('');
                }}
                className="absolute right-1.5 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchBox(true)}
              className="p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title={t.searchChat}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {conversation.id !== 'conv_cloud' && (
            <>
              <button
                onClick={() => onOpenCall('audio')}
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title={t.audioCall}
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenCall('video')}
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title={t.videoCall}
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onToggleInfo}
            className="p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors ml-1"
            title={t.chatInfo}
          >
            <SidebarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pinned Message Banner */}
      {conversation.pinnedMessage && (
        <div className="bg-blue-50/90 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900 z-10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium truncate">{conversation.pinnedMessage}</span>
          </div>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        <div className="flex items-center justify-center my-2">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-3 py-0.5 rounded-full">
            Hôm nay
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const isSentByMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} group relative`}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {/* Incoming partner avatar */}
                {!isSentByMe && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 mb-1">
                    {conversation.avatar.length > 5 ? (
                      <img src={conversation.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-xs">
                        {conversation.avatar}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Bubble container */}
                <div className="relative">
                  {/* Bubble Content */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-2xs transition-colors ${
                      isSentByMe
                        ? 'bg-blue-600 text-white bubble-sent'
                        : 'bg-slate-100 text-slate-900 border border-slate-200/80 bubble-received'
                    }`}
                  >
                    {/* Text Message */}
                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                    )}

                    {/* Image Message */}
                    {msg.type === 'image' && msg.mediaUrl && (
                      <div className="space-y-1.5">
                        <div
                          onClick={() => onSelectImage(msg.mediaUrl!)}
                          className="rounded-xl overflow-hidden cursor-pointer max-w-sm max-h-72 border border-black/10 hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Sent media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {msg.text && (
                          <p className="text-xs mt-1 whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    )}

                    {/* Voice Memo */}
                    {msg.type === 'voice' && (
                      <div className="flex items-center gap-3 py-1 min-w-[200px]">
                        <button
                          onClick={() => handlePlayVoice(msg.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                            isSentByMe
                              ? 'bg-white text-blue-600'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-1 h-6">
                            {[1, 2, 3, 4, 5, 2, 4, 3, 5, 1, 3, 4].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  playingVoiceId === msg.id
                                    ? `bg-amber-300 animate-wave-${(i % 5) + 1}`
                                    : isSentByMe
                                    ? 'bg-blue-200'
                                    : 'bg-slate-400'
                                }`}
                                style={{ height: `${h * 4}px` }}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-[11px] font-mono ${
                              isSentByMe ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            0:{msg.voiceDuration?.toString().padStart(2, '0') || '15'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* File Attachment */}
                    {msg.type === 'file' && (
                      <div
                        className={`flex items-center gap-3 p-1 rounded-lg ${
                          isSentByMe ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSentByMe ? 'bg-white/20' : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-xs truncate max-w-[180px]">
                            {msg.fileName || msg.text}
                          </div>
                          <div
                            className={`text-[10px] ${
                              isSentByMe ? 'text-blue-200' : 'text-slate-500'
                            }`}
                          >
                            {msg.fileSize || '1.8 MB'}
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Tải tập tin: ${msg.fileName || msg.text}`)}
                          className={`p-1.5 rounded-full transition-colors ${
                            isSentByMe ? 'hover:bg-white/20' : 'hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Tải tập tin"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Sticker */}
                    {msg.type === 'sticker' && (
                      <div className="text-5xl py-1 transform hover:scale-110 transition-transform select-none">
                        {msg.stickerIcon || '🎉'}
                      </div>
                    )}

                    {/* Poll */}
                    {msg.type === 'poll' && msg.poll && (
                      <div className="w-72 p-1 text-slate-900">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-xs text-blue-600 uppercase tracking-wide">
                            Bình chọn
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-3 text-slate-800">
                          {msg.poll.question}
                        </h4>

                        <div className="space-y-2 mb-3">
                          {msg.poll.options.map((opt) => {
                            const hasVoted = opt.votes.includes(currentUser.id);
                            const totalVotes =
                              msg.poll?.options.reduce((acc, o) => acc + o.votes.length, 0) || 1;
                            const percentage = Math.round((opt.votes.length / (totalVotes || 1)) * 100);

                            return (
                              <button
                                key={opt.id}
                                onClick={() => onVotePoll(msg.id, opt.id)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all relative overflow-hidden cursor-pointer ${
                                  hasVoted
                                    ? 'border-blue-500 bg-blue-50/70 font-medium'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                {/* Progress bar background */}
                                <div
                                  className="absolute top-0 bottom-0 left-0 bg-blue-100/60 pointer-events-none transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                                <div className="relative flex items-center justify-between text-xs z-10">
                                  <span className="truncate pr-2">{opt.text}</span>
                                  <span className="font-mono text-slate-500 shrink-0">
                                    {opt.votes.length} ({percentage}%)
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 text-right">
                          {msg.poll.totalVotes || 0} lượt bình chọn
                        </div>
                      </div>
                    )}

                    {/* Timestamp & Seen checkmark */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isSentByMe ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      <span className="font-mono">{msg.timestamp}</span>
                      {isSentByMe && (
                        <span>
                          {msg.status === 'seen' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-300 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-blue-300 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reaction Badges */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div
                      className={`absolute -bottom-2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs text-xs z-10 cursor-pointer ${
                        isSentByMe ? 'right-2' : 'left-2'
                      }`}
                      onClick={() => setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)}
                    >
                      {Object.entries(msg.reactions).map(([emoji, count]) =>
                        count > 0 ? (
                          <span key={emoji} className="flex items-center gap-0.5">
                            <span>{emoji}</span>
                            {count > 1 && <span className="text-[10px] text-slate-600 font-mono">{count}</span>}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}

                  {/* Hover Action Bar */}
                  <div
                    className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center bg-white border border-slate-200 rounded-full shadow-md px-1 py-0.5 z-20 gap-0.5 ${
                      isSentByMe ? 'right-full mr-2' : 'left-full ml-2'
                    }`}
                  >
                    <button
                      onClick={() =>
                        setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)
                      }
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-amber-500 transition-colors"
                      title="Bày tỏ cảm xúc"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(msg.text || '');
                        alert(t.copied);
                      }}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTogglePinMessage(msg.id)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Ghim tin nhắn"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors"
                      title="Xóa tin nhắn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reaction Emoji Picker Popover */}
                  {activeReactionMsgId === msg.id && (
                    <div
                      className={`absolute bottom-full mb-1 flex items-center gap-1.5 bg-white border border-slate-200 rounded-full shadow-lg p-1.5 z-30 animate-in fade-in zoom-in-95 ${
                        isSentByMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReactMessage(msg.id, emoji);
                            setActiveReactionMsgId(null);
                          }}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Stickers Picker Popover */}
      {showStickers && (
        <div className="absolute bottom-20 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 w-72 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-semibold text-slate-700">Bộ biểu cảm ZaLo</span>
            <button
              onClick={() => setShowStickers(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto">
            {STICKER_LIST.map((stk) => (
              <button
                key={stk.id}
                onClick={() => handleSendSticker(stk.icon)}
                className="w-12 h-12 rounded-xl hover:bg-blue-50 flex items-center justify-center text-2xl hover:scale-115 transition-transform cursor-pointer"
                title={stk.label}
              >
                {stk.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Input Action Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        {/* Attachment tool icons */}
        <div className="flex items-center gap-1 mb-2 text-slate-500">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
              showStickers ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-800'
            }`}
            title="Biểu cảm / Nhãn dán"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
            title="Gửi hình ảnh"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
            title="Đính kèm tập tin"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenPollModal}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
            title="Tạo cuộc bình chọn"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>

        {/* Input box or Audio Recording Bar */}
        {isRecording ? (
          <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-2xl animate-pulse">
            <div className="flex items-center gap-2 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-semibold">{t.recordingVoice}</span>
              <span className="text-xs font-mono font-bold">
                0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelVoiceRecord}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-rose-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleFinishVoiceRecord}
                className="px-4 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Gửi thoại
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder={`${t.typeMessage} ${conversation.name}...`}
                className="w-full px-4 py-2.5 text-sm bg-slate-100 rounded-2xl border-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-none max-h-32 transition-all leading-normal"
              />
            </div>

            {/* Voice record trigger */}
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title={t.recordVoice}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send or Thumbs Up */}
            {inputText.trim().length > 0 ? (
              <button
                type="submit"
                className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                title={t.send}
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendLike}
                className="p-2.5 rounded-full text-blue-600 hover:bg-blue-50 transition-transform active:scale-125 cursor-pointer"
                title="Gửi biểu tượng thích"
              >
                <ThumbsUp className="w-5 h-5 fill-blue-600" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
