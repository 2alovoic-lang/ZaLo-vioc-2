import React, { useState, useEffect } from 'react';
import {
  currentUser as defaultUser,
  initialContacts,
  initialConversations,
  initialMessages,
  initialMoments,
  initialCloudItems,
} from './data/mockData';
import {
  UserProfile,
  Conversation,
  Message,
  Contact,
  MomentPost,
  CloudItem,
  Language,
  MessageType,
  PollData,
} from './types';
import { sound } from './utils/audio';

import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInfoPanel } from './components/ChatInfoPanel';
import { MomentsView } from './components/MomentsView';
import { CloudView } from './components/CloudView';
import { ContactsView } from './components/ContactsView';
import { CallModal } from './components/CallModal';
import { PollModal } from './components/PollModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { AddFriendModal } from './components/AddFriendModal';
import { SettingsModal } from './components/SettingsModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { PinLockScreen } from './components/PinLockScreen';

export default function App() {
  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zalo_voici_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  // App Navigation
  const [currentTab, setCurrentTab] = useState<'messages' | 'contacts' | 'moments' | 'cloud'>('messages');
  const [activeConversationId, setActiveConversationId] = useState<string>('conv_lan');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // App Locked State
  const [isAppLocked, setIsAppLocked] = useState(false);

  // Core Data
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zalo_voici_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('zalo_voici_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('zalo_voici_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [moments, setMoments] = useState<MomentPost[]>(() => {
    const saved = localStorage.getItem('zalo_voici_moments');
    return saved ? JSON.parse(saved) : initialMoments;
  });

  const [cloudItems, setCloudItems] = useState<CloudItem[]>(() => {
    const saved = localStorage.getItem('zalo_voici_cloud');
    return saved ? JSON.parse(saved) : initialCloudItems;
  });

  // Modals
  const [callState, setCallState] = useState<{
    isOpen: boolean;
    type: 'audio' | 'video';
    name: string;
    avatar: string;
  }>({
    isOpen: false,
    type: 'audio',
    name: '',
    avatar: '',
  });

  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('zalo_voici_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('zalo_voici_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('zalo_voici_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('zalo_voici_moments', JSON.stringify(moments));
  }, [moments]);

  useEffect(() => {
    localStorage.setItem('zalo_voici_cloud', JSON.stringify(cloudItems));
  }, [cloudItems]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeChatMessages = messages[activeConversationId] || [];

  // Handle Send Message
  const handleSendMessage = (msgData: {
    text: string;
    type: MessageType;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    voiceDuration?: number;
    stickerIcon?: string;
  }) => {
    const newMsgId = `m_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: newMsgId,
      conversationId: activeConversationId,
      senderId: user.id,
      text: msgData.text,
      timestamp,
      status: 'delivered',
      type: msgData.type,
      mediaUrl: msgData.mediaUrl,
      fileName: msgData.fileName,
      fileSize: msgData.fileSize,
      voiceDuration: msgData.voiceDuration,
      stickerIcon: msgData.stickerIcon,
    };

    // Update messages
    const updatedChatMessages = [...activeChatMessages, newMsg];
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: updatedChatMessages,
    }));

    // Update conversation last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              unreadCount: 0,
              lastMessage: {
                text: msgData.text || (msgData.type === 'sticker' ? '🎉 [Nhãn dán]' : '[Đính kèm]'),
                timestamp,
                senderId: user.id,
                type: msgData.type,
              },
            }
          : c
      )
    );

    // Realistic auto-reply simulation for interactive contacts
    if (activeConversationId === 'conv_lan' || activeConversationId === 'conv_minh') {
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const partnerName = activeConversationId === 'conv_lan' ? 'Lan Anh' : 'Minh Tuấn';
        const partnerId = activeConversationId === 'conv_lan' ? 'user_lan' : 'user_minh';

        const repliesLan = [
          'Dạ vâng anh, em nhận được rồi ạ! Để em lưu lại ngay.',
          'Haha chuẩn luôn anh ơi! Cuối tuần này em kể thêm cho anh nhé! ✨',
          'Tuyệt vời quá! Cảm ơn anh đã chia sẻ thông tin hữu ích này.',
        ];
        const repliesMinh = [
          'Dạ em đã nhận được tin từ anh! Em đang kiểm tra lại hệ thống ngay.',
          'Mọi thứ chạy rất mượt anh nhé, thông số kiểm thử đều đạt chuẩn 100%.',
          'Vâng anh, em đã cập nhật tài liệu và lưu vào hệ thống rồi ạ! 🚀',
        ];

        const randomReply =
          activeConversationId === 'conv_lan'
            ? repliesLan[Math.floor(Math.random() * repliesLan.length)]
            : repliesMinh[Math.floor(Math.random() * repliesMinh.length)];

        const replyMsg: Message = {
          id: `reply_${Date.now()}`,
          conversationId: activeConversationId,
          senderId: partnerId,
          text: randomReply,
          timestamp: replyTime,
          status: 'delivered',
          type: 'text',
        };

        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: [...(prev[activeConversationId] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: randomReply,
                    timestamp: replyTime,
                    senderId: partnerId,
                    type: 'text',
                  },
                }
              : c
          )
        );

        if (user.soundEnabled) {
          sound.playMessageNotification();
        }
      }, 1600);
    }
  };

  // Poll voting
  const handleVotePoll = (messageId: string, optionId: string) => {
    setMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      const updated = currentList.map((m) => {
        if (m.id === messageId && m.poll) {
          const newOptions = m.poll.options.map((opt) => {
            const hasVoted = opt.votes.includes(user.id);
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: hasVoted
                  ? opt.votes.filter((id) => id !== user.id)
                  : [...opt.votes, user.id],
              };
            } else if (!m.poll?.multiChoice) {
              return {
                ...opt,
                votes: opt.votes.filter((id) => id !== user.id),
              };
            }
            return opt;
          });

          const totalVotes = newOptions.reduce((acc, opt) => acc + opt.votes.length, 0);

          return {
            ...m,
            poll: {
              ...m.poll,
              options: newOptions,
              totalVotes,
            },
          };
        }
        return m;
      });

      return {
        ...prev,
        [activeConversationId]: updated,
      };
    });
  };

  // Create Poll Submission
  const handleCreatePoll = (pollData: PollData) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `m_poll_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user.id,
      text: `${user.name} đã tạo cuộc bình chọn: ${pollData.question}`,
      timestamp,
      status: 'delivered',
      type: 'poll',
      poll: pollData,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: {
                text: `Bình chọn: ${pollData.question}`,
                timestamp,
                senderId: user.id,
                type: 'poll',
              },
            }
          : c
      )
    );
  };

  // Reaction to message
  const handleReactMessage = (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      const updated = currentList.map((m) => {
        if (m.id === messageId) {
          const reactions = { ...(m.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...m, reactions };
        }
        return m;
      });
      return {
        ...prev,
        [activeConversationId]: updated,
      };
    });
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== messageId),
    }));
  };

  // Pin message
  const handleTogglePinMessage = (messageId: string) => {
    const targetMsg = activeChatMessages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              pinnedMessage: c.pinnedMessage ? undefined : `📌 ${targetMsg.text.slice(0, 45)}...`,
            }
          : c
      )
    );
  };

  // Toggle Mute / Pin for conversation
  const handleToggleMute = () => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const handleTogglePinConversation = () => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tin nhắn của cuộc trò chuyện này?')) {
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: [],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMessage: undefined,
              }
            : c
        )
      );
    }
  };

  const handleChangeWallpaper = (color: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, wallpaper: color } : c))
    );
  };

  // Create Group Chat
  const handleCreateGroup = (name: string, memberIds: string[]) => {
    const newConvId = `conv_group_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      isGroup: true,
      name,
      avatar: '👥',
      members: [user.id, ...memberIds],
      unreadCount: 0,
      category: 'work',
      isPinned: false,
      lastMessage: {
        text: 'Nhóm đã được tạo thành công.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: user.id,
      },
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConvId);
    setCurrentTab('messages');
  };

  // Add Friend
  const handleAddFriend = (newFriend: Omit<Contact, 'id'>) => {
    const newId = `contact_${Date.now()}`;
    const contactObj: Contact = { ...newFriend, id: newId };
    setContacts([contactObj, ...contacts]);

    // Also create conversation
    const newConvId = `conv_${newId}`;
    const newConv: Conversation = {
      id: newConvId,
      isGroup: false,
      name: contactObj.name,
      avatar: contactObj.avatar,
      members: [user.id, newId],
      unreadCount: 0,
      category: 'friends',
      isPinned: false,
      lastMessage: {
        text: 'Đã kết nối bạn bè trên ZaLo Voici.',
        timestamp: 'Vừa xong',
        senderId: user.id,
      },
    };

    setConversations([newConv, ...conversations]);
  };

  // Call trigger
  const handleStartCall = (type: 'audio' | 'video', targetName?: string, targetAvatar?: string) => {
    setCallState({
      isOpen: true,
      type,
      name: targetName || activeConversation.name,
      avatar: targetAvatar || activeConversation.avatar,
    });
  };

  // Moments actions
  const handleAddPost = (content: string, images: string[]) => {
    const newPost: MomentPost = {
      id: `post_${Date.now()}`,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      timestamp: 'Vừa xong',
      content,
      images,
      likes: {
        count: 1,
        hasLiked: true,
        reaction: '❤️',
      },
      comments: [],
    };
    setMoments([newPost, ...moments]);
  };

  const handleLikePost = (postId: string, reaction: string) => {
    setMoments((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextHasLiked = !p.likes.hasLiked;
          return {
            ...p,
            likes: {
              count: nextHasLiked ? p.likes.count + 1 : Math.max(0, p.likes.count - 1),
              hasLiked: nextHasLiked,
              reaction: nextHasLiked ? reaction : '❤️',
            },
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setMoments((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                author: user.name,
                avatar: user.avatar,
                text,
                time: 'Vừa xong',
              },
            ],
          };
        }
        return p;
      })
    );
  };

  // Cloud actions
  const handleAddCloudItem = (item: Omit<CloudItem, 'id' | 'timestamp'>) => {
    const newItem: CloudItem = {
      ...item,
      id: `cloud_${Date.now()}`,
      timestamp: `Hôm nay ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setCloudItems([newItem, ...cloudItems]);
  };

  const handleDeleteCloudItem = (id: string) => {
    setCloudItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Select contact to open chat directly
  const handleSelectContactToChat = (contact: Contact) => {
    let conv = conversations.find(
      (c) => c.members.includes(contact.id) && !c.isGroup
    );
    if (!conv) {
      const newConvId = `conv_${contact.id}`;
      conv = {
        id: newConvId,
        isGroup: false,
        name: contact.name,
        avatar: contact.avatar,
        members: [user.id, contact.id],
        unreadCount: 0,
        category: contact.category,
        isPinned: false,
      };
      setConversations([conv, ...conversations]);
    }
    setActiveConversationId(conv.id);
    setCurrentTab('messages');
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-900 font-sans">
      {/* PIN Lock Screen if active */}
      {isAppLocked && (
        <PinLockScreen
          correctPin={user.pinCode || '1234'}
          onUnlock={() => setIsAppLocked(false)}
          lang={user.language}
        />
      )}

      {/* Main App Container */}
      <div className="w-full h-full flex overflow-hidden bg-slate-50">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab === 'cloud') {
              setActiveConversationId('conv_cloud');
            }
          }}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            // Mark as read
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
            );
          }}
          currentUser={user}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLockApp={() => setIsAppLocked(true)}
          onOpenAddFriend={() => setIsAddFriendOpen(true)}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          lang={user.language}
        />

        {/* Tab 1: Messages / Chat */}
        {currentTab === 'messages' && (
          <div className="flex-1 h-full flex overflow-hidden min-w-0">
            <ChatArea
              conversation={activeConversation}
              messages={activeChatMessages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onVotePoll={handleVotePoll}
              onReactMessage={handleReactMessage}
              onDeleteMessage={handleDeleteMessage}
              onTogglePinMessage={handleTogglePinMessage}
              onOpenCall={(type) => handleStartCall(type)}
              onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
              onSelectImage={(url) => setActiveLightboxImage(url)}
              onOpenPollModal={() => setIsPollModalOpen(true)}
              lang={user.language}
            />

            {/* Right Information Panel */}
            <ChatInfoPanel
              conversation={activeConversation}
              messages={activeChatMessages}
              contacts={contacts}
              isOpen={isInfoOpen}
              onClose={() => setIsInfoOpen(false)}
              onToggleMute={handleToggleMute}
              onTogglePin={handleTogglePinConversation}
              onClearHistory={handleClearHistory}
              onSelectImage={(url) => setActiveLightboxImage(url)}
              onChangeWallpaper={handleChangeWallpaper}
              onAddMemberToGroup={() => setIsCreateGroupOpen(true)}
              lang={user.language}
            />
          </div>
        )}

        {/* Tab 2: Contacts / Danh bạ */}
        {currentTab === 'contacts' && (
          <ContactsView
            contacts={contacts}
            onSelectContact={handleSelectContactToChat}
            onOpenCall={(contact, type) => handleStartCall(type, contact.name, contact.avatar)}
            onOpenAddFriend={() => setIsAddFriendOpen(true)}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            lang={user.language}
          />
        )}

        {/* Tab 3: Moments / Nhật ký */}
        {currentTab === 'moments' && (
          <MomentsView
            moments={moments}
            currentUser={user}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onSelectImage={(url) => setActiveLightboxImage(url)}
            lang={user.language}
          />
        )}

        {/* Tab 4: Cloud của tôi */}
        {currentTab === 'cloud' && (
          <CloudView
            items={cloudItems}
            onAddItem={handleAddCloudItem}
            onDeleteItem={handleDeleteCloudItem}
            lang={user.language}
          />
        )}
      </div>

      {/* Global Modals */}
      <CallModal
        type={callState.type}
        contactName={callState.name}
        contactAvatar={callState.avatar}
        isOpen={callState.isOpen}
        onClose={() => setCallState({ ...callState, isOpen: false })}
        lang={user.language}
      />

      <PollModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onSubmit={handleCreatePoll}
        lang={user.language}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        contacts={contacts}
        onCreate={handleCreateGroup}
        lang={user.language}
      />

      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onAdd={handleAddFriend}
        lang={user.language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        lang={user.language}
        onLanguageChange={(newLang) => setUser((prev) => ({ ...prev, language: newLang }))}
      />

      <ImageViewerModal
        imageUrl={activeLightboxImage}
        onClose={() => setActiveLightboxImage(null)}
      />
    </div>
  );
}
