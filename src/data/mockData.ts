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
  { id: 'stk_1', icon: '❤️', label: 'Yêu thương' },
  { id: 'stk_2', icon: '🎉', label: 'Ăn mừng' },
  { id: 'stk_3', icon: '🔥', label: 'Nhiệt huyết' },
  { id: 'stk_4', icon: '🚀', label: 'Tăng tốc' },
  { id: 'stk_5', icon: '✨', label: 'Lấp lánh' },
  { id: 'stk_6', icon: '☕', label: 'Cà phê' },
  { id: 'stk_7', icon: '👏', label: 'Vỗ tay' },
  { id: 'stk_8', icon: '🤩', label: 'Thích thú' },
  { id: 'stk_9', icon: '🥳', label: 'Party' },
  { id: 'stk_10', icon: '💪', label: 'Cố lên' },
  { id: 'stk_11', icon: '💯', label: 'Xuất sắc' },
  { id: 'stk_12', icon: '🌸', label: 'Hoa sen' },
];

export const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '😡'];
