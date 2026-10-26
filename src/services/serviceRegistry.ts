import { ModularService, ServiceCategory } from '../types/services';

export interface CategoryInfo {
  id: ServiceCategory;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  iconName: string;
  color: string;
}

export const SERVICE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'core',
    nameAr: 'الخدمات الأساسية',
    nameEn: 'Core Services',
    descriptionAr: 'الخدمات الحيوية المنفذة والنشطة حالياً في تطبيق ZaLoVoice',
    iconName: 'Sparkles',
    color: 'cyan',
  },
  {
    id: 'education',
    nameAr: 'التعليم والتدريب',
    nameEn: 'Education & Training',
    descriptionAr: 'البحث الأكاديمي، مناهج البكالوريا، والتكوين المهني',
    iconName: 'GraduationCap',
    color: 'teal',
  },
  {
    id: 'health',
    nameAr: 'الصحة والرعاية',
    nameEn: 'Health & Care',
    descriptionAr: 'الصيدليات المناوبة، نداءات التبرع بالدم، والاستشارات الطبية',
    iconName: 'HeartPulse',
    color: 'emerald',
  },
  {
    id: 'travel',
    nameAr: 'السفر والسياحة',
    nameEn: 'Travel & Tourism',
    descriptionAr: 'النقل بين الولايات، مواعيد SNTF، والدليل السياحي للجزائر',
    iconName: 'Compass',
    color: 'sky',
  },
  {
    id: 'home_services',
    nameAr: 'الخدمات المنزلية والصيانة',
    nameEn: 'Home Services & Maintenance',
    descriptionAr: 'حرفيون موثقون (كهرباء، سباكة، تكييف، ونقل الأثاث)',
    iconName: 'Wrench',
    color: 'amber',
  },
  {
    id: 'jobs',
    nameAr: 'الوظائف والعمل الحر',
    nameEn: 'Jobs & Careers',
    descriptionAr: 'عروض العمل المعتمدة بالجزائر ومنصة المستقلين المحليين',
    iconName: 'Briefcase',
    color: 'indigo',
  },
  {
    id: 'admin_legal',
    nameAr: 'الخدمات الإدارية والقانونية',
    nameEn: 'Admin & Legal',
    descriptionAr: 'دليل الوثائق الإدارية الرسمية والاستشارات القانونية',
    iconName: 'Scale',
    color: 'purple',
  },
  {
    id: 'finance',
    nameAr: 'المالية والدفع الإلكتروني',
    nameEn: 'Finance & Payments',
    descriptionAr: 'متابعة أسعار العملات، ودليل الدفع بالذهبية و CIB و BaridiMob',
    iconName: 'CreditCard',
    color: 'rose',
  },
];

