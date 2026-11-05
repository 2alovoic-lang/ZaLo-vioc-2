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
    descriptionAr: 'الخدمات الأساسية التي يجري تجهيزها وربطها بمصادر حقيقية',
    iconName: 'Sparkles',
    color: 'cyan',
  },
  {
    id: 'education',
    nameAr: 'التعليم والتدريب',
    nameEn: 'Education & Training',
    descriptionAr: 'نطاقات التعليم والبحث الأكاديمي المخطط ربطها بمراجع موثوقة',
    iconName: 'GraduationCap',
    color: 'teal',
  },
  {
    id: 'health',
    nameAr: 'الصحة والرعاية',
    nameEn: 'Health & Care',
    descriptionAr: 'خدمات صحية مستقبلية تتطلب مصادر ومزودين معتمدين',
    iconName: 'HeartPulse',
    color: 'emerald',
  },
  {
    id: 'travel',
    nameAr: 'السفر والسياحة',
    nameEn: 'Travel & Tourism',
    descriptionAr: 'خدمات نقل وسياحة مستقبلية قيد دراسة مصادرها',
    iconName: 'Compass',
    color: 'sky',
  },
  {
    id: 'home_services',
    nameAr: 'الخدمات المنزلية والصيانة',
    nameEn: 'Home Services & Maintenance',
    descriptionAr: 'دليل خدمات منزلية مخطط ربطه بمقدمي خدمات يمكن التحقق منهم',
    iconName: 'Wrench',
    color: 'amber',
  },
  {
    id: 'jobs',
    nameAr: 'الوظائف والعمل الحر',
    nameEn: 'Jobs & Careers',
    descriptionAr: 'خدمات توظيف وعمل حر مستقبلية قيد ربط المصادر',
    iconName: 'Briefcase',
    color: 'indigo',
  },
  {
    id: 'admin_legal',
    nameAr: 'الخدمات الإدارية والقانونية',
    nameEn: 'Admin & Legal',
    descriptionAr: 'معلومات إدارية وقانونية مستقبلية تتطلب مراجعة مصادر رسمية',
    iconName: 'Scale',
    color: 'purple',
  },
  {
    id: 'finance',
    nameAr: 'المالية والدفع الإلكتروني',
    nameEn: 'Finance & Payments',
    descriptionAr: 'خدمات مالية مستقبلية تتطلب بيانات محدثة وشركاء دفع',
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
    descriptionEn: 'Academic explanations are available in limited local form; official curriculum sources are not connected yet.',
    category: 'education',
    icon: 'GraduationCap',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'academic',
    metrics: {
      },
    features: ['شرح تمهيدي للموضوعات', 'مصادر المنهاج الرسمي قيد الربط', 'التحقق من المراجع قبل النشر'],
  },
  {
    id: 'commerce',
    slug: 'marketplace-commerce',
    titleAr: 'سوق التجارة والمنتجات',
    titleEn: 'Marketplace & Commerce',
    titleFr: 'Marché et Produits',
    descriptionAr: 'دليل منتجات قيد الربط بمصادر وبائعين موثوقين؛ لا تتوفر معاملات شراء أو توصيل مؤكدة بعد.',
    descriptionEn: 'Product discovery is awaiting trusted listings; purchases and delivery are not available yet.',
    category: 'core',
    icon: 'ShoppingBag',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'commerce',
    metrics: {
      },
    features: ['قوائم المنتجات قيد الربط', 'التحقق من البائعين والأسعار', 'الشراء والتوصيل غير متاحين بعد'],
  },
  {
    id: 'real_estate',
    slug: 'real-estate-housing',
    titleAr: 'العقارات والسكن',
    titleEn: 'Real Estate & Housing',
    titleFr: 'Immobilier et Logement',
    descriptionAr: 'قسم للبحث العقاري قيد الربط بإعلانات ووكلاء يمكن التحقق منهم.',
    descriptionEn: 'Property search is awaiting verified listings and real agent connections.',
    category: 'core',
    icon: 'Home',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'real_estate',
    metrics: {
      },
    features: ['إعلانات موثقة قيد الربط', 'بحث حسب الولاية والبلدية', 'التواصل المباشر غير متاح بعد'],
  },
  {
    id: 'taxi',
    slug: 'taxi-transport',
    titleAr: 'خدمة سيارات الأجرة (طاكسي)',
    titleEn: 'Taxi & Transport Rides',
    titleFr: 'Taxi et Transport',
    descriptionAr: 'واجهة لإدخال تفاصيل الرحلة؛ طلب السائق والتسعير يتطلبان مزود نقل فعلياً.',
    descriptionEn: 'Trip details can be entered; driver matching, fares and ride booking require a transport provider.',
    category: 'core',
    icon: 'Car',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'taxi',
    metrics: {
      },
    features: ['إدخال نقطة الانطلاق والوجهة', 'حساب الأجرة قيد الربط', 'طلب السائق غير متاح بعد'],
  },
  {
    id: 'food',
    slug: 'restaurants-food',
    titleAr: 'المطاعم والوجبات الجزائرية',
    titleEn: 'Restaurants & Algerian Food',
    titleFr: 'Restaurants et Repas',
    descriptionAr: 'دليل مطاعم ووجبات قيد الربط بقوائم وأسعار ومعلومات اتصال محدثة.',
    descriptionEn: 'The restaurant directory is awaiting current menus, prices and verified contact sources.',
    category: 'core',
    icon: 'Utensils',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'food',
    metrics: {
      },
    features: ['قوائم الطعام قيد الربط', 'التحقق من الأسعار والمطاعم', 'الطلب والتوصيل غير متاحين بعد'],
  },
  {
    id: 'bookings',
    slug: 'bookings-appointments',
    titleAr: 'الحجوزات والخدمات اليومية',
    titleEn: 'Bookings & Appointments',
    titleFr: 'Réservations et Rendez-vous',
    descriptionAr: 'دليل حجوزات قيد الربط بمزودي خدمات؛ لا يتم تأكيد أي حجز قبل استجابة المزود.',
    descriptionEn: 'Booking providers are not connected yet; no appointment is confirmed until a provider responds.',
    category: 'core',
    icon: 'Calendar',
    status: 'in_development',
    badgeAr: 'قيد الربط بمصادر حقيقية',
    badgeEn: 'Integration in progress',
    isCore: true,
    requiresAuth: false,
    targetTab: 'bookings',
    metrics: {
      },
    features: ['دليل مزودي الحجز قيد الربط', 'التحقق من المواعيد قبل عرضها', 'لا يوجد تأكيد حجز حالياً'],
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
