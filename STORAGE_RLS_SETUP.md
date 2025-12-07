# Storage RLS Politikaları Kurulum Rehberi

Supabase Storage'da RLS politikaları SQL ile oluşturulamaz. Dashboard'dan manuel olarak eklemeniz gerekiyor.

## Adım Adım Kurulum

### 1. Supabase Dashboard'a Gidin
- https://supabase.com/dashboard
- Projenizi seçin

### 2. Storage Sekmesine Gidin
- Sol menüden **"Storage"** sekmesine tıklayın
- **"uploads"** bucket'ını bulun (yoksa oluşturun)

### 3. Bucket Ayarlarına Gidin
- **"uploads"** bucket'ına tıklayın
- **"Policies"** sekmesine tıklayın

### 4. RLS Politikalarını Ekleyin

#### Policy 1: Public Read (Herkes Okuyabilir)
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Public read for uploads`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (veya boş bırakın - herkes)
   - **USING expression**: `bucket_id = 'uploads'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

#### Policy 2: Authenticated Upload (Giriş Yapanlar Yükleyebilir)
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: `bucket_id = 'uploads' AND auth.role() = 'authenticated'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

#### Policy 3: Authenticated Update (Giriş Yapanlar Güncelleyebilir)
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Authenticated users can update`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'uploads' AND auth.role() = 'authenticated'`
   - **WITH CHECK expression**: `bucket_id = 'uploads' AND auth.role() = 'authenticated'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

#### Policy 4: Authenticated Delete (Giriş Yapanlar Silebilir)
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Authenticated users can delete`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'uploads' AND auth.role() = 'authenticated'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

## Alternatif: Daha Basit Yaklaşım

Eğer yukarıdaki adımlar çok karmaşık geliyorsa, daha basit bir yaklaşım:

### Basit Policy (Tüm Authenticated Kullanıcılar İçin)
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `ALL` (veya sadece `INSERT` seçin)
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'uploads'`
   - **WITH CHECK expression**: `bucket_id = 'uploads'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

### Public Read Policy
1. **"New Policy"** butonuna tıklayın
2. **"Create a policy from scratch"** seçin
3. Ayarlar:
   - **Policy name**: `Public read`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (veya boş bırakın)
   - **USING expression**: `bucket_id = 'uploads'`
4. **"Review"** ve **"Save policy"** butonlarına tıklayın

## Notlar

- RLS'nin aktif olduğundan emin olun (bucket ayarlarında kontrol edin)
- Policy'leri ekledikten sonra birkaç saniye bekleyin (propagasyon için)
- Hala hata alırsanız, bucket'ın "Public" olarak işaretlendiğinden emin olun

## Test

Policy'leri ekledikten sonra:
1. Admin panelden resim yüklemeyi deneyin
2. Başarılı olursa, policy'ler doğru çalışıyor demektir





