/**
 * 指尖计数器主功能页
 * 功能：极简计数 / 全屏模式 / 黑夜模式 / 自定义步长 / 震动反馈 / 统计分析
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

/** 将 records 聚合成小时分布 */
function buildHourlyData(records) {
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}时`, count: 0 }))
  records.forEach((r) => {
    const h = tsToHour(r.createTime)
    buckets[h].count += r.step || 1
  })
  return buckets
}

/** 将 records 聚合成最近 7 天分布 */
function buildWeeklyData(records) {
  const map = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = formatDate(d)
    const label = i === 0 ? '今天' : `${d.getMonth() + 1}/${d.getDate()}`
    map[key] = { label, count: 0 }
  }
  records.forEach((r) => {
    const key = r.date || formatDate(new Date(r.createTime))
    if (map[key]) map[key].count += r.step || 1
  })
  return Object.values(map).map((v) => ({ day: v.label, count: v.count }))
}

/** mock 记录（浏览器预览用） */
function buildMockRecords() {
  const now = Date.now()
  const result = []
  for (let i = 0; i < 30; i++) {
    const offset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
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

// ─────────────────────────────────────────────
// 统计面板子组件
// ─────────────────────────────────────────────

function StatPanel({ records, isDark }) {
  const [tab, setTab] = useState('hourly')

  const hourlyData = useMemo(() => buildHourlyData(records), [records])
  const weeklyData = useMemo(() => buildWeeklyData(records), [records])

  const ACCENT = isDark ? '#7C6FD4' : '#6C63FF'
  const BG_COLOR = isDark ? '#1a1a2e' : '#F7F7FF'
  const TEXT_COLOR = isDark ? '#aaa' : '#666'
  const AXIS_COLOR = isDark ? '#444' : '#ccc'

  const chartData = tab === 'hourly' ? hourlyData : weeklyData
  const dataKey = tab === 'hourly' ? 'count' : 'count'
  const xKey = tab === 'hourly' ? 'hour' : 'day'

  const maxVal = Math.max(...chartData.map((d) => d[dataKey]), 1)

  return (
    <div
      className="rounded-2xl p-4 mt-4"
      style={{ background: BG_COLOR }}
    >
      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'hourly', label: '时段分布' },
          { key: 'weekly', label: '近7天' },
        ].map((t) => (
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

      {/* 图表 */}
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 9, fill: TEXT_COLOR }}
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              interval={tab === 'hourly' ? 3 : 0}
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
              formatter={(val) => [`${val} 次`, '计数']}
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

      {/* 今日汇总 */}
      {tab === 'hourly' && (() => {
        const todayRecords = records.filter((r) => r.date === todayStr())
        const total = todayRecords.reduce((s, r) => s + (r.step || 1), 0)
        const times = todayRecords.length
        const peakHour = hourlyData.reduce((best, cur) => cur.count > best.count ? cur : best, hourlyData[0])
        return (
          <div className="mt-3 flex gap-3 text-xs" style={{ color: TEXT_COLOR }}>
            <span>今日共 <strong style={{ color: ACCENT }}>{total}</strong> 次</span>
            <span>点击 <strong style={{ color: ACCENT }}>{times}</strong> 下</span>
            {peakHour.count > 0 && (
              <span>高峰 <strong style={{ color: ACCENT }}>{peakHour.hour}</strong></span>
            )}
          </div>
        )
      })()}
    </div>
  )
}

// ─────────────────────────────────────────────
// 设置抽屉子组件
// ─────────────────────────────────────────────

function SettingsDrawer({ visible, onClose, step, onStepChange, vibration, onVibrationToggle, isDark, onDarkToggle }) {
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
        <div className="flex items-center justify-between py-4">
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

        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────

export default function CounterManagement() {
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

  const [count, setCount] = useState(0)
  const [step, setStep] = useState(() => Math.max(1, parseInt(initialWebSettings.step) || 1))
  const [isDark, setIsDark] = useState(() => Boolean(initialWebSettings.darkMode))
  const [isFullScreen, setIsFullScreen] = useState(() => Boolean(initialWebSettings.isFullScreen))
  const [vibrationEnabled, setVibrationEnabled] = useState(() => (
    typeof initialWebSettings.vibrationEnabled === 'boolean' ? initialWebSettings.vibrationEnabled : true
  ))
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [allRecords, setAllRecords] = useState([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const settingsLoadedRef = useRef(false)

  const pageTitle = '指尖计数器'
  useEffect(() => { document.title = pageTitle }, [])
  useEffect(() => { if (isInApp) setTitle(pageTitle) }, [isInApp, setTitle])

  useEffect(() => {
    if (settingsLoadedRef.current) return
    settingsLoadedRef.current = true
    if (isInApp) loadSettings()
    loadRecords()
  }, [isInApp])

  useEffect(() => {
    writeWebSettings({
      step,
      vibrationEnabled,
      darkMode: isDark,
      isFullScreen,
    })
  }, [step, vibrationEnabled, isDark, isFullScreen])

  const loadSettings = async () => {
    try {
      const res = await callNative('counter.getSettings', {})
      if (res) {
        if (res.step) setStep(Math.max(1, parseInt(res.step) || 1))
        if (typeof res.vibrationEnabled === 'boolean') setVibrationEnabled(res.vibrationEnabled)
        if (typeof res.darkMode === 'boolean') setIsDark(res.darkMode)
        if (typeof res.isFullScreen === 'boolean') setIsFullScreen(res.isFullScreen)
      }
    } catch (e) {
      console.error('[CounterManagement] loadSettings error:', e)
    }
  }

  const loadRecords = async () => {
    setIsLoadingRecords(true)
    try {
      if (!isInApp) {
        setAllRecords(buildMockRecords())
        setIsLoadingRecords(false)
        return
      }
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 29)
      const res = await callNative('counter.getRecords', {
        startDate: formatDate(start),
        endDate: formatDate(now),
      })
      const list = Array.isArray(res?.records) ? res.records : []
      setAllRecords(list)

      // 今日累计
      const todayTotal = list
        .filter((r) => r.date === todayStr())
        .reduce((s, r) => s + (r.step || 1), 0)
      setCount(todayTotal)
    } catch (e) {
      console.error('[CounterManagement] loadRecords error:', e)
      if (!isInApp) setAllRecords(buildMockRecords())
    } finally {
      setIsLoadingRecords(false)
    }
  }

  // ── 计数核心逻辑 ──
  const handleAdd = useCallback(async () => {
    const newCount = count + step
    setCount(newCount)

    if (vibrationEnabled) {
      try { vibrate('light') } catch (_) {}
    }

    if (!isInApp) return

    try {
      const record = {
        date: todayStr(),
        step,
        count: newCount,
        createTime: Date.now(),
      }
      await callNative('counter.save', record)
      // 更新本地 records（追加，不重新拉取，避免闪烁）
      setAllRecords((prev) => [
        ...prev,
        { ...record, recordId: `local-${Date.now()}` },
      ])
    } catch (e) {
      console.error('[CounterManagement] save error:', e)
    }
  }, [count, step, vibrationEnabled, isInApp, callNative, vibrate])

  // ── 重置今日 ──
  const handleReset = async () => {
    setCount(0)
    if (!isInApp) return
    try {
      await showLoading('重置中...')
      await callNative('counter.resetToday', { date: todayStr() })
      await hideLoading()
      await showToast('今日计数已清零')
      setAllRecords((prev) => prev.filter((r) => r.date !== todayStr()))
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
    saveSettings({ step: newStep, vibrationEnabled, darkMode: isDark })
  }

  const handleVibrationToggle = () => {
    const next = !vibrationEnabled
    setVibrationEnabled(next)
    saveSettings({ step, vibrationEnabled: next, darkMode: isDark })
  }

  const handleDarkToggle = () => {
    const next = !isDark
    setIsDark(next)
    saveSettings({ step, vibrationEnabled, darkMode: next })
  }

  const handleFullScreenToggle = () => {
    setIsFullScreen((prev) => !prev)
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bg, transition: 'background 0.3s' }}
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

      <div
        className="flex items-center justify-between px-4 pt-4 pb-2 transition-opacity duration-300"
        style={{ opacity: isFullScreen ? 0.15 : 1 }}
        data-no-tap
      >
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: btnBg, color: btnText }}
        >
          <span>📊</span> 统计
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

      {/* ── 统计面板（可折叠） ── */}
      {showStats && !isFullScreen && (
        <div className="px-4" data-no-tap>
          {isLoadingRecords ? (
            <div className="text-center py-4 text-xs" style={{ color: textSecondary }}>加载中...</div>
          ) : (
            <StatPanel records={allRecords} isDark={isDark} />
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
          {count}
        </div>
        <div className="text-xs mb-8" style={{ color: textSecondary }}>
          今日累计 · 每次 +{step}
        </div>

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
          +{step}
        </button>
      </div>

      {/* ── 底部工具栏（全屏时半透明） ── */}
      <div
        className="flex items-center justify-center gap-3 px-4 pb-8 pt-2 flex-wrap transition-opacity duration-300"
        style={{ opacity: isFullScreen ? 0.15 : 1 }}
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
          onClick={() => handleDeleteHabit()}
          className="px-4 py-2 rounded-full text-xs font-medium"
          style={{ background: btnBg, color: isDark ? '#6b4444' : '#c8a0a0' }}
        >
          删除习惯
        </button>
      </div>

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
        vibration={vibrationEnabled}
        onVibrationToggle={handleVibrationToggle}
        isDark={isDark}
        onDarkToggle={handleDarkToggle}
      />
    </div>
  )
}
