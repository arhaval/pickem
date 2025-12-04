# ⚡ HIZLI ÇÖZÜM - 2 DAKİKADA ADMIN

## 🎯 Adım 1: Mevcut Kullanıcıları Gör

1. **Supabase Dashboard** → **SQL Editor**
2. Şu SQL'i çalıştır:

```sql
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 10;
```

3. Listeden **bir email seç** (kendi email'in varsa onu seç)

---

## 🎯 Adım 2: O Email'i Admin Yap

1. Aynı SQL Editor'de
2. Şu SQL'i çalıştır (**EMAIL'i değiştir**):

```sql
UPDATE public.profiles
SET is_admin = true,
    username = COALESCE(username, 'admin'),
    updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'SENIN_EMAIL_BURAYA'
);

-- Eğer profil yoksa oluştur
INSERT INTO public.profiles (
  id,
  username,
  is_admin,
  total_points,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'admin',
  true,
  0,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'SENIN_EMAIL_BURAYA'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = u.id
  );
```

**Örnek:** Eğer email'in `test@arhaval.com` ise:
```sql
WHERE email = 'test@arhaval.com'
```

---

## 🎯 Adım 3: Giriş Yap

1. `/admin/login` sayfasına git
2. **Email**: Yukarıda seçtiğin email
3. **Şifre**: O email'in şifresi
4. Giriş yap ✅

---

## ✅ Bitti!

Artık admin paneline erişebilirsin!

**Not:** Eğer şifreyi bilmiyorsan, Supabase Dashboard → Authentication → Users → Kullanıcıyı bul → "Reset Password" yapabilirsin.






