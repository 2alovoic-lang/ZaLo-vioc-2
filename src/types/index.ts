export type Language = 'ar' | 'dz' | 'fr' | 'en' | 'vi';

export type MessageStatus = 'sent' | 'delivered' | 'seen';

export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'sticker' | 'poll';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

export interface PollData {
  question: string;
  options: PollOption[];
  multiChoice?: boolean;
  totalVotes?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  voiceDuration?: number;
  stickerIcon?: string;
  poll?: PollData;
  reactions?: Record<string, number>;
  isPinned?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  phone: string;
  bio: string;
  category: 'work' | 'friends' | 'family' | 'customer';
  isOfficialAccount?: boolean;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  members: string[]; // user IDs
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
    type?: MessageType;
  };
  pinnedMessage?: string;
  category: 'all' | 'work' | 'friends' | 'family' | 'customer';
  isPinned?: boolean;
  isMuted?: boolean;
  wallpaper?: string;
}

export interface MomentPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  images: string[];
  likes: {
    count: number;
    hasLiked: boolean;
    reaction: string;
  };
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
  }[];
}

export interface CloudItem {
  id: string;
  type: 'note' | 'file' | 'image' | 'link';
  title: string;
  content: string;
  timestamp: string;
  size?: string;
  url?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  status: string;
  language: Language;
  soundEnabled: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
}
