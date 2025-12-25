# TypeScript Interface'leri - Güncellenmiş Versiyon

## 📋 Özet

Veritabanı normalizasyonu sonrası (`teams` tablosu eklendi, `matches` tablosu `team_a_id` ve `team_b_id` kullanıyor) TypeScript interface'leri güncellendi.

## 🎯 Ana Değişiklikler

### 1. Teams Tablosu
- ✅ `short_code` ve `logo_url` artık nullable (`string | null`)
- ✅ `id` tipi esnek (`string | number` - UUID veya BIGINT)
- ✅ `updated_at` kolonu eklendi

### 2. Matches Tablosu
- ✅ `team_a` ve `team_b` string kolonları kaldırıldı
- ✅ `team_a_id` ve `team_b_id` foreign key kolonları eklendi
- ✅ `team_a` ve `team_b` nested objeler olarak eklendi (join ile gelir)
- ✅ Yeni kolonlar eklendi: `tournament_stage`, `match_format`, `is_display_match`, `hltv_ranking_a`, `hltv_ranking_b`, `hltv_url`, `stream_links`, `prediction_lock_minutes_before_match`

### 3. Predictions Tablosu
- ✅ Zaten doğru, değişiklik yapılmadı

### 4. Profiles Tablosu
- ✅ Zaten doğru, değişiklik yapılmadı

## 📝 Kullanım Örnekleri

### Match Çekme (Join ile)

```typescript
const { data } = await supabase
  .from('matches')
  .select(`
    *,
    team_a:teams!matches_team_a_id_fkey (
      id,
      name,
      short_code,
      logo_url
    ),
    team_b:teams!matches_team_b_id_fkey (
      id,
      name,
      short_code,
      logo_url
    )
  `);

// Type: Database['public']['Tables']['matches']['Row'][]
const matches = data || [];
```

### Match Render Etme

```typescript
// Takım A bilgileri
{match.team_a?.name} // Takım A ismi
{match.team_a?.logo_url} // Takım A logosu

// Takım B bilgileri
{match.team_b?.name} // Takım B ismi
{match.team_b?.logo_url} // Takım B logosu
```

### Match Ekleme/Güncelleme

```typescript
// Match eklerken team_id kullanılır
await supabase
  .from('matches')
  .insert({
    team_a_id: selectedTeamAId, // string | number
    team_b_id: selectedTeamBId, // string | number
    match_time: '20:00',
    match_date: '2025-12-25',
    // ... diğer alanlar
  });

// Match güncellerken
await supabase
  .from('matches')
  .update({
    team_a_id: newTeamAId,
    winner: 'A',
    // ... diğer alanlar
  })
  .eq('id', matchId);
```

## 🔍 Type Safety

Interface'ler artık:
- ✅ Foreign key ilişkilerini doğru şekilde yansıtıyor
- ✅ Nested objeler için type safety sağlıyor
- ✅ Nullable alanları doğru şekilde tanımlıyor
- ✅ Supabase join query'leri ile uyumlu

## 📁 Dosya Konumu

- Ana types dosyası: `supabase/types.ts`
- Database interface'leri: `Database['public']['Tables']`

## ⚠️ Önemli Notlar

1. **Nested Objects**: `team_a` ve `team_b` sadece join query yapıldığında gelir. Eğer join yapılmazsa `undefined` olabilir.

2. **Type Assertions**: Eğer join yaptığınızdan eminseniz, type assertion kullanabilirsiniz:
   ```typescript
   const match = data as MatchWithTeams;
   ```

3. **Null Checks**: Her zaman null check yapın:
   ```typescript
   {match.team_a?.name || 'Unknown Team'}
   {match.team_a?.logo_url || '/default-logo.png'}
   ```

