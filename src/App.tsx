import React, { useState, useEffect, useRef } from 'react';
import {
  currentUser as defaultUser,
  initialContacts,
  initialConversations,
  initialMessages,
  initialMoments,
  initialCloudItems,
} from './data/mockData';
import {
  INITIAL_PRODUCTS,
  INITIAL_REAL_ESTATE,
  INITIAL_RESTAURANTS,
  INITIAL_BOOKINGS,
  ALGERIAN_WILAYAS,
} from './data/algeriaData';
import { INITIAL_ACADEMIC_TOPICS } from './data/academicData';
import {
  UserProfile,
  Conversation,
  Message,
  Contact,
  MomentPost,
  CloudItem,
  Language,
  MessageType,
} from './types';
import {
  MarketProduct,
  RealEstateListing,
  Restaurant,
  BookingService,
  AcademicTopic,
  AccessibilitySettings,
} from './types/algeria';

// Existing Chat & Social Components
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

// ZaLoVoice Mobile Super-App Components
import { AndroidFrame } from './components/AndroidFrame';
import { HomeVoiceView } from './components/HomeVoiceView';
import { AcademicSection } from './components/AcademicSection';
import { AccessibilityModal } from './components/AccessibilityModal';
import { MenuDrawer } from './components/MenuDrawer';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { CommerceSection } from './components/CommerceSection';
import { RealEstateSection } from './components/RealEstateSection';
import { TaxiSection } from './components/TaxiSection';
import { RestaurantsSection } from './components/RestaurantsSection';
import { BookingsSection } from './components/BookingsSection';
import { IntegrationStatusModal } from './components/IntegrationStatusModal';
import { MoreServicesSection } from './components/MoreServicesSection';
import { speakWithFullVoice, stopSpeaking, unlockAudio } from './utils/speechManager';

// Icons
import {
  Home,
  Compass,
  Star,
  Bell,
  User,
  MapPin,
  Sparkles,
  Settings,
  ChevronRight,
  Eye,
  CheckCircle,
  X,
  Volume2,
  Trash2,
  Mic,
  MessageCircle,
  LayoutGrid,
  MessageSquareMore,
} from 'lucide-react';

