import { HABIT_SCHEMA_LATEST } from '../constants/habitSchemaVersion'

/**
 * 迁移总开关（双重保险）：
 * 1) 必须调用方显式传入 allow=true；
 * 2) 且 localStorage 开关为 true。
 * 任一条件不满足，迁移一律不执行。
 */
const MIGRATION_ALLOW_KEY = 'habit_migration_allowed_v1'

export function isHabitMigrationAllowed() {
  try {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(MIGRATION_ALLOW_KEY) === 'true'
  } catch (_) {
    return false
  }
}

/**
 * 仅用于你明确授权后的手动操作，不应在业务流程自动调用。
 */
export function setHabitMigrationAllowed(allowed) {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(MIGRATION_ALLOW_KEY, allowed ? 'true' : 'false')
  } catch (_) {
    // ignore
  }
}

/**
 * v1 -> v2（经期）：
 * - 补齐 displayConfig.detailOpenMode = h5
 * - 补齐 displayConfig.h5Path = period
 * - 固定 progressMode = record
 * - schemaVersion 置为 2
 */
export async function migratePeriodV1ToV2(callNative, habitId, allow = false) {
  if (!allow || !isHabitMigrationAllowed()) {
    return { skipped: true, reason: 'migration_not_allowed' }
  }
  if (!habitId) return { skipped: true, reason: 'missing_habit_id' }

  await callNative('habit.update', {
    habitId,
    conditionValue: {
      schemaVersion: HABIT_SCHEMA_LATEST.PERIOD,
      displayConfig: {
        detailOpenMode: 'h5',
        h5Path: 'period',
        progressMode: 'record',
      },
    },
  })
  return { success: true, toVersion: HABIT_SCHEMA_LATEST.PERIOD }
}

/**
 * v1 -> v2（计数器）：
 * - 补齐 detailOpenMode/h5Path/h5StatsPath
 * - 固定 progressMode = counter
 * - schemaVersion 置为 2
 */
export async function migrateCounterV1ToV2(callNative, habitId, allow = false) {
  if (!allow || !isHabitMigrationAllowed()) {
    return { skipped: true, reason: 'migration_not_allowed' }
  }
  if (!habitId) return { skipped: true, reason: 'missing_habit_id' }

  await callNative('habit.update', {
    habitId,
    conditionValue: {
      schemaVersion: HABIT_SCHEMA_LATEST.COUNTER,
      displayConfig: {
        detailOpenMode: 'h5',
        h5Path: 'counter',
        h5StatsPath: 'counter/stats',
        progressMode: 'counter',
      },
    },
  })
  return { success: true, toVersion: HABIT_SCHEMA_LATEST.COUNTER }
}

