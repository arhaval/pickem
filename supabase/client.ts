import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Environment variable'ları al, yoksa geçerli placeholder değerler kullan
// Build sırasında hata vermemesi için geçerli format bekleniyor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Development'ta uyarı ver
if (process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables eksik! Site çalışmayabilir.')
  }
}

// Build sırasında environment variable'lar yoksa placeholder değerlerle client oluştur
// Bu, build hatası vermesini önler, ancak runtime'da environment variable'lar ayarlanmalıdır
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

