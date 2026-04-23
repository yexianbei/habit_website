-- Flashcard memory feature schema
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  shadow TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_updated
ON flashcard_decks(app_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS flashcard_cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flashcard_cards_deck_order
ON flashcard_cards(deck_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_flashcard_cards_user_deck
ON flashcard_cards(app_user_id, deck_id);

CREATE TABLE IF NOT EXISTS flashcard_progress (
  app_user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  due_at INTEGER NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  review_count INTEGER NOT NULL DEFAULT 0,
  lapse_count INTEGER NOT NULL DEFAULT 0,
  last_difficulty TEXT,
  last_review_at INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(app_user_id, card_id),
  FOREIGN KEY(card_id) REFERENCES flashcard_cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_due
ON flashcard_progress(app_user_id, due_at);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_deck
ON flashcard_progress(app_user_id, deck_id);

CREATE TABLE IF NOT EXISTS flashcard_review_logs (
  id TEXT PRIMARY KEY,
  app_user_id TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  review_date TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flashcard_logs_user_date
ON flashcard_review_logs(app_user_id, review_date DESC);

CREATE INDEX IF NOT EXISTS idx_flashcard_logs_user_time
ON flashcard_review_logs(app_user_id, reviewed_at DESC);

-- Ensure user-habit binding table exists for unique user+habit relationship
CREATE TABLE IF NOT EXISTS user_habit_bindings (
  app_user_id TEXT NOT NULL,
  habit_type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, habit_type)
);

CREATE INDEX IF NOT EXISTS idx_user_habit_bindings_type_user
ON user_habit_bindings(habit_type, app_user_id);
