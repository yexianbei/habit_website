/**
 * 指尖计数器主功能页
 * 功能：极简计数 / 全屏模式 / 黑夜模式 / 自定义步长 / 震动反馈 / 统计分析
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { resolveFingerCounterHabitId } from '../../utils/platformHabitExists'
import {
  fetchCounterSettingsViaEventAttr,
  saveCounterSettingsViaEventAttr,
  fetchTodayCounterTotalViaEventAttr,
  saveCounterIncrementViaEventAttr,
  deleteCounterLogsForDateViaEventAttr,
} from '../../utils/counterEventAttr'
import { shouldEnableH5DayStats, updateH5DayStatsAfterCheckinViaEventAttr } from '../../utils/h5DayStats'

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
// 设置抽屉子组件
// ─────────────────────────────────────────────

function SettingsDrawer({
  visible,
  onClose,
  step,
  onStepChange,
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

        {/* 每日目标 / 总目标 / 震动反馈：暂不开放，恢复时取消注释
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
        */}

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

        {/* 首页显示总目标进度：暂不开放，恢复时取消注释
        <div className="flex items-center justify-between py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>首页显示总目标进度</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>在习惯列表卡片上展示累计进度（依赖客户端展示配置）</p>
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
        */}

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
    closePage,
    callNative,
  } = useNativeBridge()
  const resolveCounterHabitId = useCallback(
    () => resolveFingerCounterHabitId(callNative),
    [callNative],
  )
  const { deleteHabit, isDeleting } = useHabitDelete({
    name: '指尖计数器',
    resolveHabitId: resolveCounterHabitId,
  })

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
  const [showSettings, setShowSettings] = useState(false)
  const [enableH5DayStats, setEnableH5DayStats] = useState(false)
  const displayConfigRef = useRef(null)
  const settingsLoadedRef = useRef(false)

  const pageTitle = '指尖计数器'
  useEffect(() => { document.title = pageTitle }, [])
  useEffect(() => { if (isInApp) setTitle(pageTitle) }, [isInApp, setTitle])

  useEffect(() => {
    if (settingsLoadedRef.current) return
    settingsLoadedRef.current = true
    const rafId = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        // 优先从原生属性系统加载设置（跨设备同步），再加载今日计数
        loadSettings()
          .finally(() => loadTodayCount())
      }, 280)
    })
    return () => {
      window.cancelAnimationFrame(rafId)
    }
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
    })
  }, [step, vibrationEnabled, isDark, isFullScreen, perClickRecord, showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress])

  const loadSettings = async () => {
    try {
      const hid = await resolveCounterHabitId()
      const res = await fetchCounterSettingsViaEventAttr(callNative, hid)
      if (res) {
        if (res.step !== undefined && res.step !== null) {
          const s = parseInt(res.step, 10)
          if (!Number.isNaN(s)) setStep(Math.max(1, s))
        }
        if (typeof res.vibrationEnabled === 'boolean') setVibrationEnabled(res.vibrationEnabled)
        if (typeof res.darkMode === 'boolean') setIsDark(res.darkMode)
        if (typeof res.isFullScreen === 'boolean') setIsFullScreen(res.isFullScreen)
        if (typeof res.perClickRecord === 'boolean') setPerClickRecord(res.perClickRecord)
        if (typeof res.showUnit === 'boolean') setShowUnit(res.showUnit)
        if (typeof res.unitName === 'string') setUnitName(res.unitName)
        if (res.dailyGoal) setDailyGoal(Math.max(1, parseInt(res.dailyGoal, 10) || 10))
        if (res.totalGoal) setTotalGoal(Math.max(1, parseInt(res.totalGoal, 10) || 100))
        if (typeof res.showHomeGoalProgress === 'boolean') setShowHomeGoalProgress(res.showHomeGoalProgress)
      }

      // H5 独立口径：只有当 displayConfig 明确配置需要“坚持/连续天数”时，才维护 h5_* 天数属性
      // 目前最小开关：displayConfig.subtitleDisplayMode === 'days'（其它习惯可复用同一规则）
      try {
        const detail = await callNative('habit.getDetail', { habitId: hid })
        const cv = detail?.habit?.conditionValue
        let displayConfig = cv?.displayConfig || detail?.habit?.displayConfig
        // 根因修复：老版本创建的计数器没有声明 days 副标题配置，导致天数维护永远 disabled。
        // 这里做一次 schema 迁移，把配置补到 conditionValue.displayConfig.subtitleDisplayMode=days。
        const presentationKind = cv?.presentationKind || detail?.habit?.presentationKind
        const habitSubType = cv?.habitSubType || detail?.habit?.habitSubType
        const isCounterHabit = presentationKind === 'counter' || habitSubType === 'finger_counter'
        if (isCounterHabit && !displayConfig?.subtitleDisplayMode) {
          try {
            await callNative('habit.update', {
              habitId: hid,
              conditionValue: {
                displayConfig: {
                  subtitleDisplayMode: 'days',
                },
              },
            })
            displayConfig = {
              ...(displayConfig || {}),
              subtitleDisplayMode: 'days',
            }
            console.log('[CounterManagement][H5DayStats] migration: set subtitleDisplayMode=days')
          } catch (e) {
            console.log('[CounterManagement][H5DayStats] migration failed:', e)
          }
        }
        displayConfigRef.current = displayConfig || null
        const enabled = shouldEnableH5DayStats(displayConfig)
        console.log('[CounterManagement][H5DayStats] displayConfig=', displayConfig ? JSON.stringify(displayConfig) : 'null')
        if (!enabled) {
          const mode = displayConfig?.subtitleDisplayMode
          const sourceList = []
          const lo = displayConfig?.layoutOverrides
          if (lo && typeof lo === 'object') {
            Object.keys(lo).forEach((layoutKey) => {
              const slots = lo[layoutKey]
              if (!slots || typeof slots !== 'object') return
              Object.keys(slots).forEach((slotKey) => {
                sourceList.push(`${layoutKey}.${slotKey}:${slots[slotKey]?.source || ''}`)
              })
            })
          }
          console.log('[CounterManagement][H5DayStats] disabled reason: subtitleDisplayMode=', mode || '')
          console.log('[CounterManagement][H5DayStats] disabled reason: layoutSources=', sourceList.join('|'))
        }
        console.log('[CounterManagement][H5DayStats] enabled=', enabled)
        setEnableH5DayStats(enabled)
      } catch (e) {
        // 取不到配置时默认不启用，避免影响其它业务/习惯
        console.log('[CounterManagement][H5DayStats] load displayConfig failed, disable. err=', e)
        displayConfigRef.current = null
        setEnableH5DayStats(false)
      }
    } catch (e) {
      console.error('[CounterManagement] loadSettings error:', e)
    }
  }

  const loadTodayCount = async () => {
    try {
      if (!isInApp) return
      const today = todayStr()
      const hid = await resolveCounterHabitId()
      const todayTotal = await fetchTodayCounterTotalViaEventAttr(callNative, today, hid)
      setCount(todayTotal)
      writeWebTodayCount(todayTotal)
    } catch (e) {
      console.error('[CounterManagement] loadTodayCount error:', e)
    }
  }

  // ── 计数核心逻辑 ──
  const handleAdd = useCallback(async () => {
    const newCount = count + step
    setCount(newCount)
    writeWebTodayCount(newCount)

    // 震动反馈暂不开放（与设置项一同恢复）
    // if (vibrationEnabled) {
    //   try { vibrate('light') } catch (_) {}
    // }

    if (!isInApp) return

    try {
      const hid = await resolveCounterHabitId()
      await saveCounterIncrementViaEventAttr(callNative, {
        date: todayStr(),
        step,
        perClickRecord,
        habitId: hid,
      })
      if (enableH5DayStats) {
        console.log('[CounterManagement][H5DayStats] after checkin: updating h5_* attrs...')
        await updateH5DayStatsAfterCheckinViaEventAttr(callNative, {
          date: todayStr(),
          habitId: hid,
          enabled: true,
          displayConfig: displayConfigRef.current,
        })
        console.log('[CounterManagement][H5DayStats] update done')
      } else {
        console.log('[CounterManagement][H5DayStats] disabled, skip updating h5_* attrs')
      }
    } catch (e) {
      console.error('[CounterManagement] save error:', e)
    }
  }, [count, step, isInApp, callNative, perClickRecord, enableH5DayStats])

  // ── 重置今日 ──
  const handleReset = async () => {
    setCount(0)
    writeWebTodayCount(0)
    if (!isInApp) return
    try {
      await showLoading('重置中...')
      const hid = await resolveCounterHabitId()
      await deleteCounterLogsForDateViaEventAttr(callNative, todayStr(), hid)
      await hideLoading()
      await showToast('今日计数已清零')
    } catch (e) {
      await hideLoading()
      console.error('[CounterManagement] reset error:', e)
    }
  }

  // ── 保存设置（合并当前 state，避免单次只写部分字段覆盖原生其它配置）──
  const persistSettings = useCallback((patch = {}) => {
    if (!isInApp) return
    resolveCounterHabitId().then((hid) => {
    const payload = {
      step: patch.step !== undefined ? patch.step : step,
      vibrationEnabled: patch.vibrationEnabled !== undefined ? patch.vibrationEnabled : vibrationEnabled,
      darkMode: patch.darkMode !== undefined ? patch.darkMode : isDark,
      isFullScreen: patch.isFullScreen !== undefined ? patch.isFullScreen : isFullScreen,
      perClickRecord: patch.perClickRecord !== undefined ? patch.perClickRecord : perClickRecord,
      showUnit: patch.showUnit !== undefined ? patch.showUnit : showUnit,
      unitName: patch.unitName !== undefined ? patch.unitName : unitName,
      dailyGoal: patch.dailyGoal !== undefined ? patch.dailyGoal : dailyGoal,
      totalGoal: patch.totalGoal !== undefined ? patch.totalGoal : totalGoal,
      showHomeGoalProgress: patch.showHomeGoalProgress !== undefined ? patch.showHomeGoalProgress : showHomeGoalProgress,
    }
    saveCounterSettingsViaEventAttr(callNative, payload, hid).catch((e) => {
      console.error('[CounterManagement] persistSettings error:', e)
    })
    })
  }, [
    isInApp, callNative, resolveCounterHabitId, step, vibrationEnabled, isDark, isFullScreen, perClickRecord,
    showUnit, unitName, dailyGoal, totalGoal, showHomeGoalProgress,
  ])

  const handleStepChange = (newStep) => {
    setStep(newStep)
    persistSettings({ step: newStep })
  }

  const handleDailyGoalChange = (newGoal) => {
    const next = Math.max(1, parseInt(newGoal) || 1)
    setDailyGoal(next)
    persistSettings({ dailyGoal: next })
  }

  const handleTotalGoalChange = (newGoal) => {
    const next = Math.max(1, parseInt(newGoal) || 1)
    setTotalGoal(next)
    persistSettings({ totalGoal: next })
  }

  const handleVibrationToggle = () => {
    const next = !vibrationEnabled
    setVibrationEnabled(next)
    persistSettings({ vibrationEnabled: next })
  }

  const handleDarkToggle = () => {
    const next = !isDark
    setIsDark(next)
    persistSettings({ darkMode: next })
  }

  const handlePerClickRecordToggle = () => {
    const next = !perClickRecord
    setPerClickRecord(next)
    persistSettings({ perClickRecord: next })
  }

  const handleShowUnitToggle = () => {
    const next = !showUnit
    setShowUnit(next)
    persistSettings({ showUnit: next })
  }

  const handleShowHomeGoalProgressToggle = () => {
    const next = !showHomeGoalProgress
    setShowHomeGoalProgress(next)
    persistSettings({ showHomeGoalProgress: next })
  }

  const handleUnitNameChange = (val) => {
    setUnitName(val)
  }

  const handleUnitNameBlur = () => {
    persistSettings({ unitName })
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }


  const handleFullScreenToggle = () => {
    const next = !isFullScreen
    setIsFullScreen(next)
    if (next) setShowSettings(false)
    persistSettings({ isFullScreen: next })
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
            persistSettings({ isFullScreen: false })
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
            type="button"
            onClick={() => navigate('/habit/counter/stats')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: btnText }}
          >
            <span>📈</span> 统计
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleOpenSettings}
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
            onClick={deleteHabit}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: btnBg, color: isDark ? '#6b4444' : '#c8a0a0', opacity: isDeleting ? 0.6 : 1 }}
          >
            {isDeleting ? '删除中...' : '删除习惯'}
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
