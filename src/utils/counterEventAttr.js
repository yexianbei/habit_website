/**
 * 指尖计数器：用 eventAttr.*（B 层）读写，与 docs/platform/bridge-api.md 一致。
 * 习惯级属性 key 与原生属性表约定一致（见 habit-attribute-spec）。
 */

export const COUNTER_ATTR_KEYS = {
  STEP: 'counter_step',
  UNIT: 'counter_unit',
  VIBRATION: 'counter_vibration_enabled',
  DARK: 'counter_dark_mode',
  FULLSCREEN: 'counter_is_fullscreen',
  PER_CLICK: 'counter_per_click_record',
  SHOW_UNIT: 'counter_show_unit',
  UNIT_NAME: 'counter_unit_name',
  DAILY_GOAL: 'counter_daily_goal',
  TOTAL_GOAL: 'counter_total_goal',
  SHOW_HOME_GOAL: 'counter_show_home_goal_progress',
}

const HABIT_GET_KEYS = [
  COUNTER_ATTR_KEYS.STEP,
  COUNTER_ATTR_KEYS.UNIT,
  COUNTER_ATTR_KEYS.VIBRATION,
  COUNTER_ATTR_KEYS.DARK,
  COUNTER_ATTR_KEYS.FULLSCREEN,
  COUNTER_ATTR_KEYS.PER_CLICK,
  COUNTER_ATTR_KEYS.SHOW_UNIT,
  COUNTER_ATTR_KEYS.UNIT_NAME,
  COUNTER_ATTR_KEYS.DAILY_GOAL,
  COUNTER_ATTR_KEYS.TOTAL_GOAL,
  COUNTER_ATTR_KEYS.SHOW_HOME_GOAL,
]

function val(values, key) {
  const o = values?.[key]
  if (o == null) return undefined
  return o.attributeValue != null ? String(o.attributeValue) : undefined
}


/**
 * @param {object} res eventAttr.habit.get 返回 { values }
 * @returns {object} 指尖计数器设置（扁平字段，供 UI 使用）
 */
export function mapEventAttrToCounterSettings(res) {
  const values = res?.values || {}
  const stepStr = val(values, COUNTER_ATTR_KEYS.STEP)
  let step = 1
  try {
    step = parseInt(stepStr, 10)
    if (Number.isNaN(step)) step = 1
  } catch {
    step = 1
  }
  const unitRaw = val(values, COUNTER_ATTR_KEYS.UNIT)
  const vibrationStr = val(values, COUNTER_ATTR_KEYS.VIBRATION)
  const darkStr = val(values, COUNTER_ATTR_KEYS.DARK)
  const fullStr = val(values, COUNTER_ATTR_KEYS.FULLSCREEN)
  const perClickStr = val(values, COUNTER_ATTR_KEYS.PER_CLICK)
  const showUnitStr = val(values, COUNTER_ATTR_KEYS.SHOW_UNIT)
  const unitName = val(values, COUNTER_ATTR_KEYS.UNIT_NAME) ?? ''
  const dailyStr = val(values, COUNTER_ATTR_KEYS.DAILY_GOAL)
  const totalStr = val(values, COUNTER_ATTR_KEYS.TOTAL_GOAL)
  const showGoalStr = val(values, COUNTER_ATTR_KEYS.SHOW_HOME_GOAL)

  let dailyGoal = 10
  try {
    dailyGoal = parseInt(dailyStr, 10)
    if (Number.isNaN(dailyGoal) || dailyGoal < 1) dailyGoal = 10
  } catch {
    dailyGoal = 10
  }
  let totalGoal = 100
  try {
    totalGoal = parseInt(totalStr, 10)
    if (Number.isNaN(totalGoal) || totalGoal < 1) totalGoal = 100
  } catch {
    totalGoal = 100
  }

  return {
    step,
    unit: unitRaw && unitRaw.length > 0 ? unitRaw : '次',
    vibrationEnabled: vibrationStr !== 'false',
    darkMode: darkStr === 'true',
    isFullScreen: fullStr === 'true',
    perClickRecord: perClickStr === 'true',
    showUnit: showUnitStr === 'true',
    unitName: unitName || '',
    dailyGoal,
    totalGoal,
    showHomeGoalProgress: showGoalStr === 'true',
  }
}

/**
 * @param {(m: string, p?: object) => Promise<any>} callNative
 */
