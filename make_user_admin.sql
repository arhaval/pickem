-- Kullanıcıya admin yetkisi verme scripti
-- Kullanım: Email adresini veya kullanıcı ID'sini değiştir

-- Yöntem 1: Email adresine göre admin yap
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'BURAYA_EMAIL_GIR' -- Örnek: 'test@arhaval.com'
);

-- Yöntem 2: Kullanıcı ID'sine göre admin yap
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = 'BURAYA_KULLANICI_ID_GIR';

-- Yöntem 3: Tüm kullanıcıları admin yap (SADECE TEST İÇİN!)
-- UPDATE public.profiles
-- SET is_admin = true;

-- Kontrol etmek için:
-- SELECT id, username, email, is_admin 
-- FROM public.profiles 
-- WHERE is_admin = true;











