import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const SLEEP_TYPE = 18

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const parseTime = (hhmm) => {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null
  const [h, m] = hhmm.split(':').map(Number)
  return { h, m }
}

const computeDurationMinutes = (startHHMM, endHHMM) => {
  const s = parseTime(startHHMM)
  const e = parseTime(endHHMM)
  if (!s || !e) return 0
  const start = new Date()
  start.setHours(s.h, s.m, 0, 0)
  const end = new Date()
  end.setHours(e.h, e.m, 0, 0)
  // 跨午夜处理：如果结束时间早于开始时间，视为次日
  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }
  const diffMs = end - start
  return Math.max(0, Math.round(diffMs / 60000))
}

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay() || 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const zhWeekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function SleepManagement() {
  const { isInApp, setTitle, showToast, showLoading, hideLoading, getHabitList, checkIn, getCheckInRecords } = useNativeBridge()
  const [habitId, setHabitId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sleepStart, setSleepStart] = useState('')
  const [sleepEnd, setSleepEnd] = useState('')
  const [loadingHabit, setLoadingHabit] = useState(true)
  const [chartData, setChartData] = useState([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const pageTitle = '睡眠管理'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    if (!isInApp) {
      setLoadingHabit(false)
      return
    }
    const init = async () => {
      try {
        setLoadingHabit(true)
        const result = await getHabitList({ type: SLEEP_TYPE })
        const id = result?.habits?.[0]?.habitId || result?.habits?.[0]?.id || null
        setHabitId(id)
      } catch (e) {
        console.error('[SleepManagement] 获取习惯失败:', e)
      } finally {
        setLoadingHabit(false)
      }
    }
    init()
  }, [isInApp])

  const handleSave = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (!habitId) {
      await showToast('请先添加睡眠管理习惯')
      return
    }
    if (!sleepStart || !sleepEnd) {
      await showToast('请填写睡觉与起床时间')
      return
    }
    const minutes = computeDurationMinutes(sleepStart, sleepEnd)
    try {
      await showLoading('保存中...')
      const details = {
        sleepStart,
        sleepEnd,
        durationMinutes: minutes,
      }
      await checkIn(habitId, {
        date: formatDate(selectedDate),
        signUpId: JSON.stringify(details),
      })
      await hideLoading()
      await showToast('保存成功')
      await loadWeeklyStats()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }

  const loadWeeklyStats = useCallback(async () => {
    if (!isInApp || !habitId) return
    setIsLoadingStats(true)
    try {
      // 本周范围（周一开始）
      const today = new Date()
      const thisMonday = getMonday(today)
      const lastMonday = addDays(thisMonday, -7)
      const thisSunday = addDays(thisMonday, 6)
      const startDate = formatDate(lastMonday)
      const endDate = formatDate(thisSunday)
      const res = await getCheckInRecords(habitId, startDate, endDate)
      const records = Array.isArray(res?.records) ? res.records : []
      const map = {}
      records.forEach(r => {
        const dateStr = formatDate(new Date(r.createTime))
        let d = {}
        try { d = JSON.parse(r.signUpId || '{}') } catch (_) {}
        const minutes = Number(d.durationMinutes || 0)
        map[dateStr] = minutes
      })
      const data = new Array(7).fill(0).map((_, i) => {
        const lastDate = addDays(lastMonday, i)
        const thisDate = addDays(thisMonday, i)
        const lastKey = formatDate(lastDate)
        const thisKey = formatDate(thisDate)
        const lastMinutes = map[lastKey] || 0
        const thisMinutes = map[thisKey] || 0
        return {
          name: zhWeekLabels[i],
          上周: +(lastMinutes / 60).toFixed(2),
          本周: +(thisMinutes / 60).toFixed(2),
        }
      })
      setChartData(data)
    } catch (e) {
      console.error('[SleepManagement] 加载统计失败:', e)
      setChartData([])
    } finally {
      setIsLoadingStats(false)
    }
  }, [isInApp, habitId])

  useEffect(() => {
    if (isInApp && habitId) {
      loadWeeklyStats()
    }
  }, [isInApp, habitId, loadWeeklyStats])

  const todayStatus = useMemo(() => {
    if (!chartData || chartData.length !== 7) {
      return { emoji: '🛌', main: '睡眠管理', sub: '记录睡觉与起床时间' }
    }
    const day = new Date().getDay()
    const idx = day === 0 ? 6 : day - 1
    const hours = chartData[idx]?.本周 || 0
    if (hours > 0) {
      return { emoji: '🌤️', main: `${hours.toFixed(2)} 小时`, sub: '昨夜睡眠' }
    }
    return { emoji: '🌙', main: '未记录', sub: '点击下方开始记录' }
  }, [chartData])

  const scrollToRecord = () => {
    const el = document.getElementById('record-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSelectedDate(new Date())
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
            <span className="text-5xl">🛌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">睡眠管理</h1>
          <p className="text-gray-500 mb-6">请在小习惯 App 内使用</p>
          <a href="https://apps.apple.com/app/id1455083310" 
             className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-400 to-sky-400 text-white rounded-xl font-medium shadow-lg shadow-emerald-200">
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  if (loadingHabit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div 
        className="px-6 pt-6 pb-8 relative z-10"
        style={{ background: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{todayStatus.emoji}</span>
              <span className="text-4xl font-bold">{todayStatus.main}</span>
            </div>
            <p className="text-white/80 text-sm">{todayStatus.sub}</p>
          </div>
          {!habitId && (
            <a 
              href="/habit/sleep/intro"
              className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm backdrop-blur-sm"
            >
              添加习惯
            </a>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          {[
            { icon: '🛌', label: '记睡眠', color: 'from-white/30 to-white/20', action: 'record' },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => scrollToRecord()}
              className={`flex-1 py-3 rounded-2xl bg-gradient-to-br ${item.color} backdrop-blur-sm text-white font-medium active:scale-95 transition-transform`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      <div className="px-4 -mt-4" id="record-card">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">🕒</span>
            今日睡眠记录
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">日期</span>
              <input 
                type="date" 
                value={formatDate(selectedDate)} 
                onChange={e => setSelectedDate(new Date(e.target.value))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">睡觉</span>
              <input 
                type="time" 
                value={sleepStart} 
                onChange={e => setSleepStart(e.target.value)} 
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">起床</span>
              <input 
                type="time" 
                value={sleepEnd} 
                onChange={e => setSleepEnd(e.target.value)} 
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
              <span className="text-sm text-gray-600">睡眠时长</span>
              <span className="text-base font-semibold text-emerald-600">
                {sleepStart && sleepEnd ? `${(computeDurationMinutes(sleepStart, sleepEnd)/60).toFixed(2)} 小时` : '--'}
              </span>
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSave}
                className="w-full py-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 text-white font-medium active:scale-95 transition-transform"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 pb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span>
            本周 vs 上周 睡眠时长对比
          </h3>
          {isLoadingStats ? (
            <div className="w-full h-48 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">暂无数据，先记录一次睡眠吧</div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="h" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="上周" fill="#A7F3D0" />
                  <Bar dataKey="本周" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
