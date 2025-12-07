# Email Onayını Kapatma (Geliştirme İçin)

## Supabase Dashboard'da:

1. **Authentication** → **Settings** sayfasına git
2. **"Enable email confirmations"** seçeneğini **KAPAT**
3. **Save** butonuna tıkla

Bu sayede kayıt olduktan sonra direkt giriş yapabilirsin, email onayı beklemen gerekmez.

## Alternatif: Mevcut Kullanıcı İçin Profil Oluştur

Eğer email onayını kapatmak istemiyorsan, mevcut kullanıcı için manuel profil oluşturabilirsin:

```sql
-- Mevcut kullanıcılar için profil oluştur
INSERT INTO public.profiles (
  id,
  username,
  avatar_url,
  total_points,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'username',
    SPLIT_PART(u.email, '@', 1),
    'user_' || SUBSTRING(u.id::TEXT, 1, 8)
  ) as username,
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    NULL
  ) as avatar_url,
  0,
  FALSE,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```











