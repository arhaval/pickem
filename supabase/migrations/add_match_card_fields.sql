-- Maç kartı bilgileri için yeni kolonlar ekle
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS tournament_stage TEXT,
ADD COLUMN IF NOT EXISTS match_format TEXT, -- BO1, BO3, BO5
ADD COLUMN IF NOT EXISTS hltv_ranking_a INTEGER,
ADD COLUMN IF NOT EXISTS hltv_ranking_b INTEGER,
ADD COLUMN IF NOT EXISTS hltv_url TEXT,
ADD COLUMN IF NOT EXISTS stream_links TEXT, -- JSON string: {"twitch": {"url": "...", "channelName": "..."}, "youtube": {...}, "kick": {...}}
ADD COLUMN IF NOT EXISTS score_a INTEGER,
ADD COLUMN IF NOT EXISTS score_b INTEGER,
ADD COLUMN IF NOT EXISTS maps TEXT; -- JSON string: [{"name": "Mirage", "scoreA": 16, "scoreB": 12}, ...]

COMMENT ON COLUMN matches.tournament_stage IS 'Turnuva aşaması (örn: Büyük Final, Yarı Final)';
COMMENT ON COLUMN matches.match_format IS 'Maç formatı (BO1, BO3, BO5)';
COMMENT ON COLUMN matches.hltv_ranking_a IS 'Takım A HLTV sıralaması';
COMMENT ON COLUMN matches.hltv_ranking_b IS 'Takım B HLTV sıralaması';
COMMENT ON COLUMN matches.hltv_url IS 'HLTV maç sayfası linki';
COMMENT ON COLUMN matches.stream_links IS 'Yayın linkleri (JSON: {"twitch": {"url": "...", "channelName": "..."}, ...})';
COMMENT ON COLUMN matches.score_a IS 'Takım A skoru';
COMMENT ON COLUMN matches.score_b IS 'Takım B skoru';
COMMENT ON COLUMN matches.maps IS 'Harita bilgileri (JSON: [{"name": "...", "scoreA": 16, "scoreB": 12}, ...])';













