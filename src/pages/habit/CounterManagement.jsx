/**
 * 指尖计数器主功能页
 * 功能：极简计数 / 全屏模式 / 黑夜模式 / 自定义步长 / 震动反馈 / 统计分析
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayStr() {
  return formatDate(new Date())
}

/** 将 timestamp 转成 "HH:mm" */
function tsToTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 根据 timestamp 返回小时段标签（0-23） */
function tsToHour(ts) {
  return new Date(ts).getHours()
}

function parseDateStr(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date()
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

function getRecordDateKey(r) {
  if (r?.date) return r.date
  if (r?.createTime) return formatDate(new Date(r.createTime))
  return todayStr()
}

function getRecordStep(r) {
  const val = Number(r?.step)
  return Number.isFinite(val) && val > 0 ? val : 1
}

/** 将 records 聚合成小时分布 */
function buildHourlyData(records) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}时`, count: 0 }))
  records.forEach((r) => {
    const h = tsToHour(r.createTime || Date.now())
    buckets[h].count += getRecordStep(r)
  })
  return buckets
}

function buildRecentDaysData(records, days) {
  const map = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = formatDate(d)
    const label = i === 0 ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`
    map[key] = { label, count: 0 }
  }
  records.forEach((r) => {
    const key = getRecordDateKey(r)
    if (map[key]) map[key].count += getRecordStep(r)
  })
  return Object.values(map).map((v) => ({ day: v.label, count: v.count }))
}

function buildWeekdayData(records) {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const buckets = labels.map((label) => ({ day: label, count: 0 }))
  records.forEach((r) => {
    const d = parseDateStr(getRecordDateKey(r))
    const idx = d.getDay()
    buckets[idx].count += getRecordStep(r)
  })
  return buckets
}

function buildMonthlyData(records, months = 12) {
  const map = {}
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = { month: `${d.getMonth() + 1}月`, count: 0 }
  }
  records.forEach((r) => {
    const key = getRecordDateKey(r).slice(0, 7)
    if (map[key]) map[key].count += getRecordStep(r)
  })
  return Object.values(map)
}

function buildStepDistributionData(records) {
  const map = {}
  records.forEach((r) => {
    const step = getRecordStep(r)
    const key = `+${step}`
    if (!map[key]) map[key] = { step: key, count: 0 }
    map[key].count += 1
  })
  return Object.values(map).sort((a, b) => Number(a.step.slice(1)) - Number(b.step.slice(1)))
}

