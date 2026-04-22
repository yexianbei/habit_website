-- 用户习惯绑定表：限制同一用户同一习惯类型只能有一条绑定
-- 当前用于戒烟（habit_type = 'quit'）

CREATE TABLE IF NOT EXISTS user_habit_bindings (
  app_user_id TEXT NOT NULL,
  habit_type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (app_user_id, habit_type)
);

CREATE INDEX IF NOT EXISTS idx_user_habit_bindings_type_user
ON user_habit_bindings(habit_type, app_user_id);

-- 回填历史戒烟用户绑定（幂等）
INSERT OR IGNORE INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
SELECT app_user_id, 'quit', updated_at, updated_at
FROM quit_profiles
WHERE app_user_id IS NOT NULL;

INSERT OR IGNORE INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
SELECT app_user_id, 'quit', updated_at, updated_at
FROM quit_gradual_plans
WHERE app_user_id IS NOT NULL;

INSERT OR IGNORE INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
SELECT app_user_id, 'quit', created_at, created_at
FROM quit_events
WHERE app_user_id IS NOT NULL;
