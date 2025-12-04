import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Anon key ile session oluştur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Service role key ile profil oluşturma (RLS bypass) - opsiyonel
    // Eğer yoksa anon key kullanılacak
    const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
      : null
    
    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError || !session?.user) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(new URL('/register?error=auth_failed', requestUrl.origin))
    }

    // Email onayı callback'te otomatik yapılıyor (Supabase tarafından)
    // Ekstra onaylama gerekmiyor

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', session.user.id)
      .single()

    // If profile doesn't exist, create it (trigger devre dışı, burada oluşturuyoruz)
    if (!existingProfile) {
      // Try to get username from OAuth provider metadata or email signup
      const providerMetadata = session.user.user_metadata
      let username = providerMetadata?.username || null // Email kayıt için signUp options'dan gelen username
      let avatarUrl = providerMetadata?.avatar_url || providerMetadata?.picture || providerMetadata?.image_url || null
      
      // Try different OAuth providers - Discord, Google, Steam
      if (!username) {
        if (providerMetadata?.preferred_username) {
          // Discord
          username = providerMetadata.preferred_username
        } else if (providerMetadata?.name) {
          // Google name
          username = providerMetadata.name.replace(/\s+/g, '_').toLowerCase()
        } else if (providerMetadata?.full_name) {
          // Google full_name
          username = providerMetadata.full_name.replace(/\s+/g, '_').toLowerCase()
        } else if (providerMetadata?.username) {
          // Discord username (alternatif)
          username = providerMetadata.username
        } else if (session.user.email) {
          // Email'den username oluştur
          username = session.user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()
        }
      }

      // Eğer hala username yoksa, user ID'den oluştur
      if (!username) {
        username = `user_${session.user.id.substring(0, 8)}`
      }

      // Username'i temizle (sadece harf, rakam, alt çizgi)
      username = username.replace(/[^a-z0-9_]/gi, '_').toLowerCase().substring(0, 30)

      // Create profile - Service role key kullan (RLS bypass)
      const profileClient = supabaseAdmin || supabase
      
      // Önce mevcut profili kontrol et (race condition için)
      const { data: checkProfile } = await profileClient
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (!checkProfile) {
        const { error: profileError } = await profileClient
          .from('profiles')
          .insert({
            id: session.user.id,
            username: username,
            avatar_url: avatarUrl,
            steam_id: providerMetadata?.steam_id || null,
            total_points: 0,
            is_admin: false,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Hata detaylarını logla
          console.error('Error details:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
        } else {
          console.log('Profile created successfully for user:', session.user.id)
        }
      } else {
        console.log('Profile already exists for user:', session.user.id)
      }
    } else if (!existingProfile.username) {
      // Profile exists but no username - OAuth metadata'dan oluştur
      const providerMetadata = session.user.user_metadata
      let username = null
      
      if (providerMetadata?.preferred_username) {
        username = providerMetadata.preferred_username
      } else if (providerMetadata?.name) {
        username = providerMetadata.name.replace(/\s+/g, '_').toLowerCase()
      } else if (session.user.email) {
        username = session.user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()
      } else {
        username = `user_${session.user.id.substring(0, 8)}`
      }

      username = username.replace(/[^a-z0-9_]/gi, '_').toLowerCase().substring(0, 30)

      // Update profile with username
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username })
        .eq('id', session.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
      }
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}


