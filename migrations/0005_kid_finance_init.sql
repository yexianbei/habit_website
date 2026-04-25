-- kid finance (children financial habit)
CREATE TABLE IF NOT EXISTS kid_finance_profiles (
  app_user_id TEXT PRIMARY KEY,
  cycle INTEGER NOT NULL DEFAULT 7,
  base_money_cents INTEGER NOT NULL DEFAULT 3000,
  cycle_start_date TEXT,
  theme TEXT NOT NULL DEFAULT 'girl',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kid_finance_accounts (
  app_user_id TEXT PRIMARY KEY,
  cash_cents INTEGER NOT NULL DEFAULT 0,
  demand_cents INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kid_finance_deposit_rates (
  app_user_id TEXT NOT NULL,
  lock_days INTEGER NOT NULL,
  rate_percent REAL NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, lock_days)
);

CREATE TABLE IF NOT EXISTS kid_finance_deposits (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  money_cents INTEGER NOT NULL,
  lock_days INTEGER NOT NULL,
  rate_percent REAL NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kid_finance_deposits_user_created
  ON kid_finance_deposits(app_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS kid_finance_records (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  record_type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  occurred_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kid_finance_records_user_occurred
  ON kid_finance_records(app_user_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS kid_finance_tasks (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  effect_type TEXT NOT NULL, -- reward | penalty
  amount_per_check_cents INTEGER NOT NULL DEFAULT 0,
  bonus_mode TEXT NOT NULL DEFAULT 'streak_days', -- streak_days | times
  bonus_every INTEGER NOT NULL DEFAULT 1,
  bonus_amount_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kid_finance_tasks_user_order
  ON kid_finance_tasks(app_user_id, sort_order ASC, created_at ASC);

CREATE TABLE IF NOT EXISTS kid_finance_task_checks (
  app_user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  check_date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, task_id, check_date)
);
CREATE INDEX IF NOT EXISTS idx_kid_finance_task_checks_user_date
  ON kid_finance_task_checks(app_user_id, check_date DESC);
