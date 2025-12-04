import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Özel admin kullanıcısı oluşturma endpoint'i
// Sadece development için - production'da kaldırılmalı veya korumalı yapılmalı
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

    const adminEmail = 'yönetici@arhaval.com' // Farklı email kullan
    const adminPassword = 'Admin123!'
    const adminUsername = 'admin'

    // Önce kullanıcı var mı kontrol et
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail)

    let userId: string

    if (existingUser) {
      // Kullanıcı zaten var, ID'sini al
      userId = existingUser.id
      console.log('Admin kullanıcısı zaten var:', userId)
    } else {
      // Yeni admin kullanıcısı oluştur
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Email'i otomatik onayla
        user_metadata: {
          username: adminUsername
        }
      })

      if (createError) {
        console.error('Admin kullanıcısı oluşturma hatası:', createError)
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
      console.log('Admin kullanıcısı oluşturuldu:', userId)
    }

    // Profil oluştur veya güncelle (admin yetkisi ile)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: adminUsername,
        avatar_url: null,
        steam_id: null,
        total_points: 0,
        is_admin: true, // ✅ Admin yetkisi
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
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        username: adminUsername
      },
      warning: 'Bu bilgileri güvenli bir yerde saklayın ve ilk girişte şifreyi değiştirin!'
    })
  } catch (error: any) {
    console.error('Admin kullanıcısı oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen hata: ' + error.message },
      { status: 500 }
    )
  }
}

