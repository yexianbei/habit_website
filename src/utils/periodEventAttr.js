/**
 * 经期管理：仅用 eventAttr.* + 前端计算（与 docs/platform/bridge-api.md 一致）。
 * 习惯级 key、日志级 key 与旧原生 EventAttrPeriod 写入保持一致，便于存量数据兼容。
 */

export const PERIOD_HABIT_KEYS = {
  LAST_START: 'period_last_start_date',
  CYCLE_LEN: 'period_cycle_length',
  PERIOD_LEN: 'period_length',
  REMINDER_ON: 'period_reminder_enabled',
  REMINDER_ADVANCE: 'period_reminder_advance',
}

/** details 桥接字段 → attributeKey（与 Android 原 Period 写入一致） */
const DETAIL_TO_ATTR = [
  ['isPeriod', 'period_is_period', 5],
  ['periodStartTime', 'period_start_time', 7],
  ['periodEnded', 'period_ended', 5],
  ['periodEndTime', 'period_end_time', 7],
  ['flow', 'period_flow', 2],
  ['pain', 'period_pain', 2],
  ['color', 'period_color', 2],
  ['isLove', 'period_is_love', 5],
  ['loveTime', 'period_love_time', 7],
  ['loveMeasure', 'period_love_measure', 2],
  ['mood', 'period_mood', 2],
]

function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d, n) {
  const x = new Date(d.getTime())
  x.setDate(x.getDate() + n)
  return x
}

function attrVal(attrs, key) {
  if (!attrs || !key) return undefined
  const o = attrs[key]
  if (o == null) return undefined
  if (typeof o === 'object' && o.attributeValue != null) return String(o.attributeValue)
  return String(o)
}

function boolAttr(v) {
  return String(v).toLowerCase() === 'true'
}

/** 属性表 attributeKey → 前端 signUpId 使用的 camelCase（与 PeriodManagement 解析一致） */
const ATTR_TO_SIGNUP_KEY = {
  period_is_period: 'isPeriod',
  period_start_time: 'periodStartTime',
  period_ended: 'periodEnded',
  period_end_time: 'periodEndTime',
  period_flow: 'flow',
  period_pain: 'pain',
  period_color: 'color',
  period_is_love: 'isLove',
  period_love_time: 'loveTime',
  period_love_measure: 'loveMeasure',
  period_mood: 'mood',
}

/**
 * 将 log.query 返回的 attributes 块拼成 signUpId JSON 字符串（camelCase，供日历/状态解析）
 */
function assembleSignUpIdString(attrsObj) {
  if (!attrsObj || typeof attrsObj !== 'object') return '{}'
  const out = {}
  for (const [k, wrap] of Object.entries(attrsObj)) {
    const raw = wrap?.attributeValue != null ? wrap.attributeValue : wrap
    if (raw == null) continue
    const jsonKey = ATTR_TO_SIGNUP_KEY[k] || k
    const t = wrap?.attributeType ?? 4
    if (t === 5) {
      out[jsonKey] = boolAttr(raw)
    } else if (t === 1) {
      const n = Number(raw)
      out[jsonKey] = Number.isNaN(n) ? raw : n
    } else if (t === 2 || t === 6) {
      const n = parseInt(String(raw).trim(), 10)
      out[jsonKey] = Number.isNaN(n) ? raw : n
    } else {
      out[jsonKey] = raw
    }
  }
  return JSON.stringify(out)
}

