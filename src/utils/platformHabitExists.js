import {
  HABIT_TYPE_H5,
  HABIT_SUBTYPE_FINGER_COUNTER,
  HABIT_SUBTYPE_PERIOD,
  LEGACY_HABIT_TYPE_COUNTER,
  LEGACY_HABIT_TYPE_PERIOD,
} from '../constants/platformHabit'

/**
 * 是否已添加指尖计数器（H5 type=3000 + habitSubType，或旧 type=26）
 * @param {(method: string, params?: object) => Promise<any>} callNative
 */
export async function hasFingerCounterHabit(callNative) {
  try {
    const legacy = await callNative('habit.getList', { type: LEGACY_HABIT_TYPE_COUNTER })
    if (legacy?.habits?.length > 0) return true

    const list = await callNative('habit.getList', { type: HABIT_TYPE_H5 })
    const habits = list?.habits || []
    for (const h of habits) {
      const id = h.id || h.habitId
      if (!id) continue
      try {
        const detail = await callNative('habit.getDetail', { habitId: id })
        const st = detail?.habit?.conditionValue?.habitSubType
        if (st === HABIT_SUBTYPE_FINGER_COUNTER) return true
      } catch {
        /* ignore */
      }
      if (h.name === '指尖计数器') return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * 是否已添加经期管理（H5 + period 子类，或旧 type=16）
 */
export async function hasPeriodHabit(callNative) {
  try {
    const legacy = await callNative('habit.getList', { type: LEGACY_HABIT_TYPE_PERIOD })
    if (legacy?.habits?.length > 0) return true

    const list = await callNative('habit.getList', { type: HABIT_TYPE_H5 })
    const habits = list?.habits || []
    for (const h of habits) {
      const id = h.id || h.habitId
      if (!id) continue
      try {
        const detail = await callNative('habit.getDetail', { habitId: id })
        const st = detail?.habit?.conditionValue?.habitSubType
        if (st === HABIT_SUBTYPE_PERIOD) return true
      } catch {
        /* ignore */
      }
    }
    return false
  } catch {
    return false
  }
}

/**
 * 解析当前指尖计数器习惯的 habitId（URL ?habitId= → 旧 type → H5 子类）
 */
export async function resolveFingerCounterHabitId(callNative) {
  try {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('habitId')
      if (q) return q
    }
  } catch {
    /* ignore */
  }
  try {
    const legacy = await callNative('habit.getList', { type: LEGACY_HABIT_TYPE_COUNTER })
    const first = legacy?.habits?.[0]
    if (first?.id) return first.id

    const list = await callNative('habit.getList', { type: HABIT_TYPE_H5 })
    for (const h of list?.habits || []) {
      const id = h.id || h.habitId
      if (!id) continue
      try {
        const detail = await callNative('habit.getDetail', { habitId: id })
        const st = detail?.habit?.conditionValue?.habitSubType
        if (st === HABIT_SUBTYPE_FINGER_COUNTER) return id
      } catch {
        /* ignore */
      }
      if (h.name === '指尖计数器') return id
    }
  } catch {
    /* ignore */
  }
  return null
}

/**
 * 解析当前经期管理习惯的 habitId（URL ?habitId= → 旧 type → H5 子类）
 * 说明：这是业务所需的“上下文解析”，用于在容器未注入上下文 habitId 时仍能合规写入数据。
 */
export async function resolvePeriodHabitId(callNative) {
  try {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('habitId')
      if (q) return q
    }
  } catch {
    /* ignore */
  }
  try {
    const legacy = await callNative('habit.getList', { type: LEGACY_HABIT_TYPE_PERIOD })
    const first = legacy?.habits?.[0]
    if (first?.id) return first.id

    const list = await callNative('habit.getList', { type: HABIT_TYPE_H5 })
    for (const h of list?.habits || []) {
      const id = h.id || h.habitId
      if (!id) continue
      try {
        const detail = await callNative('habit.getDetail', { habitId: id })
        const st = detail?.habit?.conditionValue?.habitSubType
        if (st === HABIT_SUBTYPE_PERIOD) return id
      } catch {
        /* ignore */
      }
      if (h.name === '经期管理') return id
    }
  } catch {
    /* ignore */
  }
  return null
}

