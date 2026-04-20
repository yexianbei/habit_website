-- 戒烟功能 D1 初始化
-- 说明：
-- 1) app_user_id 直接使用 JWT 的 sub（你当前后端的 dailyUserId）
-- 2) 金额用 cents 存储，避免浮点精度问题

CREATE TABLE IF NOT EXISTS quit_profiles (
  app_user_id TEXT PRIMARY KEY,
  quit_start_at INTEGER, -- unix epoch seconds
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  daily_cost_cents INTEGER,
  cigarettes_per_day REAL,
  price_per_cigarette_cents INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quit_events (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- relapse|smoke|note|...
  event_at INTEGER NOT NULL, -- unix epoch seconds
  event_date TEXT NOT NULL,  -- YYYY-MM-DD
  cigarette_count INTEGER,
  payload_json TEXT,
  source TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quit_events_user_time
ON quit_events(app_user_id, event_at DESC);

CREATE INDEX IF NOT EXISTS idx_quit_events_user_date
ON quit_events(app_user_id, event_date);

CREATE INDEX IF NOT EXISTS idx_quit_events_user_type_time
ON quit_events(app_user_id, event_type, event_at DESC);