function buildAttributesFromDetails(details) {
  const list = []
  if (!details || typeof details !== 'object') return list
  const saveType = details.saveType
  const isPeriodGroup = saveType === 'period' || saveType == null
  const isLoveGroup = saveType === 'love'
  const isMoodGroup = saveType === 'mood'

  for (const [bridgeField, attrKey, attrType] of DETAIL_TO_ATTR) {
    if (['isPeriod', 'periodStartTime', 'periodEnded', 'periodEndTime', 'flow', 'pain', 'color'].includes(bridgeField) && !isPeriodGroup) {
      continue
    }
    if (['isLove', 'loveTime', 'loveMeasure'].includes(bridgeField) && !isLoveGroup) continue
    if (bridgeField === 'mood' && !(isPeriodGroup || isLoveGroup || isMoodGroup)) continue

    if (!Object.prototype.hasOwnProperty.call(details, bridgeField)) continue
    const val = details[bridgeField]
    if (val === null || val === undefined) continue
    let strVal
    let display
    if (typeof val === 'boolean') {
      strVal = String(val)
      display = val ? '是' : '否'
    } else if (typeof val === 'number') {
      strVal = String(val)
      display = strVal
    } else {
      strVal = String(val)
      display = strVal
    }
    list.push({
      attributeKey: attrKey,
      attributeValue: strVal,
      attributeType: attrType,
      attributeDisplay: display,
    })
  }
  return list
}

/**
 * @param {string} dateStr YYYY-MM-DD
 * @param {object} details 已解析对象（含 saveType）
 * @param {number} createTimeMs 来自 Bridge 的 createTime
 * @param {boolean} isExisting 当天是否已有日志
 */
function computeCreateTimeMs(dateStr, details, createTimeMs, isExisting) {
  const saveType = details?.saveType
  if (saveType === 'mood' && isExisting) return 0
  if (createTimeMs > 0) return createTimeMs

  const date = parseYmd(dateStr)
  const todayStr = formatYmd(new Date())

  if (saveType === 'period') {
    const t = details?.periodStartTime
    if (t) {
      try {
        const dt = new Date(`${dateStr}T${String(t).trim()}:00`.replace(' ', ''))
        if (!Number.isNaN(dt.getTime())) return dt.getTime()
      } catch {
        /* ignore */
      }
    }
  }
  if (saveType === 'love') {
    const t = details?.loveTime
    if (t) {
      try {
        const dt = new Date(`${dateStr}T${String(t).trim()}:00`.replace(' ', ''))
        if (!Number.isNaN(dt.getTime())) return dt.getTime()
      } catch {
        /* ignore */
      }
    }
  }

  if (dateStr === todayStr) return Date.now()
  return date.getTime() + 12 * 3600 * 1000
}

/**
 * isPeriod 为 true 时，按前 10 天日志更新 period_last_start_date（与原 EventAttrPeriod 语义对齐）
 */
async function syncLastPeriodStartIfNeeded(callNative, habitId, dateStr, details) {
  if (!details?.isPeriod) return
  const base = parseYmd(dateStr)
  for (let i = 1; i <= 10; i++) {
    const dayStr = formatYmd(addDays(base, -i))
    const res = await callNative('eventAttr.log.get', { habitId, date: dayStr })
    if (!res?.success || !res.logId) continue
    const attrs = res.attributes || {}
    const isPrevPeriod = boolAttr(attrVal(attrs, 'period_is_period'))
    const isPrevEnded = boolAttr(attrVal(attrs, 'period_ended'))
    if (isPrevPeriod && !isPrevEnded) return
  }
  await callNative('eventAttr.habit.set', {
    habitId,
    attributes: [
      {
        attributeKey: PERIOD_HABIT_KEYS.LAST_START,
        attributeValue: dateStr,
        attributeType: 7,
        attributeDisplay: dateStr,
      },
    ],
  })
}

/**
 * 保存经期相关记录（原 period.save）
 * @param {function} callNative NativeBridge.callNative
 * @param {{ date: string, details: object|string, createTime?: number }} record
 * @param {string} [habitId] 省略时使用容器注入的 habitId
 */