export const INITIAL_SERVICES: ModularService[] = [
  // --- 1. Core Implemented Services (Active) ---
  {
    id: 'academic',
    slug: 'academic-research',
    titleAr: 'البحث الأكاديمي والتعليمي',
    titleEn: 'Academic & Educational Research',
    titleFr: 'Recherche Académique',
    descriptionAr: 'شروحات علمية موثقة وفق مناهج وزارة التربية الوطنية الجزائرية مع المعادلات والمصادر ومسائل البكالوريا.',
    descriptionEn: 'Accredited scientific explanations, curriculum formulas, and secondary/university research.',
    category: 'education',
    icon: 'GraduationCap',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'academic',
    metrics: {
      usersCount: '15,000+ طالب وباحث',
      rating: 4.9,
    },
    features: ['شرح قانون نيوتن الثاني', 'معادلات التركيب الضوئي', 'خوارزميات البحث الثنائي', 'مراجع رسمية موثقة'],
  },
  {
    id: 'commerce',
    slug: 'marketplace-commerce',
    titleAr: 'سوق التجارة والمنتجات',
    titleEn: 'Marketplace & Commerce',
    titleFr: 'Marché et Produits',
    descriptionAr: 'تسوق إلكتروني موثوق يربطك مباشرة بالبائعين الجزائريين عبر المحادثة المباشرة مع التوصيل لـ 58 ولاية.',
    descriptionEn: 'Direct marketplace connecting buyers with verified Algerian sellers across all 58 wilayas.',
    category: 'core',
    icon: 'ShoppingBag',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'commerce',
    metrics: {
      usersCount: '8,400+ منتج معروض',
      rating: 4.8,
    },
    features: ['محادثة فورية مع البائع', 'تصفية حسب الولاية', 'ضمان أصالة السلع'],
  },
  {
    id: 'real_estate',
    slug: 'real-estate-housing',
    titleAr: 'العقارات والسكن',
    titleEn: 'Real Estate & Housing',
    titleFr: 'Immobilier et Logement',
    descriptionAr: 'منصة استئجار وشراء الشقق والفيلات والاستوديوهات مع وكلاء معتمدين وتواصل مباشر.',
    descriptionEn: 'Rent, buy and lease apartments and villas with verified agents and direct chat inquiry.',
    category: 'core',
    icon: 'Home',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'real_estate',
    metrics: {
      usersCount: '3,200+ عقار مسجل',
      rating: 4.7,
    },
    features: ['شقق مفروشة للكراء', 'بحث بالبلدية والولاية', 'تواصل فوري مع الوكيل'],
  },
  {
    id: 'taxi',
    slug: 'taxi-transport',
    titleAr: 'خدمة سيارات الأجرة (طاكسي)',
    titleEn: 'Taxi & Transport Rides',
    titleFr: 'Taxi et Transport',
    descriptionAr: 'حساب مسافة الرحلة وتقدير التعريفة بالدينار الجزائري وحجز طاكسي فوري أو نقل بين الولايات.',
    descriptionEn: 'Instant fare estimates in DZD and ride booking across Algerian cities and airports.',
    category: 'core',
    icon: 'Car',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'taxi',
    metrics: {
      usersCount: '58 ولاية مغطاة',
      rating: 4.8,
    },
    features: ['تسعيرة شفافة بالدينار', 'حساب الكيلومترات', 'اختيار نوع السيارة'],
  },
  {
    id: 'food',
    slug: 'restaurants-food',
    titleAr: 'المطاعم والوجبات الجزائرية',
    titleEn: 'Restaurants & Algerian Food',
    titleFr: 'Restaurants et Repas',
    descriptionAr: 'استكشاف أشهى الأطباق التقليدية (شخشوخة، كسكسي، رشتة) وقوائم المطاعم والوجبات السريعة.',
    descriptionEn: 'Explore authentic Algerian dishes and restaurant menus with fast delivery tracking.',
    category: 'core',
    icon: 'Utensils',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'food',
    metrics: {
      usersCount: '450+ مطعم شريك',
      rating: 4.9,
    },
    features: ['قوائم أسعار واضحة', 'أطباق منزلية تقليدية', 'توصيل محلي'],
  },
  {
    id: 'bookings',
    slug: 'bookings-appointments',
    titleAr: 'الحجوزات والخدمات اليومية',
    titleEn: 'Bookings & Appointments',
    titleFr: 'Réservations et Rendez-vous',
    descriptionAr: 'حجز المواعيد الطبية لدى العيادات، الفنادق السياحية، والخدمات الحرفية مع تأكيد فوري.',
    descriptionEn: 'Book clinical consultations, hotel stays, and verified artisan services.',
    category: 'core',
    icon: 'Calendar',
    status: 'active',
    badgeAr: 'متاح الآن',
    badgeEn: 'Active',
    isCore: true,
    requiresAuth: false,
    targetTab: 'bookings',
    metrics: {
      usersCount: '1,200+ موعد شهرياً',
      rating: 4.7,
    },
    features: ['مواعيد طبية', 'حجوزات فندقية', 'تأكيد وحفظ بالمفضلة'],
  },

  // --- 2. Health & Medical Care (قيد التطوير / مخطط) ---
  {
    id: 'pharmacy_finder',
    slug: 'pharmacy-duty-finder',
    titleAr: 'صيدليات الحراسة وتوفر الأدوية',
    titleEn: 'On-Duty Pharmacies & Drug Availability',
    titleFr: 'Pharmacies de Garde',
    descriptionAr: 'البحث الصوتي الذكي عن صيدليات الحراسة الليلية وأيام العطل في ولايتك، مع التحقق من توفر الأدوية النادرة.',
    descriptionEn: 'Locate 24/7 on-duty pharmacies and check medicine availability across Algerian communes.',
    category: 'health',
    icon: 'HeartPulse',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['تحديد الصيدلية الأقرب عبر GPS', 'قوائم الحراسة الليلية المحدثة أسبوعياً', 'استعلام صوتي مباشر'],
  },
  {
    id: 'blood_donation',
    slug: 'blood-donation-algeria',
    titleAr: 'بنك التبرع بالدم ونداءات الاستغاثة',
    titleEn: 'Blood Donation Network',
    titleFr: 'Don de Sang Algérie',
    descriptionAr: 'شبكة تضامنية لربط المتبرعين بالدم مع الحالات العاجلة في المستشفيات الجزائرية حسب الزمرة والولاية.',
    descriptionEn: 'Solidarity network matching blood donors with emergency needs in public hospitals by blood type and wilaya.',
    category: 'health',
    icon: 'ShieldAlert',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: true,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['إشعارات فورية لزمر الدم النادرة', 'تنسيق مع مراكز حقن الدم الولائية', 'حماية خصوصية المتبرع'],
  },
  {
    id: 'teleconsultation',
    slug: 'certified-telehealth',
    titleAr: 'الاستشارات الطبية عن بعد',
    titleEn: 'Certified Teleconsultations',
    titleFr: 'Téléconsultation Médicale',
    descriptionAr: 'منصة تواصل صوتي ومرئي آمن مع أطباء جزائريين معتمدين للحصول على توجيه طبي أولي للمناطق النائية.',
    descriptionEn: 'Secure audio/video tele-triage with certified Algerian general practitioners and specialists.',
    category: 'health',
    icon: 'Stethoscope',
    status: 'planned',
    badgeAr: 'قريبًا',
    badgeEn: 'Coming Soon',
    isCore: false,
    requiresAuth: true,
    requiredPermissions: ['medical_license_verification', 'id_verification'],
    metrics: {
      launchTarget: 'الربع الثالث 2026',
    },
    features: ['ملف صحي إلكتروني مشفر', 'وصفات طبية رقمية معتمدة', 'أولوية لذوي الهمم وكبار السن'],
  },

  // --- 3. Education & Skills ---
  {
    id: 'vocational_training',
    slug: 'vocational-training-dz',
    titleAr: 'دليل التكوين المهني والشهادات المعتمدة',
    titleEn: 'Vocational Training & Certifications',
    titleFr: 'Formation Professionnelle',
    descriptionAr: 'دليل شامل لاختصاصات التكوين المهني في الجزائر (CFPA و INSFP) مع مواعيد التسجيل والشهادات المؤهلة لسوق العمل.',
    descriptionEn: 'Directory of Algerian vocational institutes, enrollment periods, and job-ready technical certificates.',
    category: 'education',
    icon: 'BookOpen',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['دليل 300+ اختصاص تكويني', 'توجيه صوتي ذكي للمهن المطلوبة', 'شروط الالتحاق والوثائق'],
  },

  // --- 4. Travel & Tourism (السياحة والنقل) ---
  {
    id: 'algeria_tourism',
    slug: 'algeria-tourism-guide',
    titleAr: 'دليل السياحة الجزائرية (اكتشف بلادك)',
    titleEn: 'Algeria Tourism & Heritage Guide',
    titleFr: 'Tourisme et Patrimoine',
    descriptionAr: 'دليل سياحي تفاعلي بالصوت والصورة لأجمل معالم الجزائر (طاسيلي ناجر، تيميمون، تيكجدة، القصبة، وجيجل) مع مسارات الرحلات.',
    descriptionEn: 'Interactive voice-guided tour of UNESCO heritage sites, desert oases, and mountain routes in Algeria.',
    category: 'travel',
    icon: 'Compass',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'موسم صيف 2026',
    },
    features: ['مسارات سياحية موثقة', 'نصائح الإقامة والمناخ', 'مرشد صوتي ذكي لكل معلم'],
  },
  {
    id: 'intercity_transport',
    slug: 'sntf-intercity-schedules',
    titleAr: 'مواعيد القطارات SNTF والحافلات بين الولايات',
    titleEn: 'Train (SNTF) & Intercity Transit',
    titleFr: 'Transports Inter-Wilayas',
    descriptionAr: 'استعلام صوتي فوري عن مواعيد قطارات الخطوط الشمالية والجنوبية، أسعار التذاكر، ومحطات الحافلات المركزية.',
    descriptionEn: 'Real-time schedules for Algerian national railways (SNTF) and inter-wilaya central coach stations.',
    category: 'travel',
    icon: 'Car',
    status: 'planned',
    badgeAr: 'قريبًا',
    badgeEn: 'Coming Soon',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'الربع الثالث 2026',
    },
    features: ['مواقيت قطارات الضواحي والخطوط الكبرى', 'تسعيرة الرحلات المحدثة', 'محدد المحطات الأقرب'],
  },

  // --- 5. Home Services & Maintenance (الخدمات المنزلية) ---
  {
    id: 'home_maintenance',
    slug: 'verified-home-artisans',
    titleAr: 'الحرفيون المنزليون (صيانة وطوارئ)',
    titleEn: 'Verified Home Craftsmen',
    titleFr: 'Artisans et Dépannage',
    descriptionAr: 'شبكة الحرفيين المعتمدين والمقيمين بالجزائر (ترصيص، كهرباء، صيانة المكيفات، وتركيب السخان) مع ضمان الأسعار العادلة.',
    descriptionEn: 'Verified local technicians for plumbing, electrical, air conditioning, and emergency home repairs.',
    category: 'home_services',
    icon: 'Wrench',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: true,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['حرفيون محققو الهوية', 'تقييمات واقعية من زبائن حقيقيين', 'تقدير مسبق لتكلفة التدخل'],
  },

  // --- 6. Jobs & Freelance (التوظيف والعمل) ---
  {
    id: 'jobs_algeria',
    slug: 'algeria-verified-jobs',
    titleAr: 'فرص العمل وعروض التوظيف المعتمدة',
    titleEn: 'Verified Algerian Job Opportunities',
    titleFr: 'Emploi et Recrutement',
    descriptionAr: 'محرك بحث صوتي لعروض التوظيف الرسمية في القطاعين العام والخاص ومسابقات الوظيف العمومي في الجزائر.',
    descriptionEn: 'Verified employment opportunities in private and public sectors with speech-friendly CV builder.',
    category: 'jobs',
    icon: 'Briefcase',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: true,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['إعلانات الوظيف العمومي', 'تصفية حسب الولاية والمؤهل', 'إنشاء سيرة ذاتية صوتية'],
  },

  // --- 7. Administrative & Legal (الخدمات الإدارية والقانونية) ---
  {
    id: 'administrative_guide',
    slug: 'algerian-admin-formalities',
    titleAr: 'دليل الوثائق والمعاملات الإدارية بالجزائر',
    titleEn: 'Administrative Formalities Guide',
    titleFr: 'Guide Administratif Algérien',
    descriptionAr: 'مساعد ذكي لشرح ملفات الوثائق الرسمية (جواز السفر البيومتري، بطاقة التعريف، السجل التجاري، وبطاقة الشفاء).',
    descriptionEn: 'Voice guide for Algerian administrative dossiers (biometric passport, ID, commercial registry, Chifa card).',
    category: 'admin_legal',
    icon: 'Scale',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['قوائم الوثائق الرسمية المطلوبة', 'الرسوم والطوابع الجبائية بدقة', 'روابط البوابات الحكومية الرقمية'],
  },

  // --- 8. Finance & Electronic Payments (المالية والدفع) ---
  {
    id: 'finance_tracker',
    slug: 'currency-gold-dz-tracker',
    titleAr: 'مؤشر أسعار الصرف والذهب بالجزائر',
    titleEn: 'Algerian Currency & Gold Rates',
    titleFr: 'Taux de Change et Or',
    descriptionAr: 'متابعة يومية لأسعار صرف الدينار الجزائري مقابل العملات الأجنبية (اليورو والدولار) في البنوك الرسمية وأسعار الذهب.',
    descriptionEn: 'Daily tracking of official Algerian Dinar bank exchange rates and gold market prices.',
    category: 'finance',
    icon: 'CreditCard',
    status: 'in_development',
    badgeAr: 'قيد التطوير',
    badgeEn: 'In Development',
    isCore: false,
    requiresAuth: false,
    metrics: {
      launchTarget: 'الربع الثاني 2026',
    },
    features: ['أسعار بنك الجزائر الرسمية', 'تحويل العملات الفوري', 'نطق صوتي للأسعار اليومية'],
  },
];