export async function fetchCounterSettingsViaEventAttr(callNative, habitId) {
  const params = { keys: HABIT_GET_KEYS }
  if (habitId) params.habitId = habitId
  const res = await callNative('eventAttr.habit.get', params)
  if (!res?.success && res?.values == null) {
    return null
  }
  return mapEventAttrToCounterSettings(res)
}

/**
 * @param {(m: string, p?: object) => Promise<any>} callNative
 * @param {object} u 字段名：step, unit, vibrationEnabled, darkMode, isFullScreen, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress
 */
export async function saveCounterSettingsViaEventAttr(callNative, u, habitId) {
  const attrs = []
  if (u.step !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.STEP,
      attributeValue: String(Math.max(1, parseInt(u.step, 10) || 1)),
      attributeType: 1,
    })
  }
  if (u.unit !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.UNIT,
      attributeValue: String(u.unit || '次'),
      attributeType: 4,
    })
  }
  if (u.vibrationEnabled !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.VIBRATION,
      attributeValue: u.vibrationEnabled ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (u.darkMode !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.DARK,
      attributeValue: u.darkMode ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (u.isFullScreen !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.FULLSCREEN,
      attributeValue: u.isFullScreen ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (u.perClickRecord !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.PER_CLICK,
      attributeValue: u.perClickRecord ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (u.showUnit !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.SHOW_UNIT,
      attributeValue: u.showUnit ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (u.unitName !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.UNIT_NAME,
      attributeValue: String(u.unitName ?? ''),
      attributeType: 4,
    })
  }
  if (u.dailyGoal !== undefined) {
    const g = Math.max(1, parseInt(u.dailyGoal, 10) || 1)
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.DAILY_GOAL,
      attributeValue: String(g),
      attributeType: 1,
    })
  }
  if (u.totalGoal !== undefined) {
    const g = Math.max(1, parseInt(u.totalGoal, 10) || 1)
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.TOTAL_GOAL,
      attributeValue: String(g),
      attributeType: 1,
    })
  }
  if (u.showHomeGoalProgress !== undefined) {
    attrs.push({
      attributeKey: COUNTER_ATTR_KEYS.SHOW_HOME_GOAL,
      attributeValue: u.showHomeGoalProgress ? 'true' : 'false',
      attributeType: 5,
    })
  }
  if (attrs.length === 0) return
  const params = { attributes: attrs }
  if (habitId) params.habitId = habitId
  await callNative('eventAttr.habit.set', params)
}

/**
 * eventAttr.log.query 结果 → 统计用记录列表 { records: [{ recordId, date, step, createTime }] }
 */
export function mapLogQueryToCounterRecords(queryRes) {
  const rows = queryRes?.records || []
  return {
    records: rows.map((r) => {
      const stepRaw = r.attributes?.counter_step?.attributeValue
      const step = Number(stepRaw)
      return {
        recordId: r.logId,
        date: r.date,
        step: Number.isFinite(step) && step > 0 ? step : 1,
        createTime: r.createTime || 0,
      }
    }),
  }
}

/**
 * 今日合计（多条 per-click 或单条累计）
 */
export async function fetchTodayCounterTotalViaEventAttr(callNative, todayStr, habitId) {
  const params = {
    startDate: todayStr,
    endDate: todayStr,
    keys: [COUNTER_ATTR_KEYS.STEP],
  }
  if (habitId) params.habitId = habitId
  const res = await callNative('eventAttr.log.query', params)
  const { records } = mapLogQueryToCounterRecords(res)
  return records.reduce((s, r) => s + (Number(r.step) || 0), 0)
}

/**
 * 单次计数写入（mergePolicy 由 perClickRecord 决定）
 */
export async function saveCounterIncrementViaEventAttr(callNative, { date, step, perClickRecord, habitId }) {
  const s = Math.max(1, Number(step) || 1)
  const params = {
    date,
    mergePolicy: perClickRecord ? 'always_new' : 'accumulate',
    createTime: perClickRecord ? Date.now() : undefined,
    attributes: [
      {
        attributeKey: COUNTER_ATTR_KEYS.STEP,
        attributeValue: String(s),
        attributeType: 1,
        attributeDisplay: String(s),
      },
    ],
  }
  if (habitId) params.habitId = habitId
  return callNative('eventAttr.log.save', params)
}

/** 清空某日计数日志（如「重置今日」） */
export async function deleteCounterLogsForDateViaEventAttr(callNative, date, habitId) {
  const params = { date }
  if (habitId) params.habitId = habitId
  return callNative('eventAttr.log.delete', params)
}
