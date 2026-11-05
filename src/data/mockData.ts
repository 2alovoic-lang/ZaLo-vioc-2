import { UserProfile, Contact, Conversation, Message, MomentPost, CloudItem } from '../types';

export const currentUser: UserProfile = {
  id: 'user_main',
  name: 'مستخدم ZaLoVoice',
  email: '',
  phone: '',
  bio: 'مساعد البحث والخدمات الصوتي',
  avatar: '',
  status: 'online',
  language: 'ar',
  soundEnabled: true,
  pinLockEnabled: false,
  pinCode: '',
};

export const initialContacts: Contact[] = [];

export const initialConversations: Conversation[] = [];

export const initialMessages: Record<string, Message[]> = {};

export const initialMoments: MomentPost[] = [];

export const initialCloudItems: CloudItem[] = [];

export const STICKER_LIST = [
  { id: 'stk_1', icon: '❤️', label: 'حب' },
  { id: 'stk_2', icon: '🎉', label: 'احتفال' },
  { id: 'stk_3', icon: '🔥', label: 'حماس' },
  { id: 'stk_4', icon: '🚀', label: 'انطلاق' },
  { id: 'stk_5', icon: '✨', label: 'بريق' },
  { id: 'stk_6', icon: '☕', label: 'قهوة' },
  { id: 'stk_7', icon: '👏', label: 'تصفيق' },
  { id: 'stk_8', icon: '🤩', label: 'إعجاب' },
  { id: 'stk_9', icon: '🥳', label: 'حفلة' },
  { id: 'stk_10', icon: '💪', label: 'تشجيع' },
  { id: 'stk_11', icon: '💯', label: 'ممتاز' },
  { id: 'stk_12', icon: '🌸', label: 'زهرة' },
];

export const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];
