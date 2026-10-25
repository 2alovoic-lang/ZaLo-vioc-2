import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Video,
  MessageSquare,
  Search,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { Contact, Language } from '../types';
import { translations } from '../utils/translations';

interface ContactsViewProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenCall: (contact: Contact, type: 'audio' | 'video') => void;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  lang: Language;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContact,
  onOpenCall,
  onOpenAddFriend,
  onOpenCreateGroup,
  lang,
}) => {
  const t = translations[lang];
  const [subTab, setSubTab] = useState<'friends' | 'groups' | 'requests' | 'oa'>('friends');
  const [search, setSearch] = useState('');

  // Mock friend requests
  const [friendRequests, setFriendRequests] = useState([
    {
      id: 'req_1',
      name: 'Nguyễn Văn Hùng',
      phone: '+84 967 889 001',
      bio: 'Lập trình viên Fullstack, muốn kết nối trao đổi kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ]);

  const handleAcceptRequest = (id: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== id));
    alert('Đã chấp nhận kết bạn thành công!');
  };

  const handleDeclineRequest = (id: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredContacts = contacts.filter((c) => {
    if (c.id === 'user_cloud') return false;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (subTab === 'groups') return c.phone.includes('Nhóm');
    if (subTab === 'oa') return c.isOfficialAccount;
    if (subTab === 'friends') return !c.phone.includes('Nhóm') && !c.isOfficialAccount;
    return true;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 flex select-none">
      {/* Left sub-panel for directory category */}
      <div className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
            {t.navContacts}
          </div>

          <button
            onClick={() => setSubTab('friends')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'friends'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Danh sách bạn bè</span>
            </div>
            <span className="font-mono text-slate-400">
              {contacts.filter((c) => !c.phone.includes('Nhóm') && !c.isOfficialAccount && c.id !== 'user_cloud').length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('groups')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'groups'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Danh sách nhóm</span>
            </div>
            <span className="font-mono text-slate-400">
              {contacts.filter((c) => c.phone.includes('Nhóm')).length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('requests')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'requests'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>{t.friendRequests}</span>
            </div>
            {friendRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('oa')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              subTab === 'oa'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Official Account</span>
            </div>
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <button
            onClick={onOpenAddFriend}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addFriend}</span>
          </button>
          <button
            onClick={onOpenCreateGroup}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>{t.createGroup}</span>
          </button>
        </div>
      </div>

      {/* Right List of contacts */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm liên hệ theo tên, số điện thoại..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {subTab === 'requests' ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">
                Lời mời kết bạn đang chờ ({friendRequests.length})
              </h3>
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{req.name}</div>
                      <div className="text-xs text-slate-500">{req.phone}</div>
                      <div className="text-xs text-slate-600 mt-1">{req.bio}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      {t.decline}
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                    >
                      {t.accept}
                    </button>
                  </div>
                </div>
              ))}

              {friendRequests.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không có lời mời kết bạn nào.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div
                    onClick={() => onSelectContact(contact)}
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-base">
                        {contact.avatar.length > 5 ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{contact.avatar}</span>
                        )}
                      </div>
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">
                        {contact.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{contact.bio}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectContact(contact)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Nhắn tin"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {!contact.phone.includes('Nhóm') && (
                      <>
                        <button
                          onClick={() => onOpenCall(contact, 'audio')}
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={t.audioCall}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenCall(contact, 'video')}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title={t.videoCall}
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy liên hệ nào phù hợp.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