export default function App() {
  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zalovoice_user');
    return saved
      ? JSON.parse(saved)
      : {
          ...defaultUser,
          name: 'مستخدم ZaLoVoice (الجزائر)',
          phone: '+213 550 12 34 56',
          bio: 'مستخدم ZaLoVoice — المساعد الصوتي وإمكانية الوصول الشاملة',
        };
  });

  // Device Frame Viewport (Android Smartphone Mockup vs Full Screen)
  const [isMobileOnlyMode, setIsMobileOnlyMode] = useState<boolean>(() => {
    return window.innerWidth >= 768;
  });

  // Active Main View / Service
  const [currentServiceTab, setCurrentServiceTab] = useState<
    'home' | 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services'
  >('home');

  // Bottom Navigation Active Indicator
  const [bottomNavTab, setBottomNavTab] = useState<'home' | 'explore' | 'favorites' | 'notifications' | 'account'>('home');

  // Algerian Wilaya Context
  const [currentWilaya, setCurrentWilaya] = useState<string>('الجزائر العاصمة');

  // Universal Accessibility Settings
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('zalovoice_accessibility');
    return saved
      ? JSON.parse(saved)
      : {
          fontSize: 'normal',
          highContrast: false,
          screenReaderAnnounce: true,
          speechRate: 1.0,
          speechPitch: 1.0,
          reducedMotion: false,
          blindAssistanceMode: true,
        };
  });

  // Screen Reader Live Announcements
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>(
    'أهلاً بك في ZaLoVoice. المساعد الصوتي جاهز لمساعدتك.'
  );

  // Modals & Drawers
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [pendingAssistantQuery, setPendingAssistantQuery] = useState('');
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Assistant & Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Chat submodule state (when in 'chat' tab)
  const [chatCurrentTab, setChatCurrentTab] = useState<'messages' | 'contacts' | 'moments' | 'cloud'>('messages');
  const [activeConversationId, setActiveConversationId] = useState<string>('conv_lan');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Call & Group Modals
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

  // Core Data
  const [academicTopics] = useState<AcademicTopic[]>(INITIAL_ACADEMIC_TOPICS);

  const [products] = useState<MarketProduct[]>(() => {
    const saved = localStorage.getItem('zalovoice_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [realEstateListings] = useState<RealEstateListing[]>(() => {
    const saved = localStorage.getItem('zalovoice_real_estate');
    return saved ? JSON.parse(saved) : INITIAL_REAL_ESTATE;
  });

  const [restaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('zalovoice_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [bookings] = useState<BookingService[]>(() => {
    const saved = localStorage.getItem('zalovoice_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Favorites collection (saved items from real estate, commerce, academic)
  const [favorites, setFavorites] = useState<{ id: string; title: string; type: string; priceOrSubject: string }[]>(() => {
    const saved = localStorage.getItem('zalovoice_favorites');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'fav_1', title: 'شقة F3 مفروشة مطلة على البحر', type: 'عقارات', priceOrSubject: '65,000 دج/شهر' },
          { id: 'fav_2', title: 'قانون نيوتن الثاني للحركة', type: 'أكاديمي', priceOrSubject: 'فيزياء - بكالوريا' },
          { id: 'fav_3', title: 'Samsung Galaxy A55 5G', type: 'تجارة', priceOrSubject: '54,000 دج' },
        ];
  });

  // Notifications collection
  const [notifications, setNotifications] = useState<
    { id: string; title: string; message: string; time: string; read: boolean; type: 'info' | 'success' | 'alert' }[]
  >(() => {
    const saved = localStorage.getItem('zalovoice_notifications');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif_1',
            title: 'مرحباً بك في ZaLoVoice',
            message: 'تم تفعيل وضع إمكانية الوصول وقارئ الشاشة للمكفوفين بنجاح.',
            time: 'الآن',
            read: false,
            type: 'success',
          },
          {
            id: 'notif_2',
            title: 'تم حفظ ملخص قانون نيوتن',
            message: 'يمكنك مراجعة القوانين والمعادلات في أي وقت دون اتصال بالإنترنت.',
            time: 'منذ ساعتين',
            read: true,
            type: 'info',
          },
          {
            id: 'notif_3',
            title: 'عرض عقاري جديد في الجزائر العاصمة',
            message: 'تمت إضافة شقق جديدة للإيجار والبيع في حيدرة وباب الزوار.',
            time: 'أمس',
            read: true,
            type: 'info',
          },
        ];
  });

  // Chat data persistence
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zalovoice_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('zalovoice_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('zalovoice_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [moments] = useState<MomentPost[]>(() => {
    const saved = localStorage.getItem('zalovoice_moments');
    return saved ? JSON.parse(saved) : initialMoments;
  });

  const [cloudItems] = useState<CloudItem[]>(() => {
    const saved = localStorage.getItem('zalovoice_cloud');
    return saved ? JSON.parse(saved) : initialCloudItems;
  });

  // Synchronize accessibility settings to document body
  useEffect(() => {
    localStorage.setItem('zalovoice_accessibility', JSON.stringify(accessibilitySettings));

    // High contrast class
    if (accessibilitySettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Font scaling classes
    document.body.classList.remove('font-scale-large', 'font-scale-xlarge');
    if (accessibilitySettings.fontSize === 'large') {
      document.body.classList.add('font-scale-large');
    } else if (accessibilitySettings.fontSize === 'extralarge') {
      document.body.classList.add('font-scale-xlarge');
    }
  }, [accessibilitySettings]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('zalovoice_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('zalovoice_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('zalovoice_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zalovoice_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('zalovoice_messages', JSON.stringify(messages));
  }, [messages]);

  // Web Speech Synthesis (TTS) Helper using robust persistent voice engine
  const speakVoice = (text: string) => {
    speakWithFullVoice(text, {
      lang: user.language === 'en' ? 'en' : user.language === 'fr' ? 'fr' : 'ar',
      rate: accessibilitySettings.speechRate || 1.0,
      pitch: accessibilitySettings.speechPitch || 1.0,
    });
  };

  // Announce to Screen Readers (TalkBack / NVDA) + optional audio read
  const announceToScreenReader = (text: string, forceAudio: boolean = false) => {
    setAriaAnnouncement(text);
    const isSpeaking = typeof window !== 'undefined' && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
    if (!isSpeaking && (forceAudio || accessibilitySettings.screenReaderAnnounce || accessibilitySettings.blindAssistanceMode)) {
      speakVoice(text);
    }
  };

  // Setup Web Speech API STT for the home screen mic
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = user.language === 'en' ? 'en-US' : user.language === 'fr' ? 'fr-FR' : 'ar-DZ';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleVoiceQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [user.language]);

  const toggleHomeListening = () => {
    if (!recognitionRef.current) {
      announceToScreenReader('التعرف الصوتي غير مدعوم في متصفحك، تم فتح نافذة المساعد الذكي.');
      setIsVoiceAssistantOpen(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      announceToScreenReader('تم إيقاف الاستماع.');
    } else {
      try {
        stopSpeaking();
        recognitionRef.current.start();
        setIsListening(true);
        announceToScreenReader('أنا أستمع إليك الآن، تفضل بالتحدث.');
      } catch {
        setIsListening(false);
      }
    }
  };

  // Process voice or text query from home view
  const handleVoiceQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    setPendingAssistantQuery(queryText.trim());
    setIsVoiceAssistantOpen(true);
  };

  // Context-aware Action routing from AI Assistant
  const handleAssistantNavigate = (targetTab: string, params?: any) => {
    if (['home', 'academic', 'commerce', 'real_estate', 'taxi', 'food', 'bookings', 'chat', 'more_services'].includes(targetTab)) {
      setCurrentServiceTab(targetTab as any);
      setBottomNavTab('explore');
      announceToScreenReader(`تم الانتقال إلى قسم ${targetTab}`);
    }
    if (params?.wilaya) {
      setCurrentWilaya(params.wilaya);
    }
  };

  // Navigation from Home Service Grid & Drawer
  const handleSelectService = (
    service: 'home' | 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'chat' | 'more_services',
    forceAnnounce: boolean = false
  ) => {
    setCurrentServiceTab(service);
    const isSpeaking = typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking;

    if (service === 'home') {
      setBottomNavTab('home');
      if (!isSpeaking || forceAnnounce) {
        announceToScreenReader('أنت الآن في الصفحة الرئيسية لتطبيق ZaLoVoice.');
      }
    } else {
      setBottomNavTab('explore');
      const serviceNames: Record<string, string> = {
        academic: 'البحث الأكاديمي والتعليمي',
        commerce: 'التجارة والتسوق',
        real_estate: 'العقارات والسكن',
        taxi: 'طلب طاكسي',
        food: 'المطاعم والوجبات',
        bookings: 'الحجوزات والخدمات',
        chat: 'الرسائل والمحادثات',
        more_services: 'خدمات أخرى ومستقبلية',
      };
      if (!isSpeaking || forceAnnounce) {
        announceToScreenReader(`تم فتح قسم ${serviceNames[service] || service}`);
      }
    }
  };

  // Connecting with product seller directly via ZaLoVoice Chat
  const handleContactSeller = (product: MarketProduct) => {
    const convId = `conv_seller_${product.id}`;
    const existingConv = conversations.find((c) => c.id === convId);

    if (!existingConv) {
      const newConv: Conversation = {
        id: convId,
        isGroup: false,
        name: product.seller.name,
        avatar: '🛍️',
        members: [user.id, `seller_${product.id}`],
        unreadCount: 0,
        category: 'work',
        isPinned: true,
        lastMessage: {
          text: `مرحباً، أستفسر بخصوص: ${product.title} بسعر ${product.priceDzd.toLocaleString('fr-DZ')} دج`,
          timestamp: 'الآن',
          senderId: user.id,
        },
      };

      const introMsg: Message = {
        id: `msg_intro_${Date.now()}`,
        conversationId: convId,
        senderId: user.id,
        text: `السلام عليكم، أنا مهتم بشراء هذا المنتج:\n"${product.title}"\nالسعر: ${product.priceDzd.toLocaleString('fr-DZ')} دج\nالولاية: ${product.wilaya}`,
        timestamp: 'الآن',
        status: 'delivered',
        type: 'text',
      };

      setConversations([newConv, ...conversations]);
      setMessages((prev) => ({
        ...prev,
        [convId]: [introMsg],
      }));
    }

    setActiveConversationId(convId);
    setCurrentServiceTab('chat');
    setChatCurrentTab('messages');
    announceToScreenReader(`تم فتح محادثة مع البائع ${product.seller.name}`);
  };

  // Connecting with Real Estate Agent directly via ZaLoVoice Chat
  const handleContactAgent = (listing: RealEstateListing) => {
    const convId = `conv_re_${listing.id}`;
    const existingConv = conversations.find((c) => c.id === convId);

    if (!existingConv) {
      const newConv: Conversation = {
        id: convId,
        isGroup: false,
        name: listing.agent.name,
        avatar: '🏡',
        members: [user.id, `agent_${listing.id}`],
        unreadCount: 0,
        category: 'work',
        isPinned: true,
        lastMessage: {
          text: `استفسار عقاري: ${listing.title} في ${listing.wilaya}`,
          timestamp: 'الآن',
          senderId: user.id,
        },
      };

      const introMsg: Message = {
        id: `msg_intro_${Date.now()}`,
        conversationId: convId,
        senderId: user.id,
        text: `السلام عليكم، أود معاينة هذا العقار:\n"${listing.title}"\nالموقع: ${listing.wilaya} (${listing.commune})\nالسعر: ${listing.priceDzd.toLocaleString('fr-DZ')} دج`,
        timestamp: 'الآن',
        status: 'delivered',
        type: 'text',
      };

      setConversations([newConv, ...conversations]);
      setMessages((prev) => ({
        ...prev,
        [convId]: [introMsg],
      }));
    }

    setActiveConversationId(convId);
    setCurrentServiceTab('chat');
    setChatCurrentTab('messages');
    announceToScreenReader(`تم فتح محادثة مع الوكيل العقاري ${listing.agent.name}`);
  };

  // Active chat state
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeChatMessages = messages[activeConversationId] || [];

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
    const timestamp = new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

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

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              unreadCount: 0,
              lastMessage: {
                text: msgData.text || '[مرفق]',
                timestamp,
                senderId: user.id,
                type: msgData.type,
              },
            }
          : c
      )
    );
  };

  // Top header title based on current view
  const getSubServiceTitle = () => {
    switch (currentServiceTab) {
      case 'academic':
        return 'البحث الأكاديمي والتعليمي';
      case 'commerce':
        return 'سوق التجارة والمنتجات';
      case 'real_estate':
        return 'العقارات والسكن';
      case 'taxi':
        return 'خدمة سيارات الأجرة (طاكسي)';
      case 'food':
        return 'المطاعم والوجبات السريعة';
      case 'bookings':
        return 'الحجوزات والخدمات اليومية';
      case 'chat':
        return 'الرسائل والمحادثات';
      case 'more_services':
        return 'خدمات أخرى ومستقبلية';
      default:
        return 'ZaLoVoice';
    }
  };

  return (
    <AndroidFrame
      isMobileOnlyMode={isMobileOnlyMode}
      onToggleMode={() => setIsMobileOnlyMode(!isMobileOnlyMode)}
      appName="ZaLoVoice"
    >
      {/* Invisible Screen Reader Live Region for TalkBack / NVDA */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* PIN Lock Screen if locked */}
      {isAppLocked && (
        <PinLockScreen
          correctPin={user.pinCode || '1234'}
          onUnlock={() => {
            setIsAppLocked(false);
            announceToScreenReader('تم إلغاء قفل التطبيق بنجاح.');
          }}
          lang={user.language}
        />
      )}

      {/* Main ZaLoVoice Mobile Viewport */}
      <div
        className="w-full h-full flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden relative"
        dir={user.language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Top Header when inside sub-services (Home has its own built-in header matching mockup) */}
        {currentServiceTab !== 'home' && (
          <header className="h-14 bg-[#061722]/95 border-b border-cyan-500/20 text-white px-4 flex items-center justify-between shrink-0 shadow-lg shadow-cyan-950/40 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectService('home')}
                className="p-1.5 -mr-1.5 rounded-xl hover:bg-cyan-950/60 text-cyan-400 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer border border-cyan-500/20"
                title="الرجوع إلى الواجهة الرئيسية"
                aria-label="الرجوع إلى الواجهة الرئيسية"
              >
                <ChevronRight className="w-5 h-5" />
                <span>الرئيسية</span>
              </button>
              <span className="text-cyan-700">|</span>
              <h1 className="font-bold text-sm tracking-wide text-white truncate max-w-[150px]">
                {getSubServiceTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Wilaya Picker Shortcut */}
              <div className="flex items-center gap-1 bg-[#092230] border border-cyan-500/30 px-2 py-1 rounded-full text-[11px] font-medium text-cyan-200">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-[90px]">{currentWilaya}</span>
              </div>

              {/* Voice Assistant Shortcut */}
              <button
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                title="المساعد الصوتي"
                aria-label="فتح المساعد الصوتي"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Content Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col relative min-w-0">
          {/* 1. Official ZaLoVoice Home View (Matching exact user mockup) */}
          {currentServiceTab === 'home' && (
            <HomeVoiceView
              onNavigateToService={(service) => handleSelectService(service)}
              onVoiceTrigger={(customText) => {
                if (customText) {
                  handleVoiceQuery(customText);
                } else {
                  toggleHomeListening();
                }
              }}
              isListening={isListening}
              onToggleListening={toggleHomeListening}
              accessibilitySettings={accessibilitySettings}
              onUpdateAccessibility={(updated) =>
                setAccessibilitySettings((prev) => ({ ...prev, ...updated }))
              }
              onOpenAccessibilityModal={() => setIsAccessibilityModalOpen(true)}
              currentLanguage={user.language}
              onChangeLanguage={(lang) => setUser((prev) => ({ ...prev, language: lang as Language }))}
              currentWilaya={currentWilaya}
              onOpenMenuDrawer={() => setIsMenuDrawerOpen(true)}
            />
          )}

          {/* 2. Academic & Educational Research Section */}
          {currentServiceTab === 'academic' && (
            <AcademicSection
              topics={academicTopics}
              onAskAcademicQuestion={(question) => {
                setIsVoiceAssistantOpen(true);
              }}
              onSpeakText={(text) => speakVoice(text)}
              lang={user.language}
            />
          )}

          {/* 3. Commerce & Marketplace */}
          {currentServiceTab === 'commerce' && (
            <CommerceSection
              products={products}
              onContactSeller={handleContactSeller}
              selectedWilaya={currentWilaya}
              onWilayaChange={(w) => setCurrentWilaya(w)}
            />
          )}

          {/* 4. Real Estate Listings */}
          {currentServiceTab === 'real_estate' && (
            <RealEstateSection
              listings={realEstateListings}
              onContactAgent={handleContactAgent}
              selectedWilaya={currentWilaya}
              onWilayaChange={(w) => setCurrentWilaya(w)}
            />
          )}

          {/* 5. Taxi Ride Booking */}
          {currentServiceTab === 'taxi' && (
            <TaxiSection currentWilaya={currentWilaya} />
          )}

          {/* 6. Restaurants & Food */}
          {currentServiceTab === 'food' && (
            <RestaurantsSection
              restaurants={restaurants}
              selectedWilaya={currentWilaya}
              onWilayaChange={(w) => setCurrentWilaya(w)}
            />
          )}

          {/* 7. Bookings & Services */}
          {currentServiceTab === 'bookings' && (
            <BookingsSection
              bookings={bookings}
              selectedWilaya={currentWilaya}
              onWilayaChange={(w) => setCurrentWilaya(w)}
            />
          )}

          {/* 8. Full Integrated Chat & Social Layer */}
          {currentServiceTab === 'chat' && (
            <div className="w-full h-full flex overflow-hidden">
              <Sidebar
                currentTab={chatCurrentTab}
                onTabChange={(tab) => setChatCurrentTab(tab)}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => {
                  setActiveConversationId(id);
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

              {chatCurrentTab === 'messages' && (
                <div className="flex-1 h-full flex overflow-hidden min-w-0">
                  <ChatArea
                    conversation={activeConversation}
                    messages={activeChatMessages}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    onVotePoll={() => {}}
                    onReactMessage={() => {}}
                    onDeleteMessage={() => {}}
                    onTogglePinMessage={() => {}}
                    onOpenCall={(type) =>
                      setCallState({
                        isOpen: true,
                        type,
                        name: activeConversation.name,
                        avatar: activeConversation.avatar,
                      })
                    }
                    onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
                    onSelectImage={(url) => setActiveLightboxImage(url)}
                    onOpenPollModal={() => setIsPollModalOpen(true)}
                    lang={user.language}
                  />

                  <ChatInfoPanel
                    conversation={activeConversation}
                    messages={activeChatMessages}
                    contacts={contacts}
                    isOpen={isInfoOpen}
                    onClose={() => setIsInfoOpen(false)}
                    onToggleMute={() => {}}
                    onTogglePin={() => {}}
                    onClearHistory={() => {}}
                    onSelectImage={(url) => setActiveLightboxImage(url)}
                    onChangeWallpaper={() => {}}
                    lang={user.language}
                  />
                </div>
              )}

              {chatCurrentTab === 'contacts' && (
                <ContactsView
                  contacts={contacts}
                  onSelectContact={(c) => {
                    const conv = conversations.find((cv) => cv.members.includes(c.id));
                    if (conv) setActiveConversationId(conv.id);
                    setChatCurrentTab('messages');
                  }}
                  onOpenCall={(c, type) =>
                    setCallState({
                      isOpen: true,
                      type,
                      name: c.name,
                      avatar: c.avatar,
                    })
                  }
                  onOpenAddFriend={() => setIsAddFriendOpen(true)}
                  onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                  lang={user.language}
                />
              )}

              {chatCurrentTab === 'moments' && (
                <MomentsView
                  moments={moments}
                  currentUser={user}
                  onAddPost={() => {}}
                  onLikePost={() => {}}
                  onAddComment={() => {}}
                  onSelectImage={(url) => setActiveLightboxImage(url)}
                  lang={user.language}
                />
              )}

              {chatCurrentTab === 'cloud' && (
                <CloudView
                  items={cloudItems}
                  onAddItem={() => {}}
                  onDeleteItem={() => {}}
                  lang={user.language}
                />
              )}
            </div>
          )}

          {/* 9. More Modular Services Section */}
          {currentServiceTab === 'more_services' && (
            <MoreServicesSection
              onOpenServiceTab={(tab) => handleSelectService(tab)}
              onSpeakText={(text) => speakVoice(text)}
              lang={user.language}
              currentWilaya={currentWilaya}
            />
          )}
        </div>

        {/* Floating Voice Assistant Trigger when navigating in sub-services */}
        {currentServiceTab !== 'home' && (
          <div className="absolute bottom-20 left-4 z-40">
            <button
              onClick={() => {
                unlockAudio();
                setIsVoiceAssistantOpen(true);
              }}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-300 to-sky-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/60 font-bold"
              title="تحدث مع مساعد ZaLoVoice"
              aria-label="تحدث مع مساعد ZaLoVoice"
            >
              <Mic className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Floating Glass Dock Bottom Navigation Bar (Exact Match with Reference Mockup) */}
        <nav
          className="absolute bottom-2.5 inset-x-3 h-[68px] bg-[#031326]/85 backdrop-blur-xl border border-cyan-500/25 rounded-[32px] px-2 flex items-center justify-around z-30 text-[11px] font-medium shadow-[0_10px_35px_rgba(0,10,30,0.85),0_0_20px_rgba(0,229,255,0.12)]"
          role="navigation"
          aria-label="شريط التنقل السفلي"
        >
          {/* 1. الرئيسية (Home) */}
          <button
            onClick={() => {
              handleSelectService('home');
              setBottomNavTab('home');
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer group"
            aria-label="الرئيسية"
          >
            <Home
              className={`w-6 h-6 transition-all duration-200 ${
                currentServiceTab === 'home' && bottomNavTab === 'home'
                  ? 'text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff] scale-105 stroke-[2.2]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200 stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] transition-colors ${
                currentServiceTab === 'home' && bottomNavTab === 'home'
                  ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200'
              }`}
            >
              الرئيسية
            </span>
            {currentServiceTab === 'home' && bottomNavTab === 'home' && (
              <span className="w-5 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] mt-0.5" />
            )}
          </button>

          {/* 2. الخدمات (Services) */}
          <button
            onClick={() => {
              handleSelectService('more_services');
              setBottomNavTab('explore');
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer group"
            aria-label="الخدمات"
          >
            <LayoutGrid
              className={`w-6 h-6 transition-all duration-200 ${
                currentServiceTab === 'more_services' && bottomNavTab === 'explore'
                  ? 'text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff] scale-105 stroke-[2.2]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200 stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] transition-colors ${
                currentServiceTab === 'more_services' && bottomNavTab === 'explore'
                  ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200'
              }`}
            >
              الخدمات
            </span>
            {currentServiceTab === 'more_services' && bottomNavTab === 'explore' && (
              <span className="w-5 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] mt-0.5" />
            )}
          </button>

          {/* 3. المحادثات (Chats) */}
          <button
            onClick={() => {
              handleSelectService('chat');
              setBottomNavTab('messages' as any);
              announceToScreenReader('قسم المحادثات والرسائل');
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer group"
            aria-label="المحادثات"
          >
            <MessageSquareMore
              className={`w-6 h-6 transition-all duration-200 ${
                currentServiceTab === 'chat'
                  ? 'text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff] scale-105 stroke-[2.2]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200 stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] transition-colors ${
                currentServiceTab === 'chat'
                  ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200'
              }`}
            >
              المحادثات
            </span>
            {currentServiceTab === 'chat' && (
              <span className="w-5 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] mt-0.5" />
            )}
          </button>

          {/* 4. الإخطارات (Notifications with distinct Red Dot) */}
          <button
            onClick={() => {
              setBottomNavTab('notifications');
              setIsNotificationsOpen(true);
              const unread = notifications.filter((n) => !n.read).length;
              announceToScreenReader(`قائمة الإخطارات، لديك ${unread} إخطارات جديدة غير مقروءة.`);
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer group relative"
            aria-label="الإخطارات"
          >
            <div className="relative">
              <Bell
                className={`w-6 h-6 transition-all duration-200 ${
                  bottomNavTab === 'notifications'
                    ? 'text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff] scale-105 stroke-[2.2]'
                    : 'text-[#7d99b3] group-hover:text-cyan-200 stroke-[1.8]'
                }`}
              />
              {/* Solid Red Dot matching screenshot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff334b] shadow-[0_0_6px_#ff334b]" />
            </div>
            <span
              className={`text-[11px] transition-colors ${
                bottomNavTab === 'notifications'
                  ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200'
              }`}
            >
              الإخطارات
            </span>
            {bottomNavTab === 'notifications' && (
              <span className="w-5 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] mt-0.5" />
            )}
          </button>

          {/* 5. الملف (Profile) */}
          <button
            onClick={() => {
              setBottomNavTab('account');
              setIsSettingsOpen(true);
              announceToScreenReader('الملف الشخصي وإعدادات المظهر');
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition-all cursor-pointer group"
            aria-label="الملف الشخصي"
          >
            <User
              className={`w-6 h-6 transition-all duration-200 ${
                bottomNavTab === 'account'
                  ? 'text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff] scale-105 stroke-[2.2]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200 stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[11px] transition-colors ${
                bottomNavTab === 'account'
                  ? 'text-[#00e5ff] font-bold drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                  : 'text-[#7d99b3] group-hover:text-cyan-200'
              }`}
            >
              الملف
            </span>
            {bottomNavTab === 'account' && (
              <span className="w-5 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff] mt-0.5" />
            )}
          </button>
        </nav>
      </div>

      {/* Menu Drawer (Hamburger Menu) */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onSelectService={(service) => {
          handleSelectService(service);
          setIsMenuDrawerOpen(false);
        }}
        onOpenAccessibility={() => {
          setIsMenuDrawerOpen(false);
          setIsAccessibilityModalOpen(true);
        }}
        onOpenSettings={() => {
          setIsMenuDrawerOpen(false);
          setIsSettingsOpen(true);
        }}
        onOpenIntegrations={() => {
          setIsMenuDrawerOpen(false);
          setIsIntegrationModalOpen(true);
        }}
        currentWilaya={currentWilaya}
        userPhone={user.phone}
      />

      {/* Accessibility Modal (For Blind & Low-Vision Users) */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        settings={accessibilitySettings}
        onUpdateSettings={(updated) => {
          setAccessibilitySettings((prev) => ({ ...prev, ...updated }));
          announceToScreenReader('تم تحديث إعدادات إمكانية الوصول بنجاح.');
        }}
        onTestVoice={() => {
          speakVoice('مرحباً بك في ZaLoVoice. تم ضبط سرعة ونبرة الصوت وفق تفضيلاتك بنجاح.');
        }}
      />

      {/* Favorites Modal */}
      {isFavoritesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="favorites-title"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 id="favorites-title" className="font-bold text-sm">العناصر المفضلة ({favorites.length})</h3>
              </div>
              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="إغلاق المفضلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2.5">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد عناصر محفوظة في المفضلة بعد.
                </div>
              ) : (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full">
                        {fav.type}
                      </span>
                      <h4 className="font-semibold text-xs text-white mt-1">{fav.title}</h4>
                      <p className="text-[11px] text-slate-400">{fav.priceOrSubject}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFavorites(favorites.filter((f) => f.id !== fav.id));
                        announceToScreenReader(`تم حذف ${fav.title} من المفضلة`);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400"
                      title="حذف من المفضلة"
                      aria-label={`حذف ${fav.title} من المفضلة`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-title"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 id="notif-title" className="font-bold text-sm">الإشعارات والتنبيهات</h3>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="إغلاق الإشعارات"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setNotifications(notifications.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    n.read
                      ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                      : 'bg-slate-800/90 border-cyan-500/30 text-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-400">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => {
          setIsVoiceAssistantOpen(false);
          setPendingAssistantQuery('');
        }}
        onNavigateToTab={handleAssistantNavigate}
        currentWilaya={currentWilaya}
        initialQuery={pendingAssistantQuery}
      />

      {/* Integration & Database Diagnostics Modal */}
      <IntegrationStatusModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        lang={user.language}
        onLanguageChange={(newLang) => setUser((prev) => ({ ...prev, language: newLang }))}
      />

      {/* Image Lightbox */}
      <ImageViewerModal
        imageUrl={activeLightboxImage}
        onClose={() => setActiveLightboxImage(null)}
      />

      {/* Call Modal */}
      <CallModal
        type={callState.type}
        contactName={callState.name}
        contactAvatar={callState.avatar}
        isOpen={callState.isOpen}
        onClose={() => setCallState({ ...callState, isOpen: false })}
        lang={user.language}
      />

      {/* Group & Friend Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        contacts={contacts}
        onCreate={(name, ids) => {
          const newConv: Conversation = {
            id: `grp_${Date.now()}`,
            isGroup: true,
            name,
            avatar: '👥',
            members: [user.id, ...ids],
            unreadCount: 0,
            category: 'work',
          };
          setConversations([newConv, ...conversations]);
          setActiveConversationId(newConv.id);
          setCurrentServiceTab('chat');
        }}
        lang={user.language}
      />

      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onAdd={(fr) => {
          const newContact: Contact = { ...fr, id: `c_${Date.now()}` };
          setContacts([newContact, ...contacts]);
        }}
        lang={user.language}
      />
    </AndroidFrame>
  );
}
