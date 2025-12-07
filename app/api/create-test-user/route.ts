import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Test kullanıcısı oluşturma endpoint'i
// Sadece development için - production'da kaldırılmalı
export async function POST(request: Request) {
  // Sadece development modunda çalışsın
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Bu endpoint sadece development modunda kullanılabilir' },
      { status: 403 }
    )
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase yapılandırması eksik' },
        { status: 500 }
      )
    }

    // Service role key ile admin client oluştur
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const testEmail = 'test@arhaval.com'
    const testPassword = 'Test123!'
    const testUsername = 'testuser'

    // Önce kullanıcı var mı kontrol et
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail)

    let userId: string

    if (existingUser) {
      // Kullanıcı zaten var, ID'sini al
      userId = existingUser.id
      console.log('Test kullanıcısı zaten var:', userId)
    } else {
      // Yeni kullanıcı oluştur
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true, // Email'i otomatik onayla
        user_metadata: {
          username: testUsername
        }
      })

      if (createError) {
        console.error('Kullanıcı oluşturma hatası:', createError)
        return NextResponse.json(
          { error: 'Kullanıcı oluşturulamadı: ' + createError.message },
          { status: 500 }
        )
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: 'Kullanıcı oluşturulamadı' },
          { status: 500 }
        )
      }

      userId = newUser.user.id
      console.log('Test kullanıcısı oluşturuldu:', userId)
    }

    // Profil oluştur veya güncelle
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: testUsername,
        avatar_url: null,
        steam_id: null,
        total_points: 0,
        is_admin: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profil oluşturma hatası:', profileError)
      return NextResponse.json(
        { error: 'Profil oluşturulamadı: ' + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test kullanıcısı başarıyla oluşturuldu',
      credentials: {
        email: testEmail,
        password: testPassword,
        username: testUsername
      }
    })
  } catch (error: any) {
    console.error('Test kullanıcısı oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen hata: ' + error.message },
      { status: 500 }
    )
  }
}











