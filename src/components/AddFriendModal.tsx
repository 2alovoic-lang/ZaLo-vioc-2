import React, { useState } from 'react';
import { X, UserPlus, QrCode, Search, Check } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language, Contact } from '../types';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (friend: Omit<Contact, 'id'>) => void;
  lang: Language;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  lang,
}) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'phone' | 'qr'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      bio: 'Người dùng ZaLo Voici mới',
      category: 'friends',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setPhone('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base">{t.addFriend}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/70 border-b border-slate-200/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('phone')}
            className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm theo số điện thoại</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('qr')}
            className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR kết nối</span>
          </button>
        </div>

        {tab === 'phone' ? (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {isSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-900">Đã gửi lời mời kết bạn!</div>
                <div className="text-xs text-slate-500 mt-1">Đang thêm vào danh bạ ZaLo Voici của bạn...</div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Họ và tên bạn bè
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Hoàng Nam"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {t.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+84 9xx xxx xxx"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Kết bạn
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
              {/* Synthetic sleek QR Code SVG representation */}
              <div className="w-44 h-44 bg-slate-900 p-2 rounded-xl flex items-center justify-center text-white">
                <div className="grid grid-cols-7 gap-1 w-full h-full p-2 bg-white rounded-lg">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i < 7 || i > 41 || i % 7 === 0 || i % 7 === 6
                          ? 'bg-slate-900'
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900">Quét mã QR để kết bạn tức thì</div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Mở ứng dụng Zalo trên điện thoại, chọn biểu tượng QR ở góc trên để quét mã này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
