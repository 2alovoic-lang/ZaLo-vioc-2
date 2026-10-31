import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleHealthCheck } from './src/server/healthHandler.js';
import { handleAssistantRequest } from './src/server/assistantHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health & Integration Diagnostics Endpoint
app.get('/api/health', handleHealthCheck);

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
app.post('/api/assistant', handleAssistantRequest);

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

// Only listen directly when running standalone (not inside Vercel serverless functions)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
