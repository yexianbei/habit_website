/**
 * H5 习惯：坚持/连续天数（前端独立维护一套）
 *
 * 约定：
 * - 数据存为「习惯级属性」（habit-level），通过 eventAttr.habit.get/set 读写
 * - 仅当 displayConfig 明确需要展示/使用天数时才维护（默认关闭）
 * - 一天只累计一次：通过 h5_last_check_day 控制
 */

export const H5_DAY_STATS_ATTR_KEYS = {
  CUMULATIVE_DAYS: 'h5_cumulative_days', // number
  CONTINUES_DAYS: 'h5_continues_days',   // number
  LAST_CHECK_DAY: 'h5_last_check_day',   // text: yyyy-MM-dd
}

function val(values, key) {
  const o = values?.[key]
  if (o == null) return undefined
  return o.attributeValue != null ? String(o.attributeValue) : undefined
}

function parseIntSafe(v, fallback = 0) {
  const n = parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : fallback
}

function dateStrToYmd(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return ''
  return dateStr.slice(0, 10)
}

function ymdYesterday(ymd) {
  if (!ymd) return ''
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ''
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - 1)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/**
 * 是否启用天数维护（最小规则）：
 * - displayConfig.subtitleDisplayMode === 'days'
 *
 * 后续若引入 layoutOverrides/widgets 的更细粒度引用，可在此处扩展判定。
 */
export function shouldEnableH5DayStats(displayConfig) {
  return displayConfig?.subtitleDisplayMode === 'days'
}

/**
 * 今日打卡成功后，按需更新 H5 天数（一天只加一次）。
 *
 * @param {(m: string, p?: object) => Promise<any>} callNative
 * @param {{habitId?: string, date: string, enabled?: boolean, displayConfig?: any}} params
 */
export async function updateH5DayStatsAfterCheckinViaEventAttr(callNative, params) {
  const today = dateStrToYmd(params?.date)
  if (!today) return

  const enabled = params?.enabled !== undefined
    ? Boolean(params.enabled)
    : shouldEnableH5DayStats(params?.displayConfig)
  if (!enabled) return

  const getParams = { keys: [H5_DAY_STATS_ATTR_KEYS.CUMULATIVE_DAYS, H5_DAY_STATS_ATTR_KEYS.CONTINUES_DAYS, H5_DAY_STATS_ATTR_KEYS.LAST_CHECK_DAY] }
  if (params?.habitId) getParams.habitId = params.habitId
  const res = await callNative('eventAttr.habit.get', getParams)
  const values = res?.values || {}

  const last = dateStrToYmd(val(values, H5_DAY_STATS_ATTR_KEYS.LAST_CHECK_DAY) || '')
  if (last === today) return

  const curCum = Math.max(0, parseIntSafe(val(values, H5_DAY_STATS_ATTR_KEYS.CUMULATIVE_DAYS), 0))
  const curCon = Math.max(0, parseIntSafe(val(values, H5_DAY_STATS_ATTR_KEYS.CONTINUES_DAYS), 0))
  const yesterday = ymdYesterday(today)

  const nextCum = curCum + 1
  const nextCon = last === yesterday ? (curCon + 1) : 1

  const setParams = {
    attributes: [
      { attributeKey: H5_DAY_STATS_ATTR_KEYS.CUMULATIVE_DAYS, attributeValue: String(nextCum), attributeType: 1 },
      { attributeKey: H5_DAY_STATS_ATTR_KEYS.CONTINUES_DAYS, attributeValue: String(nextCon), attributeType: 1 },
      { attributeKey: H5_DAY_STATS_ATTR_KEYS.LAST_CHECK_DAY, attributeValue: today, attributeType: 4 },
    ],
  }
  if (params?.habitId) setParams.habitId = params.habitId
  await callNative('eventAttr.habit.set', setParams)
}