function buildRangeDailyTotals(records, days) {
  const map = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = formatDate(d)
    const label = i === 0 ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`
    map[key] = { date: key, day: label, count: 0 }
  }
  records.forEach((r) => {
    const key = getRecordDateKey(r)
    if (map[key]) map[key].count += getRecordStep(r)
  })
  return Object.values(map)
}

function calcStreakInfo(dailyTotals, dailyGoal) {
  let currentStreak = 0
  let longestStreak = 0
  let running = 0
  dailyTotals.forEach((item) => {
    if (item.count >= dailyGoal) {
      running += 1
      if (running > longestStreak) longestStreak = running
    } else {
      running = 0
    }
  })
  for (let i = dailyTotals.length - 1; i >= 0; i--) {
    if (dailyTotals[i].count >= dailyGoal) currentStreak += 1
    else break
  }
  return { currentStreak, longestStreak }
}

/** mock 记录（浏览器预览用） */
function buildMockRecords() {
  const now = Date.now()
  const result = []
  for (let i = 0; i < 240; i++) {
    const offset = Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    result.push({
      recordId: `mock-${i}`,
      date: formatDate(new Date(now - offset)),
      step: Math.random() > 0.6 ? 5 : 1,
      createTime: now - offset,
    })
  }
  return result
}

const WEB_SETTINGS_KEY = 'counter_web_settings_v1'
const WEB_TODAY_COUNT_KEY = 'counter_web_today_count_v1'

const DEFAULT_PER_CLICK_RECORD = false

function readWebSettings() {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(WEB_SETTINGS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (_) {
    return null
  }
}

function writeWebSettings(settings) {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(WEB_SETTINGS_KEY, JSON.stringify(settings))
  } catch (_) {}
}

function readWebTodayCount() {
  try {
    if (typeof window === 'undefined') return 0
    const raw = window.localStorage.getItem(WEB_TODAY_COUNT_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return 0
    if (parsed.date !== todayStr()) return 0
    const count = Number(parsed.count)
    return Number.isFinite(count) && count >= 0 ? count : 0
  } catch (_) {
    return 0
  }
}

function writeWebTodayCount(count) {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(WEB_TODAY_COUNT_KEY, JSON.stringify({
      date: todayStr(),
      count: Math.max(0, Number(count) || 0),
    }))
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 统计面板子组件
// ─────────────────────────────────────────────

function StatPanel({ records, isDark, showUnit, unitName, dailyGoal }) {
  const [tab, setTab] = useState('hourly')
  const [rangeDays, setRangeDays] = useState(30)

  const rangeOptions = useMemo(() => ([
    { key: 7, label: '7天' },
    { key: 30, label: '30天' },
    { key: 90, label: '90天' },
    { key: 365, label: '365天' },
  ]), [])
  const filteredRecords = useMemo(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date(end)
    start.setDate(start.getDate() - (rangeDays - 1))
    start.setHours(0, 0, 0, 0)
    return records.filter((r) => {
      const key = getRecordDateKey(r)
      const d = parseDateStr(key)
      return d >= start && d <= end
    })
  }, [records, rangeDays])
  const previousRecords = useMemo(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date(end)
    start.setDate(start.getDate() - (rangeDays - 1))
    start.setHours(0, 0, 0, 0)
    const prevEnd = new Date(start)
    prevEnd.setDate(prevEnd.getDate() - 1)
    prevEnd.setHours(23, 59, 59, 999)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - (rangeDays - 1))
    prevStart.setHours(0, 0, 0, 0)
    return records.filter((r) => {
      const key = getRecordDateKey(r)
      const d = parseDateStr(key)
      return d >= prevStart && d <= prevEnd
    })
  }, [records, rangeDays])
  const rangeDailyData = useMemo(() => buildRecentDaysData(filteredRecords, rangeDays), [filteredRecords, rangeDays])
  const rangeDailyTotals = useMemo(() => buildRangeDailyTotals(filteredRecords, rangeDays), [filteredRecords, rangeDays])
  const hourlyData = useMemo(() => buildHourlyData(filteredRecords), [filteredRecords])
  const weekdayData = useMemo(() => buildWeekdayData(filteredRecords), [filteredRecords])
  const monthlyData = useMemo(() => buildMonthlyData(filteredRecords, Math.max(1, Math.min(12, Math.ceil(rangeDays / 30)))), [filteredRecords, rangeDays])
  const stepDistributionData = useMemo(() => buildStepDistributionData(filteredRecords), [filteredRecords])
  const streakData = useMemo(() => rangeDailyTotals.map((d) => ({ day: d.day, count: d.count >= dailyGoal ? 1 : 0 })), [rangeDailyTotals, dailyGoal])
  const compareData = useMemo(() => {
    const currentTotal = filteredRecords.reduce((sum, r) => sum + getRecordStep(r), 0)
    const previousTotal = previousRecords.reduce((sum, r) => sum + getRecordStep(r), 0)
    return [
      { period: '本期', count: currentTotal },
      { period: '上期', count: previousTotal },
    ]
  }, [filteredRecords, previousRecords])
  const streakInfo = useMemo(() => calcStreakInfo(rangeDailyTotals, dailyGoal), [rangeDailyTotals, dailyGoal])
  const goalAchievedDays = useMemo(() => rangeDailyTotals.filter((d) => d.count >= dailyGoal).length, [rangeDailyTotals, dailyGoal])

  const ACCENT = isDark ? '#7C6FD4' : '#6C63FF'
  const BG_COLOR = isDark ? '#1a1a2e' : '#F7F7FF'
  const TEXT_COLOR = isDark ? '#aaa' : '#666'
  const AXIS_COLOR = isDark ? '#444' : '#ccc'
  const displayUnit = (unitName && unitName.trim()) ? unitName.trim() : '次'

  const tabConfig = useMemo(() => ([
    { key: 'hourly', label: '时段分布', data: hourlyData, xKey: 'hour', interval: 3, metric: 'unit' },
    { key: 'trend', label: '趋势', data: rangeDailyData, xKey: 'day', interval: rangeDays >= 90 ? 8 : rangeDays >= 30 ? 4 : 0, metric: 'unit' },
    { key: 'weekday', label: '星期分布', data: weekdayData, xKey: 'day', interval: 0, metric: 'unit' },
    { key: 'monthly', label: '月度分布', data: monthlyData, xKey: 'month', interval: 1, metric: 'unit' },
    { key: 'step', label: '步长分布', data: stepDistributionData, xKey: 'step', interval: 0, metric: 'times' },
    { key: 'continuity', label: '连续性', data: streakData, xKey: 'day', interval: rangeDays >= 90 ? 8 : rangeDays >= 30 ? 4 : 0, metric: 'day' },
    { key: 'goal', label: '目标达成', data: rangeDailyData, xKey: 'day', interval: rangeDays >= 90 ? 8 : rangeDays >= 30 ? 4 : 0, metric: 'unit' },
    { key: 'compare', label: '同比环比', data: compareData, xKey: 'period', interval: 0, metric: 'unit' },
  ]), [hourlyData, rangeDailyData, rangeDays, weekdayData, monthlyData, stepDistributionData, streakData, compareData])
  const activeConfig = tabConfig.find((item) => item.key === tab) || tabConfig[0]
  const chartData = activeConfig.data
  const dataKey = 'count'
  const xKey = activeConfig.xKey

  const maxVal = Math.max(...chartData.map((d) => d[dataKey]), 1)
  const totalCount = chartData.reduce((sum, item) => sum + (item.count || 0), 0)
  const peakItem = chartData.reduce((best, cur) => (cur.count > best.count ? cur : best), chartData[0] || { count: 0 })

  return (
    <div
      className="rounded-2xl p-4 mt-4"
      style={{ background: BG_COLOR }}
    >
      <div className="overflow-x-auto mb-4">
        <div className="flex gap-2 w-max pr-2">
          {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: tab === t.key ? ACCENT : 'transparent',
              color: tab === t.key ? '#fff' : TEXT_COLOR,
              border: `1px solid ${tab === t.key ? ACCENT : AXIS_COLOR}`,
            }}
          >
            {t.label}
          </button>
        ))}
        </div>
      </div>
      <div className="overflow-x-auto mb-4">
        <div className="flex gap-2 w-max pr-2">
          {rangeOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => setRangeDays(item.key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: rangeDays === item.key ? ACCENT : 'transparent',
                color: rangeDays === item.key ? '#fff' : TEXT_COLOR,
                border: `1px solid ${rangeDays === item.key ? ACCENT : AXIS_COLOR}`,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 9, fill: TEXT_COLOR }}
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              interval={activeConfig.interval}
            />
            <YAxis
              tick={{ fontSize: 9, fill: TEXT_COLOR }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#222' : '#fff',
                border: 'none',
                borderRadius: 8,
                color: isDark ? '#ddd' : '#333',
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
              formatter={(val) => {
                if (activeConfig.metric === 'times') return [`${val} 下`, '点击次数']
                if (activeConfig.metric === 'day') return [`${val > 0 ? '达标' : '未达标'}`, '目标状态']
                return [showUnit ? `${val} ${displayUnit}` : `${val}`, '计数']
              }}
            />
            <Bar dataKey={dataKey} radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry[dataKey] >= maxVal * 0.7 ? ACCENT : isDark ? '#333' : '#DDD8FF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {tab === 'hourly' && (() => {
        const total = filteredRecords.reduce((s, r) => s + getRecordStep(r), 0)
        const times = filteredRecords.length
        const peakHour = hourlyData.reduce((best, cur) => cur.count > best.count ? cur : best, hourlyData[0])
        return (
          <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
            <span>{rangeDays}天累计 <strong style={{ color: ACCENT }}>{total}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
            <span>点击 <strong style={{ color: ACCENT }}>{times}</strong> 下</span>
            {peakHour.count > 0 && (
              <span>高峰 <strong style={{ color: ACCENT }}>{peakHour.hour}</strong></span>
            )}
          </div>
        )
      })()}
      {tab === 'trend' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>{rangeDays}天累计 <strong style={{ color: ACCENT }}>{totalCount}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
          <span>日均 <strong style={{ color: ACCENT }}>{Math.round(totalCount / rangeDays)}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
          <span>活跃天 <strong style={{ color: ACCENT }}>{rangeDailyData.filter((d) => d.count > 0).length}</strong> 天</span>
          <span>最高 <strong style={{ color: ACCENT }}>{peakItem.day}</strong></span>
        </div>
      )}
      {tab === 'weekday' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>最活跃 <strong style={{ color: ACCENT }}>{peakItem.day}</strong></span>
          <span>总计 <strong style={{ color: ACCENT }}>{totalCount}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
        </div>
      )}
      {tab === 'monthly' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>{Math.max(1, Math.min(12, Math.ceil(rangeDays / 30)))}月累计 <strong style={{ color: ACCENT }}>{totalCount}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
          <span>峰值月 <strong style={{ color: ACCENT }}>{peakItem.month}</strong></span>
        </div>
      )}
      {tab === 'step' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>常用步长 <strong style={{ color: ACCENT }}>{peakItem.step || '+1'}</strong></span>
          <span>总点击 <strong style={{ color: ACCENT }}>{totalCount}</strong> 下</span>
        </div>
      )}
      {tab === 'continuity' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>当前连胜 <strong style={{ color: ACCENT }}>{streakInfo.currentStreak}</strong> 天</span>
          <span>最长连胜 <strong style={{ color: ACCENT }}>{streakInfo.longestStreak}</strong> 天</span>
          <span>目标 <strong style={{ color: ACCENT }}>{dailyGoal}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
        </div>
      )}
      {tab === 'goal' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>达标天数 <strong style={{ color: ACCENT }}>{goalAchievedDays}</strong> / {rangeDays}</span>
          <span>达标率 <strong style={{ color: ACCENT }}>{Math.round((goalAchievedDays / rangeDays) * 100)}</strong>%</span>
          <span>目标 <strong style={{ color: ACCENT }}>{dailyGoal}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
        </div>
      )}
      {tab === 'compare' && (
        <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
          <span>本期 <strong style={{ color: ACCENT }}>{compareData[0]?.count || 0}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
          <span>上期 <strong style={{ color: ACCENT }}>{compareData[1]?.count || 0}</strong>{showUnit ? ` ${displayUnit}` : ''}</span>
          <span>变化 <strong style={{ color: ACCENT }}>
            {(() => {
              const prev = compareData[1]?.count || 0
              const curr = compareData[0]?.count || 0
              if (prev === 0 && curr === 0) return '0%'
              if (prev === 0) return '+100%'
              const delta = Math.round(((curr - prev) / prev) * 100)
              return `${delta > 0 ? '+' : ''}${delta}%`
            })()}
          </strong></span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// 设置抽屉子组件
// ─────────────────────────────────────────────

function SettingsDrawer({
  visible,
  onClose,
  step,
  onStepChange,
  dailyGoal,
  onDailyGoalChange,
  totalGoal,
  onTotalGoalChange,
  showHomeGoalProgress,
  onShowHomeGoalProgressToggle,
  useDemoData,
  onUseDemoDataToggle,
  vibration,
  onVibrationToggle,
  isDark,
  onDarkToggle,
  perClickRecord,
  onPerClickRecordToggle,
  showUnit,
  onShowUnitToggle,
  unitName,
  onUnitNameChange,
  onUnitNameBlur,
}) {
  if (!visible) return null

  const bg = isDark ? '#1c1c2e' : '#fff'
  const textColor = isDark ? '#ccc' : '#333'
  const subColor = isDark ? '#666' : '#999'
  const borderColor = isDark ? '#333' : '#f0f0f0'

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6"
        style={{ background: bg }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-base" style={{ color: textColor }}>设置</h3>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: subColor }}>×</button>
        </div>

        {/* 步长 */}
        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>每次加几</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>每次点击增加的数量</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStepChange(Math.max(1, step - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >−</button>
            <span className="w-8 text-center font-semibold text-base" style={{ color: textColor }}>{step}</span>
            <button
              onClick={() => onStepChange(step + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >＋</button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>每日目标</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>用于目标达成与连续性统计</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onDailyGoalChange(Math.max(1, dailyGoal - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >−</button>
            <span className="w-12 text-center font-semibold text-base" style={{ color: textColor }}>{dailyGoal}</span>
            <button
              onClick={() => onDailyGoalChange(dailyGoal + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >＋</button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>总目标</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>用于累计完成进度</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTotalGoalChange(Math.max(1, totalGoal - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >−</button>
            <span className="w-16 text-center font-semibold text-base" style={{ color: textColor }}>{totalGoal}</span>
            <button
              onClick={() => onTotalGoalChange(totalGoal + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: isDark ? '#2a2a3e' : '#f0efff', color: '#6C63FF' }}
            >＋</button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>首页显示目标进度</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>默认关闭，仅在首页展示总目标进度条</p>
          </div>
          <button
            onClick={onShowHomeGoalProgressToggle}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{ background: showHomeGoalProgress ? '#6C63FF' : (isDark ? '#333' : '#ddd') }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: showHomeGoalProgress ? '26px' : '2px' }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>演示数据</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>仅用于统计演示；关闭后使用客户端真实记录</p>
          </div>
          <button
            onClick={onUseDemoDataToggle}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{ background: useDemoData ? '#6C63FF' : (isDark ? '#333' : '#ddd') }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: useDemoData ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* 震动 */}
        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>震动反馈</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>每次计数触发轻触觉</p>
          </div>
          <button
            onClick={onVibrationToggle}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{ background: vibration ? '#6C63FF' : (isDark ? '#333' : '#ddd') }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: vibration ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* 黑夜模式 */}
        <div className="flex items-center justify-between py-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>黑夜模式</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>深色低亮，不刺眼不打扰</p>
          </div>
          <button
            onClick={onDarkToggle}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{ background: isDark ? '#6C63FF' : '#ddd' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: isDark ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* 记录方式 */}
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>每次点击生成记录</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>开启后每次 +{step} 都会新增一条记录；关闭则当天共用一条</p>
          </div>
          <button
            onClick={onPerClickRecordToggle}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{ background: perClickRecord ? '#6C63FF' : (isDark ? '#333' : '#ddd') }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: perClickRecord ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* 计数单位（显示 + 自定义） */}
        <div className="py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: textColor }}>计数单位</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>显示单位并可自定义文本</p>
            </div>
            <button
              onClick={onShowUnitToggle}
              className="w-12 h-6 rounded-full relative transition-all"
              style={{ background: showUnit ? '#6C63FF' : (isDark ? '#333' : '#ddd') }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: showUnit ? '26px' : '2px' }}
              />
            </button>
          </div>
          <div className="mt-3">
            <input
              value={unitName}
              onChange={(e) => onUnitNameChange(e.target.value)}
              onBlur={onUnitNameBlur}
              placeholder="例如 次、个、页..."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? '#2a2a3e' : '#f6f5ff',
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            />
          </div>
        </div>

        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────

export default function CounterManagement() {
  const navigate = useNavigate()
  const {
    isInApp,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
    callNative,
    vibrate,
  } = useNativeBridge()

  const { handleDeleteHabit } = useHabitDelete({ habitType: 26, habitName: '指尖计数器' })
  const initialWebSettings = useMemo(() => readWebSettings() || {}, [])

  const [count, setCount] = useState(() => readWebTodayCount())
  const [step, setStep] = useState(() => Math.max(1, parseInt(initialWebSettings.step) || 1))
  const [isDark, setIsDark] = useState(() => Boolean(initialWebSettings.darkMode))
  const [isFullScreen, setIsFullScreen] = useState(() => Boolean(initialWebSettings.isFullScreen))
  const [vibrationEnabled, setVibrationEnabled] = useState(() => (
    typeof initialWebSettings.vibrationEnabled === 'boolean' ? initialWebSettings.vibrationEnabled : true
  ))
  const [perClickRecord, setPerClickRecord] = useState(() => (
    typeof initialWebSettings.perClickRecord === 'boolean' ? initialWebSettings.perClickRecord : DEFAULT_PER_CLICK_RECORD
  ))
  const [showUnit, setShowUnit] = useState(() => (
    typeof initialWebSettings.showUnit === 'boolean' ? initialWebSettings.showUnit : false
  ))
  const [unitName, setUnitName] = useState(() => (
    typeof initialWebSettings.unitName === 'string' ? initialWebSettings.unitName : ''
  ))
  const [dailyGoal, setDailyGoal] = useState(() => Math.max(1, parseInt(initialWebSettings.dailyGoal) || 10))
  const [totalGoal, setTotalGoal] = useState(() => Math.max(1, parseInt(initialWebSettings.totalGoal) || 100))
  const [showHomeGoalProgress, setShowHomeGoalProgress] = useState(() => (
    typeof initialWebSettings.showHomeGoalProgress === 'boolean' ? initialWebSettings.showHomeGoalProgress : false
  ))
  const [useDemoData, setUseDemoData] = useState(() => (
    typeof initialWebSettings.useDemoData === 'boolean' ? initialWebSettings.useDemoData : false
  ))
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [allRecords, setAllRecords] = useState([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [hasLoadedStatsRecords, setHasLoadedStatsRecords] = useState(false)
  const settingsLoadedRef = useRef(false)

  const pageTitle = '指尖计数器'
  useEffect(() => { document.title = pageTitle }, [])
  useEffect(() => { if (isInApp) setTitle(pageTitle) }, [isInApp, setTitle])

  useEffect(() => {
    if (settingsLoadedRef.current) return
    settingsLoadedRef.current = true
    if (isInApp) loadSettings()
    loadTodayCount()
  }, [isInApp])

  useEffect(() => {
    writeWebSettings({
      step,
      vibrationEnabled,
      darkMode: isDark,
      isFullScreen,
      perClickRecord,
      showUnit,
      unitName,
      dailyGoal,
      totalGoal,
      showHomeGoalProgress,
      useDemoData,
    })
  }, [step, vibrationEnabled, isDark, isFullScreen, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData])

  const loadSettings = async () => {
    try {
      const res = await callNative('counter.getSettings', {})
      if (res) {
        if (res.step) setStep(Math.max(1, parseInt(res.step) || 1))
        if (typeof res.vibrationEnabled === 'boolean') setVibrationEnabled(res.vibrationEnabled)
        if (typeof res.darkMode === 'boolean') setIsDark(res.darkMode)
        if (typeof res.isFullScreen === 'boolean') setIsFullScreen(res.isFullScreen)
        if (typeof res.perClickRecord === 'boolean') setPerClickRecord(res.perClickRecord)
        if (typeof res.showUnit === 'boolean') setShowUnit(res.showUnit)
        if (typeof res.unitName === 'string') setUnitName(res.unitName)
        if (res.dailyGoal) setDailyGoal(Math.max(1, parseInt(res.dailyGoal) || 10))
        if (res.totalGoal) setTotalGoal(Math.max(1, parseInt(res.totalGoal) || 100))
        if (typeof res.showHomeGoalProgress === 'boolean') setShowHomeGoalProgress(res.showHomeGoalProgress)
        if (typeof res.useDemoData === 'boolean') setUseDemoData(res.useDemoData)
      }
    } catch (e) {
      console.error('[CounterManagement] loadSettings error:', e)
    }
  }

  const loadTodayCount = async () => {
    try {
      if (!isInApp) return
      const today = todayStr()
      const res = await callNative('counter.getRecords', {
        startDate: today,
        endDate: today,
      })
      const list = Array.isArray(res?.records) ? res.records : []
      const todayTotal = list.reduce((s, r) => s + (r.step || 1), 0)
      setCount(todayTotal)
      writeWebTodayCount(todayTotal)
    } catch (e) {
      console.error('[CounterManagement] loadTodayCount error:', e)
    }
  }

  const loadRecords = async () => {
    setIsLoadingRecords(true)
    try {
      if (!isInApp) {
        setAllRecords(useDemoData ? buildMockRecords() : [])
        setHasLoadedStatsRecords(true)
        return
      }
      if (useDemoData) {
        setAllRecords(buildMockRecords())
        setHasLoadedStatsRecords(true)
        return
      }
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 364)
      const res = await callNative('counter.getRecords', {
        startDate: formatDate(start),
        endDate: formatDate(now),
      })
      const list = Array.isArray(res?.records) ? res.records : []
      setAllRecords(list)
      setHasLoadedStatsRecords(true)
    } catch (e) {
      console.error('[CounterManagement] loadRecords error:', e)
    } finally {
      setIsLoadingRecords(false)
    }
  }

  // ── 计数核心逻辑 ──
  const handleAdd = useCallback(async () => {
    const newCount = count + step
    setCount(newCount)
    writeWebTodayCount(newCount)

    if (vibrationEnabled) {
      try { vibrate('light') } catch (_) {}
    }

    if (!isInApp) return

    try {
      const baseRecord = {
        date: todayStr(),
        step,
        count: newCount,
      }

      const record = perClickRecord
        ? { ...baseRecord, createTime: Date.now() }
        : { ...baseRecord }

      await callNative('counter.save', record)
      if (hasLoadedStatsRecords) {
        setAllRecords((prev) => {
          const localRecord = { ...record, recordId: `local-${Date.now()}` }
          if (perClickRecord) {
            return [...prev, localRecord]
          }
          const today = todayStr()
          const idx = prev.findIndex((r) => r.date === today)
          if (idx === -1) return [...prev, localRecord]
          const next = [...prev]
          next[idx] = { ...next[idx], ...localRecord }
          return next
        })
      }
    } catch (e) {
      console.error('[CounterManagement] save error:', e)
    }
  }, [count, step, vibrationEnabled, isInApp, callNative, vibrate, hasLoadedStatsRecords, perClickRecord])

  // ── 重置今日 ──
  const handleReset = async () => {
    setCount(0)
    writeWebTodayCount(0)
    if (!isInApp) return
    try {
      await showLoading('重置中...')
      await callNative('counter.resetToday', { date: todayStr() })
      await hideLoading()
      await showToast('今日计数已清零')
      if (hasLoadedStatsRecords) {
        setAllRecords((prev) => prev.filter((r) => r.date !== todayStr()))
      }
    } catch (e) {
      await hideLoading()
      console.error('[CounterManagement] reset error:', e)
    }
  }

  // ── 保存设置 ──
  const saveSettings = useCallback(async (newSettings) => {
    if (!isInApp) return
    try {
      await callNative('counter.updateSettings', newSettings)
    } catch (e) {
      console.error('[CounterManagement] saveSettings error:', e)
    }
  }, [isInApp, callNative])

  const handleStepChange = (newStep) => {
    setStep(newStep)
    saveSettings({ step: newStep, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleDailyGoalChange = (newGoal) => {
    const next = Math.max(1, parseInt(newGoal) || 1)
    setDailyGoal(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal: next, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleTotalGoalChange = (newGoal) => {
    const next = Math.max(1, parseInt(newGoal) || 1)
    setTotalGoal(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal: next, showHomeGoalProgress, useDemoData })
  }

  const handleShowHomeGoalProgressToggle = () => {
    const next = !showHomeGoalProgress
    setShowHomeGoalProgress(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress: next, useDemoData })
  }

  const handleUseDemoDataToggle = () => {
    const next = !useDemoData
    setUseDemoData(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData: next })
    setHasLoadedStatsRecords(false)
    if (showStats && !isLoadingRecords) {
      loadRecords()
    }
  }

  const handleVibrationToggle = () => {
    const next = !vibrationEnabled
    setVibrationEnabled(next)
    saveSettings({ step, vibrationEnabled: next, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleDarkToggle = () => {
    const next = !isDark
    setIsDark(next)
    saveSettings({ step, vibrationEnabled, darkMode: next, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handlePerClickRecordToggle = () => {
    const next = !perClickRecord
    setPerClickRecord(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord: next, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleShowUnitToggle = () => {
    const next = !showUnit
    setShowUnit(next)
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit: next, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleUnitNameChange = (val) => {
    setUnitName(val)
  }

  const handleUnitNameBlur = () => {
    saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
  }

  const handleStatsToggle = () => {
    setShowStats((prev) => {
      const next = !prev
      if (next && !hasLoadedStatsRecords && !isLoadingRecords) {
        loadRecords()
      }
      return next
    })
  }

  const handleFullScreenToggle = () => {
    setIsFullScreen((prev) => {
      const next = !prev
      if (next) {
        setShowStats(false)
        setShowSettings(false)
      }
      if (isInApp) {
        saveSettings({ step, vibrationEnabled, darkMode: isDark, perClickRecord, isFullScreen: next, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress, useDemoData })
      }
      return next
    })
  }

  // ── 全屏点击 ──
  const handleFullScreenTap = useCallback((e) => {
    if (!isFullScreen) return
    const tag = e.target.tagName
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SVG' || tag === 'PATH') return
    if (e.target.closest('button') || e.target.closest('[data-no-tap]')) return
    handleAdd()
  }, [isFullScreen, handleAdd])

  // ── 颜色系 ──
  const bg = isDark ? '#0d0d18' : '#f5f4ff'
  const cardBg = isDark ? '#16162a' : '#ffffff'
  const textPrimary = isDark ? '#9d97e8' : '#3d35bb'
  const textSecondary = isDark ? '#555' : '#9b96db'
  const btnBg = isDark ? '#1e1e32' : '#ebe9ff'
  const btnText = isDark ? '#666' : '#7a75d6'
  const displayUnit = (unitName && unitName.trim()) ? unitName.trim() : '次'
  const totalProgress = Math.min(100, Math.round((count / Math.max(1, totalGoal)) * 100))

  return (
    <div
      className="min-h-screen flex flex-col select-none touch-manipulation"
      style={{
        background: bg,
        transition: 'background 0.3s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={handleFullScreenTap}
    >
      {isFullScreen && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFullScreen(false)
          }}
          className="fixed top-4 left-4 z-40 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: btnBg, color: btnText, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
        >
          退出全屏
        </button>
      )}

      {!isFullScreen && (
        <div
          className="flex items-center justify-between px-4 pt-4 pb-2"
          data-no-tap
        >
          <button
            onClick={handleStatsToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            <span>📊</span> 统计
          </button>
          <button
            onClick={() => navigate('/habit/counter/stats')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            <span>📈</span> 高级
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: btnBg, color: btnText }}
            >
              ⚙️
            </button>
            <button
              onClick={handleDarkToggle}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: btnBg, color: btnText }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      )}

      {/* ── 统计面板（可折叠） ── */}
      {showStats && !isFullScreen && (
        <div className="px-4" data-no-tap>
          {isLoadingRecords ? (
            <div className="text-center py-4 text-xs" style={{ color: textSecondary }}>加载中...</div>
          ) : (
            <StatPanel records={allRecords} isDark={isDark} showUnit={showUnit} unitName={unitName} dailyGoal={dailyGoal} />
          )}
        </div>
      )}

      {/* ── 计数显示区 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className="text-center mb-2 transition-all select-none"
          style={{
            fontSize: isFullScreen ? 120 : 96,
            fontWeight: 500,
            color: textPrimary,
            lineHeight: 1,
            letterSpacing: '-2px',
          }}
        >
          {count}{showUnit ? ' ' : ''}
          {showUnit && (
            <span
              style={{
                fontSize: isFullScreen ? 48 : 36,
                fontWeight: 500,
                color: textSecondary,
                letterSpacing: '-1px',
              }}
            >
              {displayUnit}
            </span>
          )}
        </div>
        <div className="text-xs mb-8" style={{ color: textSecondary }}>
          今日累计{showUnit ? `（${displayUnit}）` : ''} · 每次 +{step}{showUnit ? ` ${displayUnit}` : ''}
        </div>
        {showHomeGoalProgress && (
          <div className="w-full max-w-xs mb-8">
            <div className="flex items-center justify-between text-xs mb-1" style={{ color: textSecondary }}>
              <span>总目标进度</span>
              <span>{count}/{totalGoal}{showUnit ? ` ${displayUnit}` : ''}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: isDark ? '#2a2a3e' : '#e7e4ff' }}>
              <div className="h-2 rounded-full" style={{ width: `${totalProgress}%`, background: '#6C63FF' }} />
            </div>
          </div>
        )}

        {/* 主计数按钮（全屏时隐藏，但保留占位防布局跳动） */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAdd() }}
          className="px-12 py-4 rounded-full text-xl font-medium active:scale-95 transition-all"
          style={{
            background: btnBg,
            color: btnText,
            opacity: isFullScreen ? 0 : 1,
            pointerEvents: isFullScreen ? 'none' : 'auto',
            boxShadow: isDark ? 'none' : '0 2px 12px rgba(108,99,255,0.15)',
          }}
        >
          +{step}{showUnit ? ` ${displayUnit}` : ''}
        </button>
      </div>

      {!isFullScreen && (
        <div
          className="flex items-center justify-center gap-3 px-4 pb-8 pt-2 flex-wrap"
          data-no-tap
        >
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            复位
          </button>

          <button
            onClick={handleFullScreenToggle}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            {isFullScreen ? '退出全屏' : '全屏模式'}
          </button>

          <button
            onClick={() => {
              const next = step === 1 ? 5 : step === 5 ? 10 : 1
              handleStepChange(next)
            }}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            步长 {step}
          </button>

          <button
            onClick={() => navigate('/habit/counter/stats')}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            高级统计
          </button>

          <button
            onClick={() => handleDeleteHabit()}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: isDark ? '#6b4444' : '#c8a0a0' }}
          >
            删除习惯
          </button>
        </div>
      )}

      {/* 全屏模式提示 */}
      {isFullScreen && (
        <div
          className="fixed bottom-6 left-0 right-0 text-center text-xs pointer-events-none"
          style={{ color: isDark ? '#333' : '#bbb' }}
        >
          点击任意位置计数 · 左上角可退出全屏
        </div>
      )}

      {/* ── 设置抽屉 ── */}
      <SettingsDrawer
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        step={step}
        onStepChange={handleStepChange}
        dailyGoal={dailyGoal}
        onDailyGoalChange={handleDailyGoalChange}
        totalGoal={totalGoal}
        onTotalGoalChange={handleTotalGoalChange}
        showHomeGoalProgress={showHomeGoalProgress}
        onShowHomeGoalProgressToggle={handleShowHomeGoalProgressToggle}
        useDemoData={useDemoData}
        onUseDemoDataToggle={handleUseDemoDataToggle}
        vibration={vibrationEnabled}
        onVibrationToggle={handleVibrationToggle}
        isDark={isDark}
        onDarkToggle={handleDarkToggle}
        perClickRecord={perClickRecord}
        onPerClickRecordToggle={handlePerClickRecordToggle}
        showUnit={showUnit}
        onShowUnitToggle={handleShowUnitToggle}
        unitName={unitName}
        onUnitNameChange={handleUnitNameChange}
        onUnitNameBlur={handleUnitNameBlur}
      />
    </div>
  )
}
