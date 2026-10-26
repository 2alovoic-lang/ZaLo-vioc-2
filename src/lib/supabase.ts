import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('your-project')
);

// Real client when credentials exist
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Diagnostics helper
export const getSupabaseStatus = () => {
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl || 'غير معرّف',
    statusText: isSupabaseConfigured
      ? 'متصل بقاعدة بيانات Supabase PostgreSQL'
      : 'قيد انتظار إدخال VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY',
    instructions: [
      '1. أنشئ مشروعاً جديداً مجانياً على supabase.com',
      '2. انسخ Project URL و anon/public key',
      '3. أضفهما إلى متغيرات البيئة أو لوحة الإعدادات',
      '4. قم بتشغيل كود الـ SQL المتاح في زر "مخطط قاعدة البيانات"',
    ],
  };
};
