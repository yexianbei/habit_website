/**
 * 与 docs/platform/bridge-api.md 一致：H5 习惯统一 type，子类用 habitSubType 区分。
 */

/** @type {3000} 原生 HabitType.H5 */
export const HABIT_TYPE_H5 = 3000

/** 指尖计数器 */
export const HABIT_SUBTYPE_FINGER_COUNTER = 'finger_counter'

/** 经期管理 */
export const HABIT_SUBTYPE_PERIOD = 'period'

/** 兼容旧版原生类型（已存在数据仍按旧 type 查询） */
export const LEGACY_HABIT_TYPE_COUNTER = 26
export const LEGACY_HABIT_TYPE_PERIOD = 16
