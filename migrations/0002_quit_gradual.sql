-- 渐进式戒烟数据表

CREATE TABLE IF NOT EXISTS quit_gradual_plans (
  app_user_id TEXT PRIMARY KEY,
  initial_count INTEGER NOT NULL,
  target_count INTEGER NOT NULL,
  weeks INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quit_gradual_daily_counts (
  app_user_id TEXT NOT NULL,
  record_date TEXT NOT NULL, -- YYYY-MM-DD
  cigarette_count INTEGER NOT NULL DEFAULT 0,
  last_smoke_at INTEGER, -- unix epoch seconds
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_gradual_counts_user_date
ON quit_gradual_daily_counts(app_user_id, record_date);
