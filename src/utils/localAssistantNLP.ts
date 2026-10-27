/**
 * Local Client-Side NLP Engine for ZaLoVoice
 * Enables 100% functionality on static hosts (GitHub Pages, Vercel Static)
 * and offline/network failure scenarios.
 */

export interface LocalNLPResult {
  intent: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'booking' | 'more_services' | 'chat';
  reply: string;
  speechText: string;
  actionType: 'navigate_to_tab' | 'show_results' | 'none';
  targetTab: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'bookings' | 'more_services' | 'home';
  parameters: {
    wilaya?: string;
    searchQuery?: string;
    subject?: string;
  };
  citations?: {
    title: string;
    authorOrPublisher: string;
    year: string;
  }[];
  isAiLive: boolean;
  provider: string;
}

export const processLocalNLP = (
  rawMessage: string,
  currentWilaya: string = 'الجزائر العاصمة'
): LocalNLPResult => {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();

  // Extract Wilaya if present
  let wilaya = currentWilaya;
  if (lower.includes('وهران') || lower.includes('oran')) wilaya = 'وهران (31)';
  else if (lower.includes('قسنطينة') || lower.includes('constantine')) wilaya = 'قسنطينة (25)';
  else if (lower.includes('سطيف') || lower.includes('setif')) wilaya = 'سطيف (19)';
  else if (lower.includes('عنابة') || lower.includes('annaba')) wilaya = 'عنابة (23)';
  else if (lower.includes('البليدة') || lower.includes('blida')) wilaya = 'البليدة (09)';
  else if (lower.includes('تيزي') || lower.includes('tizi')) wilaya = 'تيزي وزو (15)';
  else if (lower.includes('بجاية') || lower.includes('bejaia')) wilaya = 'بجاية (06)';
  else if (lower.includes('باتنة') || lower.includes('batna')) wilaya = 'باتنة (05)';
  else if (lower.includes('تلمسان') || lower.includes('tlemcen')) wilaya = 'تلمسان (13)';

  // 1. Greetings (التحية والترحيب)
  if (
    lower.includes('السلام عليكم') ||
    lower.includes('سلام عليكم') ||
    lower === 'سلام' ||
    lower.startsWith('سلام ') ||
    lower.includes('صباح الخير') ||
    lower.includes('مساء الخير') ||
    lower.includes('bonjour') ||
    lower.includes('bonsoir') ||
    lower.includes('hello') ||
    lower.includes('hi')
  ) {
    return {
      intent: 'chat',
      reply: `وعليكم السلام ورحمة الله وبركاته! مرحباً بك في ZaLoVoice. أنا مساعدك الصوتي الذكي في الجزائر والعالم. كيف يمكنني مساعدتك اليوم؟ (بحث أكاديمي، استئجار أو شراء سكن، طلب طاكسي، تسوق وتجارة، مطاعم، أو حجوزات).`,
      speechText: `وعليكم السلام ورحمة الله وبركاته، مرحباً بك في زالوفويس. كيف يمكنني خدمتك اليوم؟`,
      actionType: 'none',
      targetTab: 'home',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 2. Status check / Small talk (واش راك / كيف الحال / لاباس)
  if (
    lower.includes('كيف الحال') ||
    lower.includes('كيف حالك') ||
    lower.includes('واش راك') ||
    lower.includes('واش حوالك') ||
    lower.includes('لاباس') ||
    lower.includes('ça va') ||
    lower.includes('cava') ||
    lower.includes('how are you')
  ) {
    return {
      intent: 'chat',
      reply: `الحمد لله، بأفضل حال وبكامل الجاهزية لخدمتك! شكراً لسؤالك اللطيف. هل تبحث عن شيء محدد اليوم؟ يمكنك سؤالي عن الدروس الأكاديمية (مثل قوانين الفيزياء)، أو طلب سيارة أجرة، أو استكشاف الشقق والمنتجات والمطاعم.`,
      speechText: `الحمد لله بخير وفي خدمتك دائماً! ماذا تحب أن ننجز معاً؟`,
      actionType: 'none',
      targetTab: 'home',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 3. Identity (من أنت / شكون نتا)
  if (
    lower.includes('من انت') ||
    lower.includes('من أنت') ||
    lower.includes('شكون انت') ||
    lower.includes('شكون نتا') ||
    lower.includes('عرف بنفسك') ||
    lower.includes('qui es-tu') ||
    lower.includes('who are you')
  ) {
    return {
      intent: 'chat',
      reply: `أنا ZaLoVoice، مساعدك الصوتي والذكي الشامل، مصمم لخدمة المجتمع الجزائري والعالم، مع دعم فائق للغة العربية الفصحى، الدارجة الجزائرية، الفرنسية والإنجليزية، وموجّه بشكل خاص للمكفوفين وأصحاب الهمم لتمكينهم من الوصول لكل الخدمات بالصوت.`,
      speechText: `أنا زالوفويس، مساعدك الصوتي والذكي الشامل المتاح للجميع بالصوت والنص.`,
      actionType: 'none',
      targetTab: 'home',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 4. Gratitude (شكراً / يعطيك الصحة)
  if (
    lower.includes('شكرا') ||
    lower.includes('شكراً') ||
    lower.includes('يعطيك الصحة') ||
    lower.includes('بارك الله فيك') ||
    lower.includes('merci') ||
    lower.includes('thank')
  ) {
    return {
      intent: 'chat',
      reply: `العفو، وفيك بارك الله! يسعدني دائماً تقديم أفضل تجربة صوتية وذكية لك على تطبيق ZaLoVoice. لا تتردد في سؤالي في أي وقت.`,
      speechText: `العفو، سررت بخدمتك! أنا هنا دائماً لمساعدتك.`,
      actionType: 'none',
      targetTab: 'home',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 5. Academic & Lessons (البحث الأكاديمي والدروس)
  if (
    lower.includes('نيوتن') ||
    lower.includes('فيزياء') ||
    lower.includes('درس') ||
    lower.includes('اشرح') ||
    lower.includes('شرح') ||
    lower.includes('قانون') ||
    lower.includes('رياضيات') ||
    lower.includes('معادلة') ||
    lower.includes('تركيب ضوئي') ||
    lower.includes('خوارزمية') ||
    lower.includes('أكاديمي') ||
    lower.includes('تاريخ') ||
    lower.includes('الصومام') ||
    lower.includes('science') ||
    lower.includes('explain') ||
    lower.includes('physics')
  ) {
    const isNewton = lower.includes('نيوتن') || lower.includes('newton');
    return {
      intent: 'academic',
      reply: isNewton
        ? `قانون نيوتن الثاني في الميكانيكا الكلاسيكية (المبدأ الأساسي للتحريك):\n\n∑F = m · a\n\n• ينص على أن: المجموع الشعاعي للقوى الخارجية المؤثرة على نقطة مادية يساوي جداء كتلتها في شعاع تسارعها.\n• الوحدة الدولية: القوة بالنيوتن (N)، الكتلة بالكيلوغرام (kg)، والتسارع بالمتر على الثانية مربعة (m/s²).\n• يُطبق في المراجع الغاليلية (العطالية)، وهو من الركائز الأساسية لشهادة البكالوريا في مادة العلوم الفيزيائية.`
        : `قمت بفتح قسم البحث الأكاديمي في ZaLoVoice بناءً على طلبك الدراسي. يمكنك الآن تصفح الدروس المشروحة والملخصات المعتمدة مع المراجع الرسمية.`,
      speechText: isNewton
        ? `قانون نيوتن الثاني ينص على أن مجموع القوى المؤثرة على جسم يساوي كتلته مضروبة في تسارعه. وقد فتحت لك الملخص الأكاديمي الكامل.`
        : `فتحت لك قسم البحث الأكاديمي والدروس المعتمدة في تخصصك.`,
      actionType: 'navigate_to_tab',
      targetTab: 'academic',
      parameters: {
        searchQuery: message,
        subject: isNewton ? 'فيزياء' : 'أكاديمي',
        wilaya,
      },
      citations: [
        {
          title: 'منهاج العلوم الفيزيائية - الطور الثانوي',
          authorOrPublisher: 'وزارة التربية الوطنية الجزائرية',
          year: '2024',
        },
        {
          title: 'Philosophiae Naturalis Principia Mathematica',
          authorOrPublisher: 'Isaac Newton',
          year: '1687',
        },
      ],
      isAiLive: false,
      provider: 'محرك ZaLoVoice الأكاديمي المدمج',
    };
  }

  // 6. Real Estate (العقارات والسكن)
  if (
    lower.includes('كراء') ||
    lower.includes('دار') ||
    lower.includes('شقة') ||
    lower.includes('سكن') ||
    lower.includes('عقار') ||
    lower.includes('louer') ||
    lower.includes('appartement') ||
    lower.includes('maison')
  ) {
    return {
      intent: 'real_estate',
      reply: `مرحباً بك! قمت بفتح قسم العقارات والسكن في ${wilaya}. ستجد شققاً للإيجار (F2، F3، F4)، ومنازل للبيع بأسعار موثقة بالدينار الجزائري وتواصل مباشر مع أصحاب العقارات.`,
      speechText: `فتحت لك عروض العقارات والشقق المتوفرة في ${wilaya}.`,
      actionType: 'navigate_to_tab',
      targetTab: 'real_estate',
      parameters: { wilaya, searchQuery: 'شقة للكراء' },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 7. Taxi / Ride Hailing (النقل وسيارات الأجرة)
  if (
    lower.includes('طاكسي') ||
    lower.includes('taxi') ||
    lower.includes('vtc') ||
    lower.includes('توصيلة') ||
    lower.includes('مطار') ||
    lower.includes('course')
  ) {
    return {
      intent: 'taxi',
      reply: `أهلاً بك! تم فتح خدمة طلب سيارات الأجرة ونقل الأفراد في ZaLoVoice. يمكنك تحديد موقعك ووجهتك ومعرفة الأجرة التقديرية بالدينار الجزائري وحجز السائق فوراً.`,
      speechText: `خدمة سيارات الأجرة جاهزة، حدد وجهتك لحساب المسافة والأجرة بالدينار.`,
      actionType: 'navigate_to_tab',
      targetTab: 'taxi',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 8. Commerce / Shopping (التجارة والتسوق)
  if (
    lower.includes('شراء') ||
    lower.includes('نشري') ||
    lower.includes('سعر') ||
    lower.includes('بيع') ||
    lower.includes('منتج') ||
    lower.includes('هاتف') ||
    lower.includes('بيسي') ||
    lower.includes('prix') ||
    lower.includes('acheter')
  ) {
    return {
      intent: 'commerce',
      reply: `يسعدني مساعدتك في التسوق عبر ZaLoVoice! قمت بتوجيهك لسوق المنتجات والأجهزة الإلكترونية بأسعار تنافسية بالدينار الجزائري مع ضمان التوصيل والدفع عند الاستلام عبر 58 ولاية.`,
      speechText: `فتحت لك سوق المنتجات والأسعار المتاحة مع التوصيل لثمانية وخمسين ولاية.`,
      actionType: 'navigate_to_tab',
      targetTab: 'commerce',
      parameters: {
        wilaya,
        searchQuery: message.replace(/(شراء|نشري|بكم|سعر|ابحث لي عن)/g, '').trim(),
      },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 9. Food & Restaurants (المطاعم والوجبات)
  if (
    lower.includes('مطعم') ||
    lower.includes('اكل') ||
    lower.includes('ناكل') ||
    lower.includes('كسكس') ||
    lower.includes('شخشوخة') ||
    lower.includes('قرنطيطة') ||
    lower.includes('رشتة') ||
    lower.includes('بيتزا') ||
    lower.includes('restaurant') ||
    lower.includes('manger')
  ) {
    return {
      intent: 'food',
      reply: `أشهى الأطباق الجزائرية التقليدية والعصرية متاحة عبر ZaLoVoice! قمت بفتح قسم المطاعم لتختار وجبتك المفضلة (كسكسي، شخشوخة، بيتزا) مع خدمة التوصيل السريع.`,
      speechText: `تفضل بقائمة المطاعم وألذ الأطباق المتوفرة في منطقتك.`,
      actionType: 'navigate_to_tab',
      targetTab: 'food',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 10. Bookings (الحجوزات والمواعيد)
  if (
    lower.includes('حجز') ||
    lower.includes('طبيب') ||
    lower.includes('فندق') ||
    lower.includes('موعد') ||
    lower.includes('عيادة') ||
    lower.includes('rendez-vous') ||
    lower.includes('hotel')
  ) {
    return {
      intent: 'booking',
      reply: `فتحت لك قسم الحجوزات والمواعيد في ZaLoVoice. يمكنك أخذ موعد مع الأطباء، العيادات، الفنادق أو الحرفيين المعتمدين بسهولة.`,
      speechText: `قسم الحجوزات والمواعيد مفتوح أمامك الآن لاختيار الموعد المناسب.`,
      actionType: 'navigate_to_tab',
      targetTab: 'bookings',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // 11. More Services (خدمات أخرى)
  if (
    lower.includes('خدمات أخرى') ||
    lower.includes('خدمات اضافية') ||
    lower.includes('صيدلية') ||
    lower.includes('صيدليات') ||
    lower.includes('تبرع بالدم') ||
    lower.includes('تكوين مهني') ||
    lower.includes('سياحة') ||
    lower.includes('وظائف') ||
    lower.includes('عمل') ||
    lower.includes('emploi') ||
    lower.includes('وثائق') ||
    lower.includes('صرف')
  ) {
    return {
      intent: 'more_services',
      reply: `فتحت لك قسم «خدمات أخرى» في ZaLoVoice، وهو السجل الموحد للخدمات الإضافية المتاحة وقيد التطوير (صيدليات الحراسة، التبرع بالدم، السياحة، والوظائف) مع تفعيل التنبيهات الفورية.`,
      speechText: `تفضل بالاطلاع على قسم خدمات أخرى الموحد.`,
      actionType: 'navigate_to_tab',
      targetTab: 'more_services',
      parameters: { wilaya },
      isAiLive: false,
      provider: 'محرك ZaLoVoice الذكي المدمج',
    };
  }

  // Default Fallback
  return {
    intent: 'chat',
    reply: `مرحباً بك! تلقيت طلبك: "${message}". أنا مساعد ZaLoVoice الذكي، يمكنني مساعدتك في: البحث الأكاديمي، العقارات، سيارات الأجرة، التسوق، المطاعم، والحجوزات. اختر ما يناسبك أو أخبرني بصوتك وسأوجهك فوراً.`,
    speechText: `أهلاً بك، فهمت طلبك وأنا جاهز لتوجيهك لأي خدمة أو البحث في الدروس الأكاديمية.`,
    actionType: 'none',
    targetTab: 'home',
    parameters: { wilaya, searchQuery: message },
    isAiLive: false,
    provider: 'محرك ZaLoVoice الذكي المدمج',
  };
};
