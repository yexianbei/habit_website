import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const WEB_SETTINGS_KEY = 'counter_web_settings_v1'

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
  return formatDate(new Date())
}

function getRecordStep(r) {
  const val = Number(r?.step)
  return Number.isFinite(val) && val > 0 ? val : 1
}

function buildMockRecords() {
  const now = Date.now()
  const result = []
  for (let i = 0; i < 420; i++) {
    const offset = Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    const stepPool = [1, 1, 1, 2, 5, 10]
    const step = stepPool[Math.floor(Math.random() * stepPool.length)]
    result.push({
      recordId: `mock-${i}`,
      date: formatDate(new Date(now - offset)),
      step,
      createTime: now - offset,
    })
  }
  return result
}

function getDefaultDateRange(rangeDays) {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - (rangeDays - 1))
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function filterRecordsByRange(records, start, end) {
  return records.filter((r) => {
    const d = parseDateStr(getRecordDateKey(r))
    return d >= start && d <= end
  })
}

function diffDaysInclusive(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  s.setHours(0, 0, 0, 0)
  e.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((e - s) / (24 * 60 * 60 * 1000)) + 1)
}

function buildDailyTotalsByDateRange(records, startDate, endDate) {
  const map = {}
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  while (cursor <= end) {
    const d = new Date(cursor)
    const key = formatDate(d)
    map[key] = {
      date: key,
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      count: 0,
    }
    cursor.setDate(cursor.getDate() + 1)
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

function buildHourlyData(records) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}时`, count: 0 }))
  records.forEach((r) => {
    const ts = r.createTime || Date.now()
    const hour = new Date(ts).getHours()
    buckets[hour].count += getRecordStep(r)
  })
  return buckets
}

function buildMinuteBucketData(records, bucketSize = 10) {
  const bucketCount = Math.floor(60 / bucketSize)
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = i * bucketSize
    const end = start + bucketSize - 1
    return { bucket: `${start}-${end}分`, count: 0 }
  })
  records.forEach((r) => {
    if (!r?.createTime) return
    const minute = new Date(r.createTime).getMinutes()
    const index = Math.min(bucketCount - 1, Math.floor(minute / bucketSize))
    buckets[index].count += getRecordStep(r)
  })
  return buckets
}

function buildWeekdayData(records) {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const result = labels.map((label) => ({ day: label, count: 0 }))
  records.forEach((r) => {
    const d = parseDateStr(getRecordDateKey(r))
    const day = d.getDay()
    result[day].count += getRecordStep(r)
  })
  return result
}

function buildStepData(records) {
  const map = {}
  records.forEach((r) => {
    const step = getRecordStep(r)
    const key = `+${step}`
    if (!map[key]) map[key] = { step: key, count: 0 }
    map[key].count += 1
  })
  return Object.values(map).sort((a, b) => Number(a.step.slice(1)) - Number(b.step.slice(1)))
}

function buildCumulativeData(dailyTotals) {
  let sum = 0
  return dailyTotals.map((item) => {
    sum += item.count
    return { ...item, cumulative: sum }
  })
}

function buildWorkdayWeekendData(records) {
  let workday = 0
  let weekend = 0
  records.forEach((r) => {
    const d = parseDateStr(getRecordDateKey(r))
    const weekday = d.getDay()
    if (weekday === 0 || weekday === 6) weekend += getRecordStep(r)
    else workday += getRecordStep(r)
  })
  return [
    { name: '工作日', value: workday },
    { name: '周末', value: weekend },
  ]
}

function buildIntervalDistributionData(records) {
  const withTs = records
    .filter((r) => Number.isFinite(Number(r?.createTime)))
    .map((r) => ({ ts: Number(r.createTime) }))
    .sort((a, b) => a.ts - b.ts)
  const result = [
    { label: '<=5秒', count: 0 },
    { label: '5-30秒', count: 0 },
    { label: '30秒-2分', count: 0 },
    { label: '2-10分', count: 0 },
    { label: '10分-1小时', count: 0 },
    { label: '>1小时', count: 0 },
  ]
  for (let i = 1; i < withTs.length; i++) {
    const diffSec = (withTs[i].ts - withTs[i - 1].ts) / 1000
    if (diffSec <= 5) result[0].count += 1
    else if (diffSec <= 30) result[1].count += 1
    else if (diffSec <= 120) result[2].count += 1
    else if (diffSec <= 600) result[3].count += 1
    else if (diffSec <= 3600) result[4].count += 1
    else result[5].count += 1
  }
  return result
}

function getHeatColor(count, maxCount, isDark) {
  if (maxCount <= 0 || count <= 0) return isDark ? '#2a2a3e' : '#f1efff'
  const ratio = count / maxCount
  if (isDark) {
    if (ratio >= 0.8) return '#8e7dff'
    if (ratio >= 0.6) return '#7a69f0'
    if (ratio >= 0.4) return '#6657c8'
    if (ratio >= 0.2) return '#4d4587'
    return '#3a365f'
  }
  if (ratio >= 0.8) return '#6C63FF'
  if (ratio >= 0.6) return '#837aff'
  if (ratio >= 0.4) return '#a59fff'
  if (ratio >= 0.2) return '#c7c3ff'
  return '#dfdcff'
}

function getGithubHeatColor(count, maxCount, isDark) {
  if (maxCount <= 0 || count <= 0) return isDark ? '#2a2339' : '#ede9ff'
  const ratio = count / maxCount
  if (isDark) {
    if (ratio >= 0.75) return '#9a86ff'
    if (ratio >= 0.5) return '#765ac0'
    if (ratio >= 0.25) return '#574287'
    return '#3a2f59'
  }
  if (ratio >= 0.75) return '#6c63ff'
  if (ratio >= 0.5) return '#907bff'
  if (ratio >= 0.25) return '#b5a7ff'
  return '#d4ccff'
}

function buildGithubCalendarData(records, days = 365) {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)

  const countMap = {}
  records.forEach((r) => {
    const key = getRecordDateKey(r)
    const d = parseDateStr(key)
    d.setHours(0, 0, 0, 0)
    if (d < start || d > end) return
    countMap[key] = (countMap[key] || 0) + getRecordStep(r)
  })

  const dayItems = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const d = new Date(cursor)
    const key = formatDate(d)
    dayItems.push({
      date: key,
      day: d.getDay(),
      month: d.getMonth(),
      dateNum: d.getDate(),
      count: countMap[key] || 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const padStart = start.getDay()
  const cells = [...Array.from({ length: padStart }, () => null), ...dayItems]
  const weekCount = Math.ceil(cells.length / 7)
  const weeks = Array.from({ length: weekCount }, (_, idx) => {
    const chunk = cells.slice(idx * 7, idx * 7 + 7)
    while (chunk.length < 7) chunk.push(null)
    return chunk
  })

  const monthLabels = []
  let lastMonth = null
  weeks.forEach((week, col) => {
    const firstDay = week.find((item) => item !== null)
    if (!firstDay) return
    if (firstDay.dateNum <= 7 && firstDay.month !== lastMonth) {
      monthLabels.push({ label: `${firstDay.month + 1}月`, col })
      lastMonth = firstDay.month
    }
  })

  const maxCount = Math.max(...dayItems.map((d) => d.count), 0)
  return { weeks, monthLabels, maxCount }
}

export default function CounterAdvancedStats() {
  const navigate = useNavigate()
  const { isInApp, setTitle, callNative } = useNativeBridge()

  const [rangeDays, setRangeDays] = useState(90)
  const defaultRange = useMemo(() => getDefaultDateRange(90), [])
  const [records, setRecords] = useState([])
  const [dailyGoal, setDailyGoal] = useState(10)
  const [totalGoal, setTotalGoal] = useState(100)
  const [showUnit, setShowUnit] = useState(false)
  const [unitName, setUnitName] = useState('次')
  const [isDark, setIsDark] = useState(false)
  const [useDemoData, setUseDemoData] = useState(false)
  const [rangeMode, setRangeMode] = useState('quick')
  const [customStartDate, setCustomStartDate] = useState(() => formatDate(defaultRange.start))
  const [customEndDate, setCustomEndDate] = useState(() => formatDate(defaultRange.end))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = '高级统计'
    if (isInApp) setTitle('高级统计')
  }, [isInApp, setTitle])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (!isInApp) {
          let localUseDemoData = false
          const raw = window.localStorage.getItem(WEB_SETTINGS_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed) {
              if (parsed.dailyGoal) setDailyGoal(Math.max(1, parseInt(parsed.dailyGoal) || 10))
              if (parsed.totalGoal) setTotalGoal(Math.max(1, parseInt(parsed.totalGoal) || 100))
              if (typeof parsed.showUnit === 'boolean') setShowUnit(parsed.showUnit)
              if (typeof parsed.unitName === 'string') setUnitName(parsed.unitName || '次')
              if (typeof parsed.darkMode === 'boolean') setIsDark(parsed.darkMode)
              if (typeof parsed.useDemoData === 'boolean') {
                localUseDemoData = parsed.useDemoData
                setUseDemoData(parsed.useDemoData)
              }
            }
          }
          setRecords(localUseDemoData ? buildMockRecords() : [])
          return
        }
        const settings = await callNative('counter.getSettings', {})
        if (settings) {
          if (settings.dailyGoal) setDailyGoal(Math.max(1, parseInt(settings.dailyGoal) || 10))
          if (settings.totalGoal) setTotalGoal(Math.max(1, parseInt(settings.totalGoal) || 100))
          if (typeof settings.showUnit === 'boolean') setShowUnit(settings.showUnit)
          if (typeof settings.unitName === 'string') setUnitName(settings.unitName || '次')
          if (typeof settings.darkMode === 'boolean') setIsDark(settings.darkMode)
          if (typeof settings.useDemoData === 'boolean') setUseDemoData(settings.useDemoData)
          if (settings.useDemoData) {
            setRecords(buildMockRecords())
            return
          }
        }
        const now = new Date()
        const start = new Date(now)
        start.setDate(start.getDate() - 364)
        const res = await callNative('counter.getRecords', {
          startDate: formatDate(start),
          endDate: formatDate(now),
        })
        const list = Array.isArray(res?.records) ? res.records : []
        setRecords(list)
      } catch (_) {
        setRecords(useDemoData ? buildMockRecords() : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isInApp, callNative, useDemoData])

  const displayUnit = (unitName && unitName.trim()) ? unitName.trim() : '次'

  const rangeOptions = [
    { key: 7, label: '7天' },
    { key: 30, label: '30天' },
    { key: 90, label: '90天' },
    { key: 365, label: '365天' },
  ]

  const activeRange = useMemo(() => {
    if (rangeMode !== 'custom') return getDefaultDateRange(rangeDays)
    const startRaw = parseDateStr(customStartDate)
    const endRaw = parseDateStr(customEndDate)
    const start = startRaw <= endRaw ? startRaw : endRaw
    const end = startRaw <= endRaw ? endRaw : startRaw
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [rangeMode, rangeDays, customStartDate, customEndDate])

  const daysInRange = useMemo(() => diffDaysInclusive(activeRange.start, activeRange.end), [activeRange])

  const filteredRecords = useMemo(() => {
    return filterRecordsByRange(records, activeRange.start, activeRange.end)
  }, [records, activeRange])

  const previousRecords = useMemo(() => {
    const prevEnd = new Date(activeRange.start)
    prevEnd.setDate(prevEnd.getDate() - 1)
    prevEnd.setHours(23, 59, 59, 999)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - (daysInRange - 1))
    prevStart.setHours(0, 0, 0, 0)
    return filterRecordsByRange(records, prevStart, prevEnd)
  }, [records, activeRange, daysInRange])

  const dailyTotals = useMemo(() => buildDailyTotalsByDateRange(filteredRecords, activeRange.start, activeRange.end), [filteredRecords, activeRange])
  const hourlyData = useMemo(() => buildHourlyData(filteredRecords), [filteredRecords])
  const minuteBucketData = useMemo(() => buildMinuteBucketData(filteredRecords, 10), [filteredRecords])
  const weekdayData = useMemo(() => buildWeekdayData(filteredRecords), [filteredRecords])
  const stepData = useMemo(() => buildStepData(filteredRecords), [filteredRecords])
  const cumulativeData = useMemo(() => buildCumulativeData(dailyTotals), [dailyTotals])
  const workdayWeekendData = useMemo(() => buildWorkdayWeekendData(filteredRecords), [filteredRecords])
  const intervalData = useMemo(() => buildIntervalDistributionData(filteredRecords), [filteredRecords])
  const compareData = useMemo(() => ([
    { period: '本期', value: filteredRecords.reduce((sum, r) => sum + getRecordStep(r), 0) },
    { period: '上期', value: previousRecords.reduce((sum, r) => sum + getRecordStep(r), 0) },
  ]), [filteredRecords, previousRecords])

  const total = useMemo(() => filteredRecords.reduce((sum, r) => sum + getRecordStep(r), 0), [filteredRecords])
  const prevTotal = useMemo(() => previousRecords.reduce((sum, r) => sum + getRecordStep(r), 0), [previousRecords])
  const streakInfo = useMemo(() => calcStreakInfo(dailyTotals, dailyGoal), [dailyTotals, dailyGoal])
  const achievedDays = useMemo(() => dailyTotals.filter((d) => d.count >= dailyGoal).length, [dailyTotals, dailyGoal])
  const activeDays = useMemo(() => dailyTotals.filter((d) => d.count > 0).length, [dailyTotals])
  const dailyAvg = Math.round(total / daysInRange)
  const completionRate = Math.round((achievedDays / daysInRange) * 100)
  const growthRate = (() => {
    if (prevTotal === 0 && total === 0) return 0
    if (prevTotal === 0) return 100
    return Math.round(((total - prevTotal) / prevTotal) * 100)
  })()
  const totalGoalRate = Math.min(999, Math.round((total / Math.max(1, totalGoal)) * 100))
  const withTimestampCount = useMemo(() => filteredRecords.filter((r) => Number.isFinite(Number(r?.createTime))).length, [filteredRecords])
  const intervalCoverage = filteredRecords.length > 0 ? Math.round((withTimestampCount / filteredRecords.length) * 100) : 0
  const maxDailyCount = useMemo(() => Math.max(...dailyTotals.map((d) => d.count), 0), [dailyTotals])
  const githubCalendar = useMemo(() => buildGithubCalendarData(records, 365), [records])

  const pageBg = isDark ? '#0d0d18' : '#f5f4ff'
  const headerBg = isDark ? 'rgba(13,13,24,0.92)' : 'rgba(245,244,255,0.92)'
  const cardBg = isDark ? '#16162a' : '#ffffff'
  const cardSoftBg = isDark ? '#25253a' : '#f7f6ff'
  const textPrimary = isDark ? '#c4beff' : '#2f2a7a'
  const textSecondary = isDark ? '#8f89d1' : '#8a84cc'
  const accent = '#6C63FF'
  const chartAlt = isDark ? '#332f5f' : '#DDD8FF'
  const pieColors = isDark ? ['#8e7dff', '#5f54a8'] : ['#6C63FF', '#9FA8FF']
  const borderSoft = isDark ? '#3a365f' : '#d8d4ff'
  const buttonSoftBg = isDark ? '#2a2a3e' : '#ebe9ff'
  const buttonSoftText = isDark ? '#b7b1ff' : '#7a75d6'
  const gridLine = isDark ? '#2d2d45' : '#f0efff'

  return (
    <div className="min-h-screen px-4 pb-10" style={{ background: pageBg }}>
      <div className="sticky top-0 z-20 py-4" style={{ background: headerBg, backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/habit/counter')}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: buttonSoftBg, color: buttonSoftText }}
          >
            返回
          </button>
          <div className="text-sm font-semibold" style={{ color: textPrimary }}>高级统计</div>
          <div className="w-12" />
        </div>
      </div>

      <div className="overflow-x-auto mb-3">
        <div className="flex gap-2 w-max pr-2">
          {rangeOptions.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setRangeMode('quick')
                setRangeDays(item.key)
                const next = getDefaultDateRange(item.key)
                setCustomStartDate(formatDate(next.start))
                setCustomEndDate(formatDate(next.end))
              }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: rangeMode === 'quick' && rangeDays === item.key ? accent : 'transparent',
                color: rangeMode === 'quick' && rangeDays === item.key ? '#fff' : textSecondary,
                border: `1px solid ${rangeMode === 'quick' && rangeDays === item.key ? accent : borderSoft}`,
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setRangeMode('custom')}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: rangeMode === 'custom' ? accent : 'transparent',
              color: rangeMode === 'custom' ? '#fff' : textSecondary,
              border: `1px solid ${rangeMode === 'custom' ? accent : borderSoft}`,
            }}
          >
            自定义
          </button>
        </div>
      </div>
      {rangeMode === 'custom' && (
        <div className="rounded-2xl p-3 mb-4" style={{ background: cardBg }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs mb-1" style={{ color: textSecondary }}>开始日期</div>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: `1px solid ${borderSoft}`, color: textPrimary, background: isDark ? '#202034' : '#fff' }}
              />
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: textSecondary }}>结束日期</div>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: `1px solid ${borderSoft}`, color: textPrimary, background: isDark ? '#202034' : '#fff' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-3 mb-4" style={{ background: cardBg }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl px-3 py-2" style={{ background: cardSoftBg }}>
            <div className="text-xs" style={{ color: textSecondary }}>每日目标</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: textPrimary }}>{dailyGoal}{showUnit ? ` ${displayUnit}` : ''}</div>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: cardSoftBg }}>
            <div className="text-xs" style={{ color: textSecondary }}>总目标</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: textPrimary }}>{totalGoal}{showUnit ? ` ${displayUnit}` : ''}</div>
          </div>
        </div>
        <div className="text-xs mt-2" style={{ color: textSecondary }}>
          目标仅在计数器首页设置中修改，高级统计页只读展示。
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>区间累计</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{total}{showUnit ? ` ${displayUnit}` : ''}</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>区间日均</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{dailyAvg}{showUnit ? ` ${displayUnit}` : ''}</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>目标达标率</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{completionRate}%</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>对比上期</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{growthRate > 0 ? '+' : ''}{growthRate}%</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>覆盖天数</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{daysInRange} 天</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>秒级覆盖</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{intervalCoverage}%</div>
        </div>
        <div className="rounded-2xl p-3" style={{ background: cardBg }}>
          <div className="text-xs" style={{ color: textSecondary }}>总目标达成</div>
          <div className="text-xl font-semibold mt-1" style={{ color: textPrimary }}>{totalGoalRate}%</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-sm" style={{ color: textSecondary }}>加载中...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>趋势与目标线</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTotals} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                  <XAxis dataKey="day" interval={daysInRange >= 90 ? 8 : daysInRange >= 30 ? 4 : 0} tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '当日']} />
                  <ReferenceLine y={dailyGoal} stroke="#ff7a7a" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="count" stroke={accent} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>累计曲线</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                  <XAxis dataKey="day" interval={daysInRange >= 90 ? 8 : daysInRange >= 30 ? 4 : 0} tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '累计']} />
                  <ReferenceLine y={totalGoal} stroke="#4cc9a6" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="cumulative" stroke={accent} fill={chartAlt} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>周内模式</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '总量']} />
                  <Bar dataKey="count" fill={accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: cardBg }}>
              <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>工作日 vs 周末</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={workdayWeekendData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72}>
                      {workdayWeekendData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '总量']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: cardBg }}>
              <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>步长使用分布</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="step" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(val) => [`${val} 下`, '点击次数']} />
                    <Bar dataKey="count" fill={accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: cardBg }}>
              <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>分钟分布（10分钟桶）</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={minuteBucketData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="bucket" interval={1} tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '总量']} />
                    <Bar dataKey="count" fill={accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: cardBg }}>
              <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>点击间隔分布（秒级）</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intervalData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(val) => [`${val} 次`, '相邻点击']} />
                    <Bar dataKey="count" fill={accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>本期 vs 上期</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '累计']} />
                  <Bar dataKey="value" fill={accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>时段热度</div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="hour" interval={3} tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textSecondary }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => [showUnit ? `${val} ${displayUnit}` : `${val}`, '总量']} />
                  <Bar dataKey="count" fill={accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>目标与连续性</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: cardSoftBg }}>
                <div className="text-xs" style={{ color: textSecondary }}>当前连胜</div>
                <div className="text-lg font-semibold mt-1" style={{ color: textPrimary }}>{streakInfo.currentStreak} 天</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: cardSoftBg }}>
                <div className="text-xs" style={{ color: textSecondary }}>最长连胜</div>
                <div className="text-lg font-semibold mt-1" style={{ color: textPrimary }}>{streakInfo.longestStreak} 天</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: cardSoftBg }}>
                <div className="text-xs" style={{ color: textSecondary }}>达标天数</div>
                <div className="text-lg font-semibold mt-1" style={{ color: textPrimary }}>{achievedDays}/{daysInRange}</div>
              </div>
              <div className="rounded-xl p-3" style={{ background: cardSoftBg }}>
                <div className="text-xs" style={{ color: textSecondary }}>活跃天数</div>
                <div className="text-lg font-semibold mt-1" style={{ color: textPrimary }}>{activeDays}/{daysInRange}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>活跃日历热度</div>
            <div className="grid grid-cols-7 gap-1">
              {dailyTotals.map((item) => (
                <div
                  key={item.date}
                  className="h-8 rounded flex items-center justify-center text-[10px]"
                  style={{ background: getHeatColor(item.count, maxDailyCount, isDark), color: item.count > 0 ? '#fff' : textSecondary }}
                  title={`${item.date}: ${item.count}${showUnit ? ` ${displayUnit}` : ''}`}
                >
                  {item.date.slice(8)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: cardBg }}>
            <div className="text-sm font-medium mb-2" style={{ color: textPrimary }}>GitHub 风格活跃图（近365天）</div>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-max">
                <div className="relative h-4 mb-1">
                  {githubCalendar.monthLabels.map((m) => (
                    <span
                      key={`${m.label}-${m.col}`}
                      className="absolute text-[10px]"
                      style={{ left: `${m.col * 13}px`, color: textSecondary }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <div className="flex flex-col justify-between pr-1 text-[10px]" style={{ color: textSecondary, height: 84 }}>
                    <span>一</span>
                    <span>三</span>
                    <span>五</span>
                  </div>
                  <div className="flex gap-[3px]">
                    {githubCalendar.weeks.map((week, colIdx) => (
                      <div key={`week-${colIdx}`} className="grid grid-rows-7 gap-[3px]">
                        {week.map((cell, rowIdx) => (
                          <div
                            key={`cell-${colIdx}-${rowIdx}`}
                            className="w-[10px] h-[10px] rounded-[2px]"
                            style={{
                              background: cell ? getGithubHeatColor(cell.count, githubCalendar.maxCount, isDark) : 'transparent',
                            }}
                            title={cell ? `${cell.date}: ${cell.count}${showUnit ? ` ${displayUnit}` : ''}` : ''}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 text-xs" style={{ background: cardBg, color: textSecondary }}>
            秒级维度依赖 createTime 精度。若关闭“每次点击生成记录”，间隔分析的参考意义会降低，但分钟/小时/天等聚合维度仍然有效。
          </div>
        </div>
      )}
    </div>
  )
}
