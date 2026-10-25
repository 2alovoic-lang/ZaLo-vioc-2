import React from 'react';
import {
  X,
  Bell,
  BellOff,
  Pin,
  Trash2,
  FileText,
  Link2,
  Image as ImageIcon,
  Users,
  Shield,
  Download,
  Palette,
} from 'lucide-react';
import { Conversation, Message, Contact, Language } from '../types';
import { translations } from '../utils/translations';

interface ChatInfoPanelProps {
  conversation: Conversation;
  messages: Message[];
  contacts: Contact[];
  isOpen: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
  onClearHistory: () => void;
  onSelectImage: (url: string) => void;
  onChangeWallpaper: (color: string) => void;
  onAddMemberToGroup?: () => void;
  lang: Language;
}

const WALLPAPER_COLORS = [
  { label: 'Mặc định', value: '#FFFFFF' },
  { label: 'Xanh êm dịu', value: '#EFF6FF' },
  { label: 'Xanh ngọc', value: '#F0FDFA' },
  { label: 'Hồng phấn', value: '#FFF1F2' },
  { label: 'Vàng ấm', value: '#FEFCE8' },
  { label: 'Xám sáng', value: '#F8FAFC' },
];

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({
  conversation,
  messages,
  contacts,
  isOpen,
  onClose,
  onToggleMute,
  onTogglePin,
  onClearHistory,
  onSelectImage,
  onChangeWallpaper,
  onAddMemberToGroup,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  // Find shared images
  const sharedImages = messages
    .filter((m) => m.type === 'image' && m.mediaUrl)
    .map((m) => m.mediaUrl as string);

  // Find shared files
  const sharedFiles = messages.filter((m) => m.type === 'file' && m.fileName);

  // Find members if group
  const memberContacts = conversation.isGroup
    ? contacts.filter((c) => conversation.members.includes(c.id))
    : [];

  return (
    <div className="w-80 h-full border-l border-slate-200 bg-white flex flex-col z-20 shrink-0 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-slate-800 text-sm">{t.chatInfo}</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* Profile summary */}
        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-18 h-18 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-2xl shadow-xs mb-3">
            {conversation.avatar.length > 5 ? (
              <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
            ) : (
              <span>{conversation.avatar}</span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-base">{conversation.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {conversation.isGroup
              ? `${conversation.members.length} ${t.members}`
              : conversation.id === 'conv_cloud'
              ? 'Lưu trữ đám mây riêng tư'
              : 'ZaLo ID: ' + conversation.id}
          </p>

          {/* Quick toggles */}
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={onToggleMute}
              className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 group cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  conversation.isMuted
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}
              >
                {conversation.isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </div>
              <span className="text-[11px]">{conversation.isMuted ? 'Đã tắt' : 'Báo tin'}</span>
            </button>

            <button
              onClick={onTogglePin}
              className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 group cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  conversation.isPinned
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}
              >
                <Pin className="w-4 h-4" />
              </div>
              <span className="text-[11px]">{conversation.isPinned ? 'Đã ghim' : 'Ghim'}</span>
            </button>
          </div>
        </div>

        {/* Wallpaper Picker */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>{t.wallpaper}</span>
          </div>
          <div className="flex items-center gap-2">
            {WALLPAPER_COLORS.map((wp) => (
              <button
                key={wp.value}
                onClick={() => onChangeWallpaper(wp.value)}
                style={{ backgroundColor: wp.value }}
                className="w-7 h-7 rounded-full border border-slate-300 shadow-xs hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title={wp.label}
              />
            ))}
          </div>
        </div>

        {/* Group members */}
        {conversation.isGroup && (
          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Thành viên nhóm ({memberContacts.length})</span>
              </div>
              {onAddMemberToGroup && (
                <button
                  onClick={onAddMemberToGroup}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  + Thêm
                </button>
              )}
            </div>
            <div className="space-y-2">
              {memberContacts.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-1 rounded-lg">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs">
                    {m.avatar.length > 5 ? (
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{m.avatar}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Media */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2.5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>{t.sharedPhotos} ({sharedImages.length})</span>
            </div>
          </div>

          {sharedImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {sharedImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectImage(img)}
                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img src={img} alt="Shared" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Chưa có ảnh hoặc video nào được gửi.</div>
          )}
        </div>

        {/* Shared Files */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{t.sharedFiles} ({sharedFiles.length})</span>
            </div>
          </div>

          {sharedFiles.length > 0 ? (
            <div className="space-y-2">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{file.fileName}</div>
                      <div className="text-[10px] text-slate-400">{file.fileSize || '1.2 MB'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Đang tải tập tin: ${file.fileName}`)}
                    className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="Tải tập tin"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Chưa có tập tin tài liệu nào.</div>
          )}
        </div>

        {/* Security & Clear Actions */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mã hóa bảo vệ dữ liệu ZaLo</span>
          </div>

          <button
            onClick={onClearHistory}
            className="w-full py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.deleteChat}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
