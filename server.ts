import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health & Integration Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'ZaLoVoice',
    targetMarket: 'Global & Algeria (Accessible)',
    integrations: {
      geminiAi: {
        configured: !!apiKey,
        model: 'gemini-3.8-flash',
        message: apiKey ? 'مفعل ويعمل مع نموذج Gemini' : 'يتطلب تعيين GEMINI_API_KEY في لوحة Secrets',
      },
      supabase: {
        configured: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
        url: process.env.VITE_SUPABASE_URL || null,
        message: process.env.VITE_SUPABASE_URL
          ? 'تم ربط عنوان مشروع Supabase'
          : 'في انتظار إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY',
      },
      maps: {
        configured: !!process.env.VITE_GOOGLE_MAPS_API_KEY,
        provider: 'Browser Geolocation + OpenStreetMap / Algeria Wilayas Adapter',
      },
      payments: {
        configured: !!process.env.PAYMENT_MERCHANT_ID,
        provider: 'BaridiMob / SATIM CIB Gateway Adapter',
        mode: process.env.PAYMENT_MERCHANT_ID ? 'production' : 'sandbox_ready',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Provide full PostgreSQL DDL schema for user's Supabase instance
app.get('/api/supabase/schema', (req, res) => {
  const sql = `
-- ====================================================================
-- ZaLoVioc Algeria Super-App Database Schema (Supabase PostgreSQL)
-- ====================================================================

-- 1. Profiles & Users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  wilaya TEXT DEFAULT 'الجزائر (16)',
  commune TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Marketplace Products (التجارة والمنتجات)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'electronics', 'fashion', 'home', 'auto'
  price_dzd NUMERIC NOT NULL,
  wilaya TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Real Estate Listings (العقارات)
CREATE TABLE IF NOT EXISTS public.real_estate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  property_type TEXT NOT NULL, -- 'apartment', 'villa', 'studio', 'commercial'
  listing_type TEXT NOT NULL, -- 'rent', 'sale', 'holiday'
  price_dzd NUMERIC NOT NULL,
  period TEXT, -- 'month', 'year', 'day'
  surface_m2 INTEGER,
  rooms INTEGER,
  wilaya TEXT NOT NULL,
  commune TEXT,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ride Hailing / Taxi (النقل وسيارات الأجرة)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID REFERENCES public.profiles(id),
  driver_id UUID REFERENCES public.profiles(id),
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  estimated_fare_dzd NUMERIC NOT NULL,
  ride_type TEXT DEFAULT 'eco', -- 'eco', 'comfort', 'collective'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Restaurants & Food Items (المطاعم والوجبات)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine_type TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_time_mins INTEGER DEFAULT 35,
  rating NUMERIC DEFAULT 4.8,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bookings (الحجوزات والخدمات)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  service_title TEXT NOT NULL,
  service_category TEXT NOT NULL, -- 'medical', 'hotel', 'artisan', 'car_rental'
  provider_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  wilaya TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
  `;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(sql);
});

// AI Voice & Text Super-Assistant Proxy with Gemini
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, history, context, language = 'ar' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Multilingual & Accessible ZaLoVoice System Prompt
    const systemPrompt = `
You are the central voice & intelligence behind "ZaLoVoice" (مساعد ZaLoVoice الصوتي والذكي العالمي).
ZaLoVoice is a universal, multilingual AI assistant accessible to all, with special care for blind individuals, visually impaired, and people of determination.
You possess native fluency in:
- Modern Standard Arabic (العربية الفصحى)
- Algerian Arabic Darija (الدارجة الجزائرية)
- English
- French

You assist users across 7 core integrated services:
1. "academic": School, university & scientific research, lesson explanation (e.g. physics laws like Newton's 2nd law, mathematics, biology, philosophy, computer science). Provide structured explanations, key formulas, verified facts, and authentic academic citations with author/publisher/year.
2. "commerce": Searching and purchasing products in Algerian Dinars (DZD / دج) across 58 wilayas, comparing prices, and contacting sellers.
3. "real_estate": Finding housing for rent (كراء), sale (بيع), or vacation (عطلات) across Algerian wilayas.
4. "taxi": Booking a taxi or VTC ride between locations/wilayas with distance and DZD pricing.
5. "food": Finding traditional Algerian meals (شخشوخة، كسكسي، قرنطيطة، رشتة) or fast food and pizza.
6. "booking": Booking appointments with doctors, clinics, hotel stays, or local artisans.
7. "chat": General friendly, accessible assistance and orientation.

CRITICAL INSTRUCTIONS:
- Analyze the user query.
- Detect the user's intent: one of ["academic", "commerce", "real_estate", "taxi", "food", "booking", "more_services", "chat"].
- Extract any target wilaya, academic subject, or search keywords.
- Formulate a clear, culturally authentic, and polite response in the matching language.
- Provide a concise, phonetically natural "speechText" specifically optimized for text-to-speech audio narration for blind users.
- If the intent is "academic", provide citations and key points.
- If the intent is "more_services" (health, pharmacy, jobs, tourism, admin, etc.), clarify if it's active or in development and navigate to more_services.
- Respond ONLY with a valid JSON object matching this schema:
{
  "intent": "academic" | "commerce" | "real_estate" | "taxi" | "food" | "booking" | "more_services" | "chat",
  "reply": "نص الرد الواضح والمنظم للمستخدم",
  "speechText": "جملة موجزة واضحة مناسبة تماماً للنطق الصوتي وقارئات الشاشة",
  "actionType": "navigate_to_tab" | "show_results",
  "targetTab": "academic" | "commerce" | "real_estate" | "taxi" | "food" | "bookings" | "more_services" | "home",
  "parameters": {
    "wilaya": "اسم الولاية إن وجدت",
    "searchQuery": "كلمات البحث المستخرجة",
    "subject": "المادة الأكاديمية إن وجدت"
  },
  "citations": [
    {
      "title": "عنوان المرجع أو الكتاب",
      "authorOrPublisher": "المؤلف أو الناشر",
      "year": "2024"
    }
  ]
}
`;

    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out')), 6000)
        );

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `User query: "${message}". Context: ${JSON.stringify(context || {})}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const response: any = await Promise.race([geminiCall, timeoutPromise]);
        const rawText = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);
        return res.json({
          ...parsed,
          isAiLive: true,
          provider: 'Gemini 3.8 Flash',
        });
      } catch (geminiError: any) {
        console.error('Gemini generation error, falling back to local NLP:', geminiError?.message);
      }
    }

    // Local Comprehensive Intent Parser Fallback (if Gemini key isn't provided or during temporary offline)
    const lower = message.toLowerCase();
    let intent: 'academic' | 'commerce' | 'real_estate' | 'taxi' | 'food' | 'booking' | 'chat' = 'chat';
    let targetTab = 'home';
    let reply = '';
    let speechText = '';
    let searchQuery = '';
    let wilaya = 'الجزائر العاصمة';
    let citations: any[] = [];

    // Wilaya extraction
    if (lower.includes('وهران') || lower.includes('oran')) wilaya = 'وهران (31)';
    else if (lower.includes('قسنطينة') || lower.includes('constantine')) wilaya = 'قسنطينة (25)';
    else if (lower.includes('سطيف') || lower.includes('setif')) wilaya = 'سطيف (19)';
    else if (lower.includes('عنابة') || lower.includes('annaba')) wilaya = 'عنابة (23)';
    else if (lower.includes('البليدة') || lower.includes('blida')) wilaya = 'البليدة (09)';

    // Academic & School Search Detection
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
      intent = 'academic';
      targetTab = 'academic';
      searchQuery = message;
      if (lower.includes('نيوتن') || lower.includes('newton')) {
        reply = `قانون نيوتن الثاني في الميكانيكا (المبدأ الأساسي للتحريك): ∑F = m · a.\n\nينص على أن مجموع القوى الخارجية المؤثرة على جسم مادي يساوي جداء كتلته العطالية في شعاع تسارعه. يطبق في المراجع الغاليلية ويفسر حركة الأجسام في الفيزياء الكلاسيكية.`;
        speechText = 'قانون نيوتن الثاني ينص على أن مجموع القوى المؤثرة على جسم يساوي كتلته مضروبة في تسارعه.';
        citations = [
          { title: 'منهاج العلوم الفيزيائية - الطور الثانوي', authorOrPublisher: 'وزارة التربية الوطنية الجزائرية', year: '2024' },
          { title: 'Philosophiae Naturalis Principia Mathematica', authorOrPublisher: 'Isaac Newton', year: '1687' }
        ];
      } else {
        reply = `مرحباً بك في قسم البحث الأكاديمي ZaLoVoice! قمت بتحليل سؤالك التعليمي وفتح الدروس والمراجع المعتمدة المتعلقة بموضوعك مع إمكانية القراءة الصوتية.`;
        speechText = 'فتحت لك قسم البحث الأكاديمي والدروس المشروحة مع المراجع المعتمدة.';
      }
    } else if (
      lower.includes('كراء') ||
      lower.includes('دار') ||
      lower.includes('شقة') ||
      lower.includes('سكن') ||
      lower.includes('عقار') ||
      lower.includes('louer') ||
      lower.includes('appartement')
    ) {
      intent = 'real_estate';
      targetTab = 'real_estate';
      searchQuery = 'شقة للكراء';
      reply = `مرحباً بك في ZaLoVoice! قمت بفتح خدمة العقارات والسكن في ${wilaya}. يمكنك معاينة الشقق والمنازل المعروضة للبيع والإيجار.`;
      speechText = `وجدت لك عروضاً عقارية وسكنية في ${wilaya}.`;
    } else if (
      lower.includes('طاكسي') ||
      lower.includes('taxi') ||
      lower.includes('vtc') ||
      lower.includes('توصيلة') ||
      lower.includes('مطار') ||
      lower.includes('course')
    ) {
      intent = 'taxi';
      targetTab = 'taxi';
      reply = `أهلاً بك! قمت بفتح خدمة طلب سيارات الأجرة في ZaLoVoice، يمكنك تحديد نقطة الانطلاق والوصول وحساب الأجرة التقديرية بالدينار الجزائري.`;
      speechText = 'خدمة سيارات الأجرة ZaLoVoice جاهزة لخدمتك الآن.';
    } else if (
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
      intent = 'commerce';
      targetTab = 'commerce';
      searchQuery = message.replace(/(شراء|نشري|بكم|سعر|ابحث لي عن)/g, '').trim();
      reply = `يسعدني مساعدتك في التسوق عبر ZaLoVoice! قمت بتوجيهك لسوق المنتجات مع تصفية الأسعار بالدينار الجزائري والتوصيل عبر 58 ولاية.`;
      speechText = 'فتحت لك سوق المنتجات والأسعار المتاحة في الجزائر.';
    } else if (
      lower.includes('مطعم') ||
      lower.includes('اكل') ||
      lower.includes('ناكل') ||
      lower.includes('كسكس') ||
      lower.includes('شخشوخة') ||
      lower.includes('قرنطيطة') ||
      lower.includes('بيتزا') ||
      lower.includes('restaurant') ||
      lower.includes('manger')
    ) {
      intent = 'food';
      targetTab = 'food';
      reply = `أشهى الأطباق والمطاعم الجزائرية والعالمية متوفرة على ZaLoVoice! يمكنك تفقد القوائم والطلب مع التوصيل السريع.`;
      speechText = 'تفضل قائمة المطاعم والوجبات المتوفرة للتوصيل.';
    } else if (
      lower.includes('حجز') ||
      lower.includes('طبيب') ||
      lower.includes('فندق') ||
      lower.includes('موعد') ||
      lower.includes('rendez-vous') ||
      lower.includes('hotel')
    ) {
      intent = 'booking';
      targetTab = 'bookings';
      reply = `فتحت لك قسم الحجوزات والمواعيد في ZaLoVoice. يمكنك اختيار الخدمة (أطباء، فنادق، حرفيين) وتحديد الموعد المناسب فوراً.`;
      speechText = 'قسم الحجوزات والمواعيد متاح أمامك الآن.';
    } else if (
      lower.includes('خدمات أخرى') ||
      lower.includes('خدمات اضافية') ||
      lower.includes('صيدلية') ||
      lower.includes('صيدليات') ||
      lower.includes('pharmacie') ||
      lower.includes('تبرع بالدم') ||
      lower.includes('تكوين مهني') ||
      lower.includes('سياحة') ||
      lower.includes('tourisme') ||
      lower.includes('وظائف') ||
      lower.includes('عمل') ||
      lower.includes('emploi') ||
      lower.includes('وثائق اداریة') ||
      lower.includes('اسعار الصرف')
    ) {
      intent = 'more_services' as any;
      targetTab = 'more_services';
      reply = `فتحت لك قسم «خدمات أخرى» في ZaLoVoice. يمكنك استعراض الخدمات الإضافية المتاحة وقيد التطوير (الصحة، السياحة، التكوين، والوظائف) مع إمكانية تفعيل التنبيه عند إطلاق كل خدمة.`;
      speechText = 'تفضل بالاطلاع على قسم خدمات أخرى وسجل الخدمات المتاحة وقيد التطوير.';
    } else {
      reply = `مرحباً بك في ZaLoVoice! أنا مساعدك الصوتي الذكي في الجزائر والعالم. كيف يمكنني خدمتك اليوم؟ (البحث الأكاديمي، التسوق، العقارات، طلب طاكسي، المطاعم، أو الحجوزات).`;
      speechText = 'مرحباً بك في زالوفويس، أنا في خدمتك لأي طلب أو بحث أكاديمي.';
    }

    return res.json({
      intent,
      reply,
      speechText,
      actionType: 'navigate_to_tab',
      targetTab,
      parameters: {
        wilaya,
        searchQuery,
      },
      citations,
      isAiLive: false,
      note: apiKey ? 'Fallback mode' : 'يعمل عبر المحلل الذكي المحلي (عيّن GEMINI_API_KEY لتفعيل Gemini 3.8 Flash المباشر)',
    });
  } catch (error: any) {
    console.error('Assistant API error:', error);
    res.status(500).json({ error: error?.message || 'Server internal error' });
  }
});

// Serve frontend in dev (via Vite middlewares) or prod
const startServer = async () => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ZaLoVioc Algerian Super-App server listening on port ${PORT}`);
  });
};

startServer();