export async function savePeriodRecord(callNative, record, habitId) {
  const dateStr = record?.date
  let details = record?.details
  if (!dateStr) throw new Error('period save: 缺少 date')
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details)
    } catch {
      details = {}
    }
  }
  if (!details || typeof details !== 'object') details = {}

  const createTimeMs = record.createTime != null ? Number(record.createTime) : 0

  const existingRes = await callNative('eventAttr.log.get', { date: dateStr, habitId })
  const existingLogId = (existingRes?.success && existingRes?.logId) ? String(existingRes.logId) : ''
  const isExisting = !!existingLogId

  const ct = computeCreateTimeMs(dateStr, details, createTimeMs, isExisting)
  const attributes = buildAttributesFromDetails(details)

  const payload = {
    date: dateStr,
    mergePolicy: 'merge_by_day',
    attributes,
  }
  if (habitId) payload.habitId = habitId
  // 根规则：同一逻辑日若已有日志锚点，后续经期/心情/爱爱都必须复用同一条，不再靠 date 二次解析
  if (existingLogId) payload.logId = existingLogId
  if (!existingLogId && ct > 0) payload.createTime = ct

  const out = await callNative('eventAttr.log.save', payload)
  if (details.isPeriod) {
    await syncLastPeriodStartIfNeeded(callNative, habitId, dateStr, details)
  }
  return out
}

/**
 * 原 period.getRecords：{ records, lastPeriodStart }
 */
export async function fetchPeriodRecords(callNative, startDate, endDate, habitId) {
  const q = await callNative('eventAttr.log.query', {
    startDate,
    endDate,
    habitId,
  })
  const recordsRaw = q?.records || []
  const mapped = recordsRaw.map((rec) => ({
    id: rec.logId,
    createTime: rec.createTime || 0,
    period: rec.date || null,
    signUpId: assembleSignUpIdString(rec.attributes),
  }))

  const hg = await callNative('eventAttr.habit.get', {
    habitId,
    keys: [PERIOD_HABIT_KEYS.LAST_START],
  })
  const v = hg?.values?.[PERIOD_HABIT_KEYS.LAST_START]?.attributeValue
  const lastPeriodStart = v || null

  return { records: mapped, lastPeriodStart }
}

export async function deletePeriodDay(callNative, dateStr, habitId) {
  return callNative('eventAttr.log.delete', { date: dateStr, habitId })
}

/**
 * 原 period.getSettings
 */
export async function fetchPeriodSettings(callNative, habitId) {
  const keys = [
    PERIOD_HABIT_KEYS.CYCLE_LEN,
    PERIOD_HABIT_KEYS.PERIOD_LEN,
    PERIOD_HABIT_KEYS.LAST_START,
    PERIOD_HABIT_KEYS.REMINDER_ON,
    PERIOD_HABIT_KEYS.REMINDER_ADVANCE,
  ]
  const res = await callNative('eventAttr.habit.get', { habitId, keys })
  const values = res?.values || {}

  let cycleLength = parseInt(attrVal(values, PERIOD_HABIT_KEYS.CYCLE_LEN) || '28', 10)
  let periodLength = parseInt(attrVal(values, PERIOD_HABIT_KEYS.PERIOD_LEN) || '5', 10)
  if (Number.isNaN(cycleLength)) cycleLength = 28
  if (Number.isNaN(periodLength)) periodLength = 5

  let reminderAdvance = parseInt(attrVal(values, PERIOD_HABIT_KEYS.REMINDER_ADVANCE) || '3', 10)
  if (Number.isNaN(reminderAdvance)) reminderAdvance = 3

  const lastPeriodStart = attrVal(values, PERIOD_HABIT_KEYS.LAST_START) || null
  const reminderEnabled = boolAttr(attrVal(values, PERIOD_HABIT_KEYS.REMINDER_ON))

  return {
    cycleLength,
    periodLength,
    lastPeriodStart: lastPeriodStart || null,
    reminderEnabled,
    reminderAdvance,
  }
}

/**
 * 原 period.updateSettings
 */