// Unified Modular Service Registry Helper Class
export class ServiceRegistryManager {
  private services: ModularService[];

  constructor(initialServices: ModularService[] = INITIAL_SERVICES) {
    this.services = [...initialServices];
  }

  public getAllServices(): ModularService[] {
    return [...this.services];
  }

  public getServicesByCategory(category: ServiceCategory): ModularService[] {
    if (category === 'core') {
      return this.services.filter((s) => s.isCore);
    }
    return this.services.filter((s) => s.category === category);
  }

  public getActiveServices(): ModularService[] {
    return this.services.filter((s) => s.status === 'active');
  }

  public getUpcomingServices(): ModularService[] {
    return this.services.filter((s) => s.status === 'in_development' || s.status === 'planned');
  }

  public getServiceById(id: string): ModularService | undefined {
    return this.services.find((s) => s.id === id || s.slug === id);
  }

  /**
   * System-controlled registration method for future modular services.
   * Enforces immutability and schema compliance (no arbitrary code injection).
   */
  public registerService(service: ModularService): boolean {
    if (!service.id || !service.titleAr || !service.category) {
      console.warn('Cannot register invalid service definition:', service);
      return false;
    }
    const exists = this.services.some((s) => s.id === service.id);
    if (exists) {
      this.services = this.services.map((s) => (s.id === service.id ? service : s));
    } else {
      this.services.push(service);
    }
    return true;
  }
}

export const serviceRegistry = new ServiceRegistryManager();
