import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Development'ta uyarı ver, production'da sessizce devam et
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables eksik! Site çalışmayabilir.')
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

