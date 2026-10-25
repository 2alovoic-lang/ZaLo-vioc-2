import React from 'react';
import {
  MessageSquare,
  Users,
  Compass,
  Clock,
  Cloud,
  Settings,
  Lock,
  Search,
  UserPlus,
  Pin,
  CheckCheck,
  Check,
  Filter,
} from 'lucide-react';
import { Conversation, UserProfile, Language } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  currentTab: 'messages' | 'contacts' | 'moments' | 'cloud';
  onTabChange: (tab: 'messages' | 'contacts' | 'moments' | 'cloud') => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  currentUser: UserProfile;
  onOpenSettings: () => void;
  onLockApp: () => void;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  onOpenSettings,
  onLockApp,
  onOpenAddFriend,
  onOpenCreateGroup,
  lang,
}) => {
  const t = translations[lang];
  const [filterType, setFilterType] = React.useState<'all' | 'unread' | 'work' | 'friends'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const filteredConversations = conversations
    .filter((c) => {
      if (filterType === 'unread') return c.unreadCount > 0;
      if (filterType === 'work') return c.category === 'work';
      if (filterType === 'friends') return c.category === 'friends';
      return true;
    })
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Pinned conversations at top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  return (
    <div className="flex h-full shrink-0 select-none">
      {/* Primary Rail (64px) - Iconic Zalo Navy/Blue */}
      <div className="w-16 h-full bg-[#0068FF] flex flex-col items-center justify-between py-4 text-white z-30 shrink-0 shadow-md">
        {/* Top: Avatar & Brand */}
        <div className="flex flex-col items-center gap-5">
          {/* User profile avatar trigger */}
          <button
            onClick={onOpenSettings}
            className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-white/80 transition-all cursor-pointer"
            title={`${currentUser.name} - ${t.profileSettings}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border border-white/40">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0068FF] rounded-full" />
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col items-center gap-2">
            {/* Tin nhắn / Messages */}
            <button
              onClick={() => onTabChange('messages')}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                currentTab === 'messages'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={t.navMessages}
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>

            {/* Danh bạ / Contacts */}
            <button
              onClick={() => onTabChange('contacts')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                currentTab === 'contacts'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={t.navContacts}
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Nhật ký / Moments */}
            <button
              onClick={() => onTabChange('moments')}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                currentTab === 'moments'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={t.navMoments}
            >
              <Clock className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
            </button>

            {/* Cloud của tôi / My Cloud */}
            <button
              onClick={() => onTabChange('cloud')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                currentTab === 'cloud'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={t.navCloud}
            >
              <Cloud className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Actions: Settings & Lock App */}
        <div className="flex flex-col items-center gap-2">
          {currentUser.pinLockEnabled && (
            <button
              onClick={onLockApp}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title={t.lockApp}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title={t.navSettings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-Sidebar (320px) - Only shown on 'messages' tab */}
      {currentTab === 'messages' && (
        <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col z-20 shrink-0">
          {/* Top Search & Action Bar */}
          <div className="p-3 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={onOpenAddFriend}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={t.addFriend}
              >
                <UserPlus className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCreateGroup}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={t.createGroup}
              >
                <Users className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs: Tất cả, Chưa đọc, Phân loại */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  filterType === 'all'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  filterType === 'unread'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.unread}
              </button>
              <button
                onClick={() => setFilterType('work')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  filterType === 'work'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.work}
              </button>
              <button
                onClick={() => setFilterType('friends')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                  filterType === 'friends'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.friends}
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors relative ${
                    isActive
                      ? 'bg-blue-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold">
                      {conv.avatar.length > 5 ? (
                        <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{conv.avatar}</span>
                      )}
                    </div>
                    {conv.id !== 'conv_cloud' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Name & Last Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {conv.name}
                        </span>
                        {conv.isPinned && (
                          <Pin className="w-3 h-3 text-slate-400 fill-slate-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {conv.lastMessage?.timestamp || 'Hôm nay'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate pr-2">
                        {conv.lastMessage ? (
                          conv.lastMessage.type === 'image' ? (
                            '📷 [Hình ảnh]'
                          ) : conv.lastMessage.type === 'voice' ? (
                            '🎙️ [Tin nhắn thoại]'
                          ) : conv.lastMessage.type === 'file' ? (
                            '📎 [Tập tin đính kèm]'
                          ) : conv.lastMessage.type === 'poll' ? (
                            '📊 [Bình chọn]'
                          ) : conv.lastMessage.type === 'sticker' ? (
                            '🎉 [Nhãn dán]'
                          ) : (
                            conv.lastMessage.text
                          )
                        ) : (
                          'Chưa có tin nhắn'
                        )}
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Không tìm thấy cuộc trò chuyện nào.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