export async function updatePeriodSettings(callNative, settings, habitId) {
  const attrs = []
  if (settings.cycleLength != null) {
    const v = Number(settings.cycleLength)
    attrs.push({
      attributeKey: PERIOD_HABIT_KEYS.CYCLE_LEN,
      attributeValue: String(v),
      attributeType: 1,
      attributeDisplay: `${v}天`,
    })
  }
  if (settings.periodLength != null) {
    const v = Number(settings.periodLength)
    attrs.push({
      attributeKey: PERIOD_HABIT_KEYS.PERIOD_LEN,
      attributeValue: String(v),
      attributeType: 1,
      attributeDisplay: `${v}天`,
    })
  }
  if (settings.reminderEnabled != null) {
    const v = !!settings.reminderEnabled
    attrs.push({
      attributeKey: PERIOD_HABIT_KEYS.REMINDER_ON,
      attributeValue: String(v),
      attributeType: 5,
      attributeDisplay: v ? '开启' : '关闭',
    })
  }
  if (settings.reminderAdvance != null) {
    const v = Number(settings.reminderAdvance)
    attrs.push({
      attributeKey: PERIOD_HABIT_KEYS.REMINDER_ADVANCE,
      attributeValue: String(v),
      attributeType: 1,
      attributeDisplay: `${v}天`,
    })
  }
  if (attrs.length === 0) return { success: true }
  return callNative('eventAttr.habit.set', { habitId, attributes: attrs })
}

/**
 * 原 period.predict（纯计算，数据来自 habit 属性）
 */
export async function predictNextPeriod(callNative, habitId) {
  const s = await fetchPeriodSettings(callNative, habitId)
  let lastStartStr = s.lastPeriodStart
  if (!lastStartStr) {
    const empty = { hasData: false, message: '需要记录经期后才能预测' }
    return empty
  }

  const cycleLength = s.cycleLength || 28
  const periodLength = s.periodLength || 5

  const fmt = (d) => formatYmd(d)
  const lastStart = parseYmd(lastStartStr)
  const today = new Date()
  const cal = new Date(lastStart.getTime())
  cal.setDate(cal.getDate() + cycleLength)
  while (cal < today) {
    cal.setDate(cal.getDate() + cycleLength)
  }
  const nextStart = new Date(cal.getTime())

  const diffMs = nextStart.getTime() - today.getTime()
  const daysUntilNext = Math.round(diffMs / (24 * 3600 * 1000))

  const ovulation = new Date(nextStart.getTime())
  ovulation.setDate(ovulation.getDate() - 14)

  const fertileDates = []
  const f0 = new Date(ovulation.getTime())
  f0.setDate(f0.getDate() - 5)
  for (let i = 0; i < 7; i++) {
    const x = new Date(f0.getTime())
    x.setDate(x.getDate() + i)
    fertileDates.push(fmt(x))
  }

  const predictedDates = []
  const p0 = new Date(nextStart.getTime())
  for (let i = 0; i < periodLength; i++) {
    const x = new Date(p0.getTime())
    x.setDate(x.getDate() + i)
    predictedDates.push(fmt(x))
  }

  return {
    hasData: true,
    nextStartDate: fmt(nextStart),
    daysUntilNext,
    ovulationDate: fmt(ovulation),
    fertileDates,
    predictedDates,
    cycleLength,
    periodLength,
  }
}

/**
 * 心情：原 mood.getByDate — eventAttr.log.get 读 period_mood
 */
export async function getMoodByDate(callNative, dateStr, habitId) {
  const res = await callNative('eventAttr.log.get', { habitId, date: dateStr, keys: ['period_mood'] })
  const attrs = res?.attributes || {}
  const raw = attrVal(attrs, 'period_mood')
  if (raw == null || raw === '') return { mood: null }
  const n = parseInt(String(raw).trim(), 10)
  return { mood: Number.isNaN(n) ? null : n }
}

/**
 * 心情：原 mood.setForDate（清除心情时走 removeAttributeKeys）
 */
export async function setMoodForDate(callNative, dateStr, mood, habitId) {
  if (mood == null) {
    const payload = {
      date: dateStr,
      mergePolicy: 'merge_by_day',
      removeAttributeKeys: ['period_mood'],
      attributes: [],
    }
    if (habitId) payload.habitId = habitId
    return callNative('eventAttr.log.save', payload)
  }
  return savePeriodRecord(
    callNative,
    { date: dateStr, details: { saveType: 'mood', mood }, createTime: 0 },
    habitId,
  )
}
