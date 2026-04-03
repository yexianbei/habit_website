/**
 * 经期管理页面
 * 完整功能版 - 现代 UI 风格
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNativeBridge, useNativeEvent } from '../../utils/useNativeBridge'
import { useWechatShare } from '../../hooks/useShare'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { resolvePeriodHabitId } from '../../utils/platformHabitExists'
import {
  fetchPeriodSettings,
  fetchPeriodRecords,
  predictNextPeriod,
  savePeriodRecord,
  deletePeriodDay,
  updatePeriodSettings,
} from '../../utils/periodEventAttr'

// ============ 常量定义 ============

const PERIOD_STATUS = {
  NONE: 'none',
  PERIOD: 'period',
  PREDICTED: 'predicted',
  OVULATION: 'ovulation',
  FERTILE: 'fertile',
  LOVE: 'love',
}

const FLOW_OPTIONS = [
  { value: 1, label: '少', icon: '💧' },
  { value: 2, label: '中', icon: '💧💧' },
  { value: 3, label: '多', icon: '💧💧💧' },
]

const PAIN_OPTIONS = [
  { value: 0, label: '无', icon: '😊' },
  { value: 1, label: '轻度', icon: '😐' },
  { value: 2, label: '重度', icon: '😣' },
]

const COLOR_OPTIONS = [
  { value: 1, label: '鲜红', color: '#FF4D4D' },
  { value: 2, label: '深红', color: '#CC0000' },
  { value: 3, label: '褐色', color: '#8B4513' },
]

const MOOD_OPTIONS = [
  { value: 1, label: '开心', icon: '😊' },
  { value: 2, label: '平淡', icon: '😐' },
  { value: 3, label: '难过', icon: '😢' },
  { value: 4, label: '焦虑', icon: '😰' },
  { value: 5, label: '生气', icon: '😠' },
]

const CONTRACEPTION_OPTIONS = [
  { value: 0, label: '无措施' },
  { value: 1, label: '避孕套' },
  { value: 2, label: '体外' },
  { value: 3, label: '未射精' },
  { value: 4, label: '紧急药' },
  { value: 5, label: '短效药' },
  { value: 6, label: '长效药' },
  { value: 7, label: '节育环' },
  { value: 8, label: '其他' },
]

// ============ 工具函数 ============

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const parseDate = (str) => str ? new Date(str.replace(/-/g, '/')) : null

// 业务日优先：eventAttr.log.query 返回的 rec.date（YYYY-MM-DD）；兼容老数据回退 createTime。
const logBusinessDateStr = (log) => {
  if (log?.period && /^\d{4}-\d{2}-\d{2}$/.test(String(log.period))) {
    return String(log.period)
  }
  if (log?.date && /^\d{4}-\d{2}-\d{2}$/.test(String(log.date))) {
    return String(log.date)
  }
  return formatDate(new Date(log?.createTime || 0))
}

const logBusinessDate = (log) => parseDate(logBusinessDateStr(log))

const diffDays = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24))
}

/** 未选时间时：当天用当前时间，否则用当天 12:00（避免时区歧义） */
const getCreateTimeForDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()) {
    return Date.now()
  }
  return d.getTime()
}

// ============ 日历组件 ============

const Calendar = ({ currentMonth, setCurrentMonth, selectedDate, onDateSelect, periodLogs, predictions, config = { periodLen: 5 } }) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [slideDirection, setSlideDirection] = useState(null) // 'left' | 'right' | null
  const [isAnimating, setIsAnimating] = useState(false)
  const calendarSwipeRef = useRef(null)
  const touchStartPosRef = useRef({ x: null, y: null })

  // 最小滑动距离
  const minSwipeDistance = 50
  // 水平滑动判定阈值（超过此值且横向大于纵向时 preventDefault，避免触发 iOS 右滑返回）
  const horizontalClaimThreshold = 12
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    
    return days
  }
  
  const getDateInfo = useCallback((date) => {
    if (!date) return { status: PERIOD_STATUS.NONE, mood: null, hasLove: false }
    const dateStr = formatDate(date)
    const log = periodLogs.find(l => logBusinessDateStr(l) === dateStr)
    
    let status = PERIOD_STATUS.NONE
    let mood = null
    let hasLove = false
    
    // 1) 背景状态：经期仅由「经期记录」决定；排卵/预测由 predictions 决定，不因当日有心情/爱爱记录而丢失
    const hasExplicitPeriod = log && (() => {
      try {
        const d = JSON.parse(log.signUpId || '{}')
        return d.isPeriod === true
      } catch (e) { return false }
    })()
    if (hasExplicitPeriod) {
      status = PERIOD_STATUS.PERIOD
    } else if (predictions && predictions.hasData === true) {
      if (predictions.predictedDates?.includes(dateStr)) status = PERIOD_STATUS.PREDICTED
      else if (predictions.ovulationDate === dateStr) status = PERIOD_STATUS.OVULATION
      else if (predictions.fertileDates?.includes(dateStr)) status = PERIOD_STATUS.FERTILE
    }
    
    // 2) 心情、爱爱仅作为角标，从当日记录读取，不覆盖背景状态
    if (log) {
      try {
        const details = JSON.parse(log.signUpId || '{}')
        if (details.mood) mood = details.mood
        if (details.isLove || details.loveMeasure !== undefined) hasLove = true
      } catch (e) {}
    }
    
    return { status, mood, hasLove }
  }, [periodLogs, predictions])
  
  // 预计算所有经期周期的第一天
  const periodStartDatesSet = useMemo(() => {
    const set = new Set()
    
    // 1. 获取所有经期记录并按日期排序
    const sortedRecords = periodLogs
      .filter(log => {
        try {
          const details = JSON.parse(log.signUpId || '{}')
          return details.isPeriod === true
        } catch (e) { return false }
      })
      .map(log => ({
        date: logBusinessDate(log),
        dateStr: logBusinessDateStr(log),
      }))
      .sort((a, b) => a.date - b.date)

    if (sortedRecords.length === 0) return set

    // 2. 遍历记录，识别每个周期的第一天
    // 第一个记录肯定是第一天
    set.add(sortedRecords[0].dateStr)
    
    let lastRecord = sortedRecords[0]
    
    for (let i = 1; i < sortedRecords.length; i++) {
      const currentRecord = sortedRecords[i]
      const daysDiff = diffDays(currentRecord.date, lastRecord.date)
      
      // 如果间隔超过阈值（经期长度 + 2天缓冲），认为是新的周期
      // 这里的逻辑与 findContinuousPeriodGroup 保持一致
      if (daysDiff > (config.periodLen || 5) + 2) {
        set.add(currentRecord.dateStr)
      }
      
      // 更新 lastRecord 为当前记录，用于下一次比较
      // 注意：这里我们比较的是相邻的两个记录。
      // 如果是 3号(start), 7号。 7-3=4 <= 7。7号不是start。lastRecord更新为7号。
      // 如果后面还有 15号。 15-7=8 > 7。15号是start。
      lastRecord = currentRecord
    }
    
    return set
  }, [periodLogs, config.periodLen])
  
  // 触摸事件处理
  const onTouchStart = (e) => {
    setTouchEnd(null)
    const t = e.targetTouches[0]
    setTouchStart(t.clientX)
    touchStartPosRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    touchStartPosRef.current = { x: null, y: null }
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNextMonth()
    } else if (isRightSwipe) {
      goToPrevMonth()
    }
  }

  // 在日历区域水平滑动时 preventDefault，避免与 iOS 右滑返回冲突（需 passive: false）
  useEffect(() => {
    const el = calendarSwipeRef.current
    if (!el) return
    const onMove = (e) => {
      const start = touchStartPosRef.current
      if (start.x == null || start.y == null || !e.targetTouches[0]) return
      const dx = e.targetTouches[0].clientX - start.x
      const dy = e.targetTouches[0].clientY - start.y
      if (Math.abs(dx) > horizontalClaimThreshold && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault()
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [])
  
  const goToPrevMonth = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSlideDirection('right')
    
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
      setSlideDirection(null)
      setIsAnimating(false)
    }, 200)
  }
  
  const goToNextMonth = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSlideDirection('left')
    
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
      setSlideDirection(null)
      setIsAnimating(false)
    }, 200)
  }
  
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const todayStr = formatDate(new Date())
  const MOOD_ICONS = { 1: '😊', 2: '😐', 3: '😢', 4: '😰', 5: '😠' }
  
  // 动画类名
  const getAnimationClass = () => {
    if (slideDirection === 'left') return 'animate-slideOutLeft'
    if (slideDirection === 'right') return 'animate-slideOutRight'
    return 'animate-fadeIn'
  }
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm overflow-hidden">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={goToPrevMonth}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 active:bg-pink-100 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-800">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button 
          onClick={goToNextMonth}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 active:bg-pink-100 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* 可滑动的日期网格：水平滑动时 preventDefault 避免与 iOS 右滑返回冲突 */}
      <div
        ref={calendarSwipeRef}
        className="touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={`grid grid-cols-7 gap-1.5 transition-all duration-200 ${getAnimationClass()}`}>
          {days.map((date, index) => {
            if (!date) return <div key={index} className="aspect-square" />
            
            const dateStr = formatDate(date)
            const info = getDateInfo(date)
            const isSelected = selectedDate && dateStr === formatDate(selectedDate)
            const isToday = dateStr === todayStr
            
            // 判断是否为经期第一天
            const isPeriodStart = info.status === PERIOD_STATUS.PERIOD && periodStartDatesSet.has(dateStr)
            
            const statusStyles = {
              [PERIOD_STATUS.PERIOD]: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200',
              [PERIOD_STATUS.PREDICTED]: 'bg-pink-100 text-pink-600 border-2 border-dashed border-pink-300',
              [PERIOD_STATUS.OVULATION]: 'bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-md shadow-purple-200',
              [PERIOD_STATUS.FERTILE]: 'bg-purple-100 text-purple-600',
              [PERIOD_STATUS.LOVE]: 'bg-purple-100 text-purple-600',
            }
            
            const hasMood = info.mood
            const hasLove = info.hasLove
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative overflow-visible
                  transition-all duration-200 active:scale-95
                  ${statusStyles[info.status] || ''}
                  ${isToday && info.status === PERIOD_STATUS.NONE ? 'bg-gray-100 font-bold text-pink-500' : ''}
                  ${isSelected ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
                `}
              >
                <span className="font-medium">{date.getDate()}</span>
                {isPeriodStart && (
                  <span className="absolute bottom-0.5 text-[8px] leading-none opacity-90 scale-90 font-medium">
                    第一天
                  </span>
                )}
                {(hasMood || hasLove) && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-0.5 py-px border border-dashed border-gray-300/70 rounded text-[9px] leading-none drop-shadow-sm whitespace-nowrap">
                    {hasMood && <span>{MOOD_ICONS[info.mood]}</span>}
                    {hasLove && <span>❤️</span>}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 滑动提示 */}
      <div className="flex justify-center mt-3 mb-2">
        <span className="text-[10px] text-gray-300">← 左右滑动切换月份 →</span>
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-pink-500 to-rose-500" />
          <span className="text-xs text-gray-500">经期</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-pink-100 border border-dashed border-pink-300" />
          <span className="text-xs text-gray-500">预测</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-purple-100" />
          <span className="text-xs text-gray-500">排卵期</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-purple-500 to-violet-500" />
          <span className="text-xs text-gray-500">排卵日</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">😊</span>
          <span className="text-xs text-gray-500">心情</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">❤️</span>
          <span className="text-xs text-gray-500">爱爱</span>
        </div>
      </div>
    </div>
  )
}

// ============ 选择器组件 ============

const SelectorChip = ({ options, value, onChange, colorMode = false }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(value === opt.value ? null : opt.value)}
        className={`
          px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95
          ${value === opt.value 
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
        `}
        style={colorMode && opt.color && value === opt.value ? { 
          background: `linear-gradient(135deg, ${opt.color}, ${opt.color}dd)`,
        } : undefined}
      >
        {opt.icon && <span className="mr-1">{opt.icon}</span>}
        {opt.label}
      </button>
    ))}
  </div>
)

// ============ Toggle 组件 ============

const Toggle = ({ checked, onChange, color = 'pink' }) => {
  const colors = {
    pink: 'peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500',
    purple: 'peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-violet-500',
  }
  
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className={`
        w-12 h-7 bg-gray-200 rounded-full
        peer-focus:outline-none
        peer peer-checked:after:translate-x-5
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
        after:shadow-md
        ${colors[color]}
      `}></div>
    </label>
  )
}

// ============ 详情弹窗组件 ============

const MoodSection = ({ mood, setMood }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">今日心情</label>
    <SelectorChip options={MOOD_OPTIONS} value={mood} onChange={setMood} />
  </div>
)

const PeriodModal = ({ isOpen, onClose, selectedDate, existingLog, onSave, onDelete, isInitialized }) => {
  // 经期开关默认关闭，只有在有现有记录时才根据记录设置
  const [isPeriod, setIsPeriod] = useState(false)
  const [periodEnded, setPeriodEnded] = useState(false)
  const [periodStartTime, setPeriodStartTime] = useState('')
  const [periodEndTime, setPeriodEndTime] = useState('')
  const [flow, setFlow] = useState(null)
  const [pain, setPain] = useState(null)
  const [color, setColor] = useState(null)
  const [mood, setMood] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const now = new Date()
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    if (existingLog?.signUpId) {
      try {
        const d = JSON.parse(existingLog.signUpId)
        // 修复：只有明确标记为true的才是经期，不能用兼容逻辑推测
        setIsPeriod(d.isPeriod === true)
        setPeriodEnded(d.periodEnded || false)
        setPeriodStartTime(d.periodStartTime || nowTime)
        setPeriodEndTime(d.periodEndTime || nowTime)
        setFlow(d.flow || null)
        setPain(d.pain || null)
        setColor(d.color || null)
        setMood(d.mood || null)
      } catch (e) {
        // 解析失败时，默认关闭经期开关
        setIsPeriod(false)
        setPeriodEnded(false)
        setPeriodStartTime(nowTime)
        setPeriodEndTime(nowTime)
        setFlow(null); setPain(null); setColor(null); setMood(null)
      }
    } else {
      // 没有现有记录时，默认关闭经期开关
      setIsPeriod(false)
      setPeriodEnded(false)
      setPeriodStartTime(nowTime)
      setPeriodEndTime(nowTime)
      setFlow(null); setPain(null); setColor(null); setMood(null)
    }
  }, [isOpen, existingLog, isInitialized])

  const handleSave = () => {
    // 允许只记录心情：把 isPeriod 关掉即可
    if (!isPeriod && !mood) {
      if (existingLog) onDelete()
      else onClose()
      return
    }
    
    // 构建保存数据，明确不包含爱爱相关字段（因为这是经期记录弹窗，不是爱爱弹窗）
    const saveDateStr = formatDate(selectedDate)

    // createTime 优先使用 periodStartTime（用户明确设置了经期开始时间）
    // 没有经期时间时才退回"今天用当前时间、历史日期用正午"的默认逻辑
    let createTime
    if (isPeriod && periodStartTime) {
      createTime = new Date(saveDateStr + 'T' + periodStartTime + ':00').getTime()
    } else {
      createTime = getCreateTimeForDate(saveDateStr)
    }

    const saveData = {
      date: saveDateStr,
      saveType: 'period', // iOS 端根据此字段做字段分组合并，避免覆盖爱爱数据
      isPeriod,
      periodStartTime: isPeriod ? periodStartTime : null,
      periodEnded: isPeriod ? periodEnded : false,
      periodEndTime: isPeriod && periodEnded ? periodEndTime : null,
      flow: isPeriod ? flow : null,
      pain: isPeriod ? pain : null,
      color: isPeriod ? color : null,
      mood,
      createTime,
    }
    onSave(saveData)
  }

  if (!isOpen) return null
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center touch-none sm:touch-auto" 
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slideUp touch-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }} 
            className="text-gray-400 text-sm py-2 px-4 -ml-4"
          >
            取消
          </button>
          <span className="font-bold text-gray-800">{formatDate(selectedDate)}</span>
          <div className="flex gap-1">
            {existingLog && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete() }} 
                className="text-red-500 font-medium text-sm py-2 px-3"
              >
                删除
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleSave() }} 
              className="text-pink-500 font-medium text-sm py-2 px-3 -mr-3"
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                <span className="font-bold text-gray-800">经期</span>
              </div>
              <Toggle checked={isPeriod} onChange={(v) => { setIsPeriod(v); if (!v) setPeriodEnded(false) }} />
            </div>

            {isPeriod && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">开始时间</span>
                  <input type="time" value={periodStartTime} onChange={e => setPeriodStartTime(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-pink-100">
                  <span className="text-sm text-gray-600">经期结束</span>
                  <Toggle checked={periodEnded} onChange={setPeriodEnded} />
                </div>

                {periodEnded && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-16">结束时间</span>
                    <input type="time" value={periodEndTime} onChange={e => setPeriodEndTime(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm" />
                  </div>
                )}
              </div>
            )}
          </div>

          {isPeriod && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">流量</label>
                <SelectorChip options={FLOW_OPTIONS} value={flow} onChange={setFlow} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">痛经</label>
                <SelectorChip options={PAIN_OPTIONS} value={pain} onChange={setPain} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">颜色</label>
                <SelectorChip options={COLOR_OPTIONS} value={color} onChange={setColor} colorMode />
              </div>
            </div>
          )}

          <MoodSection mood={mood} setMood={setMood} />
        </div>
      </div>
    </div>
  )
}

const LoveModal = ({ isOpen, onClose, selectedDate, existingLog, onSave, onDelete }) => {
  const [loveMeasure, setLoveMeasure] = useState(null)
  const [loveTime, setLoveTime] = useState('')
  const [mood, setMood] = useState(null)
  const [loveDate, setLoveDate] = useState(new Date())

  useEffect(() => {
    if (!isOpen) return
    const now = new Date()
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // 设置默认日期为今天
    setLoveDate(new Date())
    
    if (existingLog?.signUpId) {
      try {
        const d = JSON.parse(existingLog.signUpId)
        // 不再需要 isLove 开关：只要走到这个弹窗并保存，就认为是爱爱
        setLoveMeasure(d.loveMeasure ?? null)
        setLoveTime(d.loveTime || nowTime)
        setMood(d.mood || null)
        // 如果有现有记录，使用记录的日期
        if (existingLog.createTime) {
          setLoveDate(new Date(existingLog.createTime))
        }
      } catch (e) {
        setLoveMeasure(null)
        setLoveTime(nowTime)
        setMood(null)
        setLoveDate(new Date())
      }
    } else {
      setLoveMeasure(null)
      setLoveTime(nowTime)
      setMood(null)
      setLoveDate(new Date())
    }
  }, [isOpen, existingLog])

  const handleSave = () => {
    // 如果完全没有填写（既没心情、也没时间与避孕信息），当作删除/取消
    if (!mood && !loveMeasure && !loveTime) {
      if (existingLog) onDelete()
      else onClose()
      return
    }
    const dateStr = formatDate(loveDate)
    const recordTime = new Date(dateStr + 'T' + (loveTime || '12:00') + ':00').getTime()
    onSave({
      date: dateStr,
      saveType: 'love', // iOS 端根据此字段做字段分组合并，避免覆盖经期数据
      createTime: recordTime,
      isLove: true,
      loveMeasure,
      loveTime,
      mood,
    })
  }

  if (!isOpen) return null
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center touch-none sm:touch-auto" 
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slideUp touch-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }} 
            className="text-gray-400 text-sm py-2 px-4 -ml-4"
          >
            取消
          </button>
          <span className="font-bold text-gray-800">{formatDate(loveDate)}</span>
          <div className="flex gap-1">
            {existingLog && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete() }} 
                className="text-red-500 font-medium text-sm py-2 px-3"
              >
                删除
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleSave() }} 
              className="text-purple-600 font-medium text-sm py-2 px-3 -mr-3"
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <span className="font-bold text-gray-800">爱爱</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">时间</span>
                <div className="flex-1 flex gap-2">
                  <input
                    type="date"
                    value={formatDate(loveDate)}
                    onChange={e => {
                      const selected = e.target.value ? new Date(e.target.value + 'T12:00:00') : new Date()
                      setLoveDate(selected)
                    }}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm min-w-0"
                    max={formatDate(new Date())}
                  />
                  <input
                    type="time"
                    value={loveTime}
                    onChange={e => setLoveTime(e.target.value)}
                    className="w-28 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">避孕措施</label>
                <SelectorChip options={CONTRACEPTION_OPTIONS} value={loveMeasure} onChange={setLoveMeasure} />
              </div>
            </div>
          </div>

          <MoodSection mood={mood} setMood={setMood} />
        </div>
      </div>
    </div>
  )
}

// ============ 心情独立弹窗（独立一条记录，可选日期）============

const MoodModal = ({ isOpen, onClose, selectedDate, existingLog, onSave, onDelete }) => {
  const [moodDate, setMoodDate] = useState(new Date())
  const [mood, setMood] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    if (existingLog?.signUpId) {
      try {
        const d = JSON.parse(existingLog.signUpId)
        setMood(d.mood ?? null)
        if (existingLog.createTime) {
          setMoodDate(new Date(existingLog.createTime))
        } else {
          setMoodDate(selectedDate ? new Date(selectedDate) : new Date())
        }
      } catch (e) {
        setMood(null)
        setMoodDate(selectedDate ? new Date(selectedDate) : new Date())
      }
    } else {
      setMood(null)
      setMoodDate(selectedDate ? new Date(selectedDate) : new Date())
    }
  }, [isOpen, existingLog, selectedDate])

  const handleSave = () => {
    if (mood == null) {
      if (existingLog) onDelete()
      else onClose()
      return
    }
    const dateStr = formatDate(moodDate)
    // 心情没有专属时间选择器：
    //   - 今天 → 使用当前时间（Date.now()），方便在时间轴上精确定位
    //   - 历史日期且有已有记录 → 沿用原记录时间，不改变时间轴位置
    //   - 历史日期且无已有记录 → 使用正午（12:00）
    let createTime
    if (existingLog?.createTime) {
      createTime = existingLog.createTime
    } else {
      createTime = getCreateTimeForDate(dateStr)
    }
    onSave({
      date: dateStr,
      saveType: 'mood', // iOS 端根据此字段做字段分组合并，仅更新 mood，不触碰经期/爱爱字段
      createTime,
      mood,
    })
  }

  if (!isOpen) return null
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center touch-none sm:touch-auto" 
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slideUp touch-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }} 
            className="text-gray-400 text-sm py-2 px-4 -ml-4"
          >
            取消
          </button>
          <span className="font-bold text-gray-800">{formatDate(moodDate)}</span>
          <div className="flex gap-1">
            {existingLog && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(formatDate(new Date(existingLog.createTime))) }} 
                className="text-red-500 font-medium text-sm py-2 px-3"
              >
                删除
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleSave() }} 
              className="text-amber-500 font-medium text-sm py-2 px-3 -mr-3"
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">😊</span>
              <span className="font-bold text-gray-800">记心情</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">日期</span>
              <input
                type="date"
                value={formatDate(moodDate)}
                onChange={e => {
                  const selected = e.target.value ? new Date(e.target.value + 'T12:00:00') : new Date()
                  setMoodDate(selected)
                }}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm min-w-0"
                max={formatDate(new Date())}
              />
            </div>
          </div>
          <MoodSection mood={mood} setMood={setMood} />
        </div>
      </div>
    </div>
  )
}

// ============ 设置弹窗组件 ============

const SettingsModal = ({ isOpen, onClose, config, onSave }) => {
  const [cycleLen, setCycleLen] = useState(28)
  const [periodLen, setPeriodLen] = useState(5)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderAdvance, setReminderAdvance] = useState(3)

  useEffect(() => {
    if (isOpen) {
      setCycleLen(config.cycleLen || 28)
      setPeriodLen(config.periodLen || 5)
      setReminderEnabled(config.reminderEnabled === true)
      const adv = Number(config.reminderAdvance)
      setReminderAdvance(Number.isFinite(adv) ? Math.min(7, Math.max(1, adv)) : 3)
    }
  }, [isOpen, config])
  
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 touch-none sm:touch-auto" 
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-sm p-6 animate-slideUp touch-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="font-bold text-xl text-gray-800">周期与提醒</h2>
        </div>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700">经期提醒</p>
              <p className="text-xs text-gray-400 mt-0.5">将偏好写入习惯配置（推送能力依赖系统与客户端）</p>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled((v) => !v)}
              className={`w-12 h-6 rounded-full relative transition-all ${reminderEnabled ? 'bg-pink-500' : 'bg-gray-200'}`}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: reminderEnabled ? '26px' : '2px' }}
              />
            </button>
          </div>
          {reminderEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">提前几天提醒</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={reminderAdvance}
                  onChange={(e) => setReminderAdvance(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-pink-500"
                />
                <span className="w-12 text-center font-bold text-pink-500">{reminderAdvance} 天</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">经期长度</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="2" max="10" value={periodLen} onChange={e => setPeriodLen(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
              <span className="w-12 text-center font-bold text-pink-500">{periodLen} 天</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">周期长度</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="21" max="45" value={cycleLen} onChange={e => setCycleLen(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
              <span className="w-12 text-center font-bold text-pink-500">{cycleLen} 天</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }} 
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium active:scale-98"
          >
            取消
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSave(cycleLen, periodLen, reminderEnabled, reminderAdvance) }}
            className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-pink-200 active:scale-98"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 最近记录组件 ============

const RecentRecords = ({ logs, onRecordClick }) => {
  const MAP_FLOW = { 1: '💧少', 2: '💧中', 3: '💧多' }
  const MAP_PAIN = { 0: '😊无痛', 1: '😐轻度', 2: '😣重度' }
  const MAP_MOOD = { 1: '😊开心', 2: '😐平淡', 3: '😢难过', 4: '😰焦虑', 5: '😠生气' }
  const MAP_LOVE = { 0: '无措施', 1: '套套', 2: '体外', 3: '未射', 4: '紧急药', 5: '短效药', 6: '长效药', 7: '节育环', 8: '其他' }
  
  const logsWithDetails = logs
    .filter(l => l.signUpId && l.signUpId !== '{}')
    .sort((a, b) => b.createTime - a.createTime)
    .slice(0, 8)
  
  if (logsWithDetails.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-400 text-sm">暂无记录</p>
        <p className="text-gray-300 text-xs mt-1">点击日历开始记录</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
        <span className="text-lg">📋</span>
        最近记录
      </h3>
      <div className="space-y-4">
        {logsWithDetails.map((log, idx) => {
          const date = logBusinessDate(log)
          let details = {}
          try { details = JSON.parse(log.signUpId) } catch (e) {}
          
          const tags = []
          if (details.flow) tags.push({ text: MAP_FLOW[details.flow], bg: 'from-blue-100 to-cyan-100', color: 'text-blue-600' })
          if (details.pain && details.pain !== 0) tags.push({ text: MAP_PAIN[details.pain], bg: 'from-red-100 to-rose-100', color: 'text-red-600' })
          if (details.mood) tags.push({ text: MAP_MOOD[details.mood], bg: 'from-amber-100 to-yellow-100', color: 'text-amber-600' })
          if (details.isLove || details.loveMeasure !== undefined) {
            tags.push({ text: `❤️ ${MAP_LOVE[details.loveMeasure] || '爱爱'}`, bg: 'from-purple-100 to-violet-100', color: 'text-purple-600' })
          }
          if (tags.length === 0) tags.push({ text: '✓ 已记录', bg: 'from-gray-100 to-slate-100', color: 'text-gray-500' })
          
          // 格式化日期显示：今天/昨天/具体日期
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const logDate = new Date(date)
          logDate.setHours(0, 0, 0, 0)
          const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24))
          
          let dateLabel = ''
          if (diffDays === 0) dateLabel = '今天'
          else if (diffDays === 1) dateLabel = '昨天'
          else if (diffDays === 2) dateLabel = '前天'
          else dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
          
          return (
            <div 
              key={idx} 
              onClick={() => onRecordClick && onRecordClick(log)}
              className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-pink-50/30 border border-gray-100 hover:border-pink-200 hover:shadow-sm transition-all cursor-pointer active:scale-98"
            >
              {/* 日期卡片 - 更大更明显 */}
              <div className="w-16 text-center bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl py-2.5 flex-shrink-0 shadow-sm">
                <div className="text-xl font-bold text-white">{String(date.getDate()).padStart(2, '0')}</div>
                <div className="text-[10px] text-pink-100 font-medium mt-0.5">{date.getMonth() + 1}月</div>
                {diffDays <= 2 && (
                  <div className="text-[9px] text-pink-100 mt-1 opacity-90">{dateLabel}</div>
                )}
              </div>
              
              {/* 标签区域 - 增加间距和视觉层次 */}
              <div className="flex-1 flex flex-wrap gap-2 min-h-[40px] items-center">
                {tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className={`text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r ${tag.bg} ${tag.color} font-medium shadow-sm`}
                  >
                    {tag.text}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============ 主页面组件 ============

export default function PeriodManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } = useNativeBridge()
  useWechatShare({ title: '经期管理 - 小习惯', description: '记录经期，了解自己的身体，关爱自己的健康。' })

  // 合规：显式解析 habitId（容器上下文缺失时兜底），确保日志/配置归属正确，首页 computed widget 才能展示
  const resolveHabitId = useCallback(() => resolvePeriodHabitId(callNative), [callNative])
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [periodLogs, setPeriodLogs] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [config, setConfig] = useState({
    cycleLen: 28,
    periodLen: 5,
    reminderEnabled: false,
    reminderAdvance: 3,
  })
  const [lastPeriodStart, setLastPeriodStart] = useState(null)
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [showLoveModal, setShowLoveModal] = useState(false)
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  /** 底部弹窗关闭后，WebView 可能把同一次触摸的合成 click 落到下方日历，导致刚关掉又打开 */
  const suppressCalendarTapRef = useRef(false)
  const armSuppressCalendarTap = useCallback(() => {
    suppressCalendarTapRef.current = true
    window.setTimeout(() => {
      suppressCalendarTapRef.current = false
    }, 350)
  }, [])
  const handleCalendarDateSelect = useCallback((date) => {
    if (suppressCalendarTapRef.current) return
    setSelectedDate(date)
    setShowPeriodModal(true)
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const { deleteHabit, isDeleting } = useHabitDelete({ type: 16, name: '经期管理' })
  
  // 设置页面标题（document.title 让 WebView/浏览器标题栏立即显示正确文案；App 内再同步到原生标题栏）
  const pageTitle = '经期管理'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  // 标记是否已完成首次加载，用于区分「首次进入」与「仅切换月份」
  const initialLoadDoneRef = React.useRef(false)

  // 仅首次进入或重新进入 App 时：全屏 loading + 拉取配置与数据
  useEffect(() => {
    if (!isInApp) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError(null)
    initialLoadDoneRef.current = false
    loadConfig().catch(e => {
      console.error('加载配置失败:', e)
      setLoadError('加载配置失败')
    })
    loadData().catch(e => {
      console.error('加载数据失败:', e)
      setLoadError('加载数据失败')
    }).finally(() => {
      setIsLoading(false)
      initialLoadDoneRef.current = true
    })
  }, [isInApp])

  // 左右切换月份时：只静默拉取该月数据，不触发全屏 loading，避免整页刷新
  useEffect(() => {
    if (!isInApp || !initialLoadDoneRef.current) return
    loadData().catch(e => console.error('加载数据失败:', e))
  }, [currentMonth])
  
  const loadConfig = async () => {
    try {
      const hid = await resolveHabitId()
      const result = await fetchPeriodSettings(callNative, hid)
      if (result) {
        setConfig({
          cycleLen: result.cycleLength || 28,
          periodLen: result.periodLength || 5,
          reminderEnabled: result.reminderEnabled === true,
          reminderAdvance: Number.isFinite(Number(result.reminderAdvance))
            ? Math.min(7, Math.max(1, Number(result.reminderAdvance)))
            : 3,
        })
      } else {
        setConfig({
          cycleLen: 28,
          periodLen: 5,
          reminderEnabled: false,
          reminderAdvance: 3,
        })
      }
    } catch (e) {
      console.error('加载配置失败:', e)
      setConfig({
        cycleLen: 28,
        periodLen: 5,
        reminderEnabled: false,
        reminderAdvance: 3,
      })
    }
  }
  
  const loadData = async () => {
    try {
      const params = new URLSearchParams(location.search)
      const skipOnboarding = params.get('skipOnboarding') === '1'

      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = formatDate(new Date(year, month - 1, 1))
      const endDate = formatDate(new Date(year, month + 2, 0))
      
      const hid = await resolveHabitId()
      const result = await fetchPeriodRecords(callNative, startDate, endDate, hid)
      const lastStartStr = result?.lastPeriodStart || null
      if (result?.records) {
        setPeriodLogs(result.records)
        if (lastStartStr) setLastPeriodStart(parseDate(lastStartStr))
        if (!lastStartStr && !skipOnboarding) {
          navigate('/habit/period/onboarding', { replace: true })
          return
        }
      } else {
        setPeriodLogs([])
      }

      if (lastStartStr) {
        try {
          const pred = await predictNextPeriod(callNative)
          if (pred?.hasData === true) {
            setPredictions(pred)
          } else {
            setPredictions(null)
          }
        } catch (e) {
          console.error('获取预测失败:', e)
          setPredictions(null)
        }
      } else {
        setPredictions(null)
      }
    } catch (e) { 
      console.error('加载数据失败:', e)
      // 数据加载失败时，至少显示空状态，不阻塞页面
      setPeriodLogs([])
      setPredictions(null)
      throw e // 重新抛出错误，让调用方知道加载失败
    }
  }
  
  // 智能分析经期周期 - 核心算法
  const analyzePeriodCycle = useCallback((targetDate) => {
    if (!targetDate) targetDate = new Date()
    if (periodLogs.length === 0) return null
    
    // 获取所有明确的经期记录
    const periodRecords = periodLogs
      .filter(log => {
        if (!log.signUpId) return false
        try {
          const details = JSON.parse(log.signUpId)
          return details.isPeriod === true
        } catch (e) {
          return false
        }
      })
      .map(log => ({
        date: logBusinessDate(log),
        dateStr: logBusinessDateStr(log),
      }))
      .sort((a, b) => a.date - b.date)
    
    if (periodRecords.length === 0) return null
    
    // 找到目标日期前后7天范围内的经期记录
    const targetDateObj = new Date(targetDate)
    const searchRange = 7
    
    const nearbyRecords = periodRecords.filter(record => {
      const daysDiff = Math.abs(diffDays(targetDateObj, record.date))
      return daysDiff <= searchRange
    })
    
    if (nearbyRecords.length === 0) {
      // 如果附近没有记录，查找最近的经期记录作为参考
      const recentRecords = periodRecords.filter(record => {
        const daysSince = diffDays(targetDateObj, record.date)
        return daysSince >= 0 && daysSince <= config.cycleLen // 在一个周期内
      })
      
      if (recentRecords.length === 0) return null
      
      // 找到这些记录中的连续经期组
      return findContinuousPeriodGroup(recentRecords)
    }
    
    // 分析附近记录，找到连续的经期组
    return findContinuousPeriodGroup(nearbyRecords)
  }, [periodLogs, config.cycleLen, config.periodLen])
  
  // 找到连续的经期记录组
  const findContinuousPeriodGroup = useCallback((records) => {
    if (records.length === 0) return null
    
    // 按日期排序
    const sortedRecords = [...records].sort((a, b) => a.date - b.date)
    
    // 找到最大的连续组
    let bestGroup = []
    let currentGroup = [sortedRecords[0]]
    
    for (let i = 1; i < sortedRecords.length; i++) {
      const prevRecord = currentGroup[currentGroup.length - 1]
      const currentRecord = sortedRecords[i]
      const daysBetween = diffDays(currentRecord.date, prevRecord.date)
      
      // 如果间隔在合理范围内（考虑用户可能不是每天都记录）
      if (daysBetween <= config.periodLen + 2) {
        currentGroup.push(currentRecord)
      } else {
        // 间隔太大，开始新的组
        if (currentGroup.length > bestGroup.length) {
          bestGroup = [...currentGroup]
        }
        currentGroup = [currentRecord]
      }
    }
    
    // 检查最后一组
    if (currentGroup.length > bestGroup.length) {
      bestGroup = [...currentGroup]
    }
    
    if (bestGroup.length === 0) return null
    
    // 返回经期周期信息
    const startDate = bestGroup[0].date
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + config.periodLen - 1)
    
    return {
      startDate,
      endDate,
      actualRecords: bestGroup,
      duration: config.periodLen
    }
  }, [config.periodLen])
  
  // 判断某个日期是否在经期内（智能推算）
  const isDateInPeriod = useCallback((date) => {
    const cycle = analyzePeriodCycle(date)
    if (!cycle) return false
    
    const targetDate = new Date(date)
    return targetDate >= cycle.startDate && targetDate <= cycle.endDate
  }, [analyzePeriodCycle])
  
  // 获取当前经期状态（基于智能分析）
  const getCurrentPeriodStatus = useCallback(() => {
    const today = new Date()
    const cycle = analyzePeriodCycle(today)
    
    if (!cycle) {
      return { inPeriod: false, dayIndex: 0, cycle: null }
    }
    
    const dayIndex = diffDays(today, cycle.startDate) + 1
    const inPeriod = dayIndex >= 1 && dayIndex <= cycle.duration
    
    return { inPeriod, dayIndex, cycle }
  }, [analyzePeriodCycle])

  // 找到真正的经期开始日期
  const findActualPeriodStart = useCallback(() => {
    if (!lastPeriodStart || periodLogs.length === 0) return lastPeriodStart
    
    // 获取所有经期记录，按日期排序
    const periodRecords = periodLogs
      .filter(log => {
        if (!log.signUpId) return false
        try {
          const details = JSON.parse(log.signUpId)
          return details.isPeriod === true
        } catch (e) {
          return false
        }
      })
      .map(log => logBusinessDate(log))
      .sort((a, b) => a - b)
    
    if (periodRecords.length === 0) return lastPeriodStart
    
    const today = new Date()
    
    // 找到最近的经期记录组（在合理的时间范围内）
    let currentPeriodStart = null
    
    // 从最新的记录开始，向前查找连续的经期记录
    for (let i = periodRecords.length - 1; i >= 0; i--) {
      const recordDate = periodRecords[i]
      const daysSinceRecord = diffDays(today, recordDate)
      
      // 如果记录距离今天超过一个周期，跳过
      if (daysSinceRecord > config.cycleLen) continue
      
      // 找到这个记录所属的连续经期组的开始日期
      let groupStart = recordDate
      
      // 向前查找连续的记录
      for (let j = i - 1; j >= 0; j--) {
        const prevRecord = periodRecords[j]
        const daysBetween = diffDays(recordDate, prevRecord)
        
        // 如果间隔超过经期长度+2天，说明不是同一个经期
        if (daysBetween > config.periodLen + 2) break
        
        groupStart = prevRecord
        i = j // 更新外层循环的索引
      }
      
      currentPeriodStart = groupStart
      break
    }
    
    return currentPeriodStart || lastPeriodStart
  }, [lastPeriodStart, periodLogs, config.periodLen, config.cycleLen])

  const getStatusText = () => {
    if (!lastPeriodStart) return { main: '未记录', sub: '点击日历开始记录', emoji: '🌸' }
    
    const today = new Date()
    const actualPeriodStart = findActualPeriodStart()
    
    // 使用与原生端一致的计算方式：计算从开始日期到今天的日期差
    const startDay = new Date(actualPeriodStart.getFullYear(), actualPeriodStart.getMonth(), actualPeriodStart.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const daysSinceStart = diffDays(todayDay, startDay) + 1 // 第几天
    
    // 检查是否有明确的经期结束标记
    let hasEnded = false, endedDayIndex = 0
    periodLogs.forEach(log => {
      if (log.signUpId) {
        try {
          const d = JSON.parse(log.signUpId)
          if (d.periodEnded) {
            hasEnded = true
            const logDate = logBusinessDate(log)
            const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate())
            const dayIndex = diffDays(logDay, startDay) + 1
            endedDayIndex = Math.max(endedDayIndex, dayIndex)
          }
        } catch (e) {}
      }
    })
    
    // 计算实际经期长度（基于记录）
    const actualPeriodLength = Math.max(config.periodLen, 
      periodLogs
        .filter(log => {
          if (!log.signUpId) return false
          try {
            const details = JSON.parse(log.signUpId)
            return details.isPeriod === true
          } catch (e) {
            return false
          }
        })
        .map(log => {
          const logDate = logBusinessDate(log)
          const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate())
          return diffDays(logDay, startDay) + 1
        })
        .filter(dayIndex => dayIndex > 0)
        .reduce((max, dayIndex) => Math.max(max, dayIndex), config.periodLen)
    )
    
    let inPeriod = daysSinceStart > 0 && daysSinceStart <= actualPeriodLength
    if (hasEnded && daysSinceStart >= endedDayIndex) inPeriod = false
    
    if (inPeriod) {
      return { 
        main: `第 ${daysSinceStart} 天`, 
        sub: actualPeriodLength > config.periodLen 
          ? `经期延长至${actualPeriodLength}天，注意休息` 
          : '经期中，注意休息', 
        emoji: '🩸' 
      }
    }
    
    // 计算下一次经期开始日（与原生端逻辑一致）
    const nextStartDate = new Date(startDay)
    nextStartDate.setDate(nextStartDate.getDate() + config.cycleLen)
    const nextStartDay = new Date(nextStartDate.getFullYear(), nextStartDate.getMonth(), nextStartDate.getDate())
    let daysUntilNext = diffDays(nextStartDay, todayDay)
    
    // 如果已经过了预计日期，简单向后平移一个或多个周期（与原生端逻辑一致）
    if (daysUntilNext < 0) {
      const passedCycles = Math.floor((-daysUntilNext / config.cycleLen)) + 1
      const adjustedNextStartDate = new Date(startDay)
      adjustedNextStartDate.setDate(adjustedNextStartDate.getDate() + (config.cycleLen * passedCycles))
      const adjustedNextStartDay = new Date(adjustedNextStartDate.getFullYear(), adjustedNextStartDate.getMonth(), adjustedNextStartDate.getDate())
      daysUntilNext = diffDays(adjustedNextStartDay, todayDay)
    }
    
    // 未到下次经期：还有多少天
    if (daysUntilNext > 0) {
      return { main: `${daysUntilNext} 天`, sub: '距离下次经期', emoji: '📅' }
    }
    
    // 已经过预计日：延后
    const delayDays = -daysUntilNext
    return { main: `延后 ${delayDays} 天`, sub: '建议关注身体状况', emoji: '⚠️' }
  }
  
  const handleSaveDetails = async (data) => {
    try {
      await showLoading('保存中...')
      const hid = await resolveHabitId()
      // 如果 data 中包含 date 字段（从爱爱弹窗传递），使用该日期；否则使用 selectedDate
      const saveDate = data.date ? data.date : formatDate(selectedDate)
      // 从 data 中移除 date、createTime，避免保存到 details 中
      const { date, createTime, ...detailsData } = data
      await savePeriodRecord(callNative, {
        date: saveDate,
        details: detailsData,
        createTime: createTime != null ? createTime : undefined,
      }, hid)
      await hideLoading()
      await showToast('保存成功')
      armSuppressCalendarTap()
      setShowPeriodModal(false)
      setShowLoveModal(false)
      setShowMoodModal(false)
      loadData()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }
  
  const handleDeleteRecord = async (dateStr) => {
    try {
      const hid = await resolveHabitId()
      const toDelete = dateStr != null ? dateStr : formatDate(selectedDate)
      await deletePeriodDay(callNative, toDelete, hid)
      await showToast('已删除')
      armSuppressCalendarTap()
      setShowPeriodModal(false)
      setShowLoveModal(false)
      loadData()
    } catch (e) { await showToast('删除失败: ' + e.message) }
  }
  
  const handleSaveSettings = async (cycleLen, periodLen, reminderEnabled, reminderAdvance) => {
    try {
      const hid = await resolveHabitId()
      await updatePeriodSettings(callNative, {
        cycleLength: cycleLen,
        periodLength: periodLen,
        reminderEnabled,
        reminderAdvance,
      }, hid)
      setConfig({
        cycleLen,
        periodLen,
        reminderEnabled,
        reminderAdvance: Math.min(7, Math.max(1, Number(reminderAdvance) || 3)),
      })
      armSuppressCalendarTap()
      setShowSettingsModal(false)
      await showToast('设置已保存')
      loadData()
    } catch (e) { await showToast('保存失败: ' + e.message) }
  }
  
  const getSelectedDateLog = () => {
    const dateStr = formatDate(selectedDate)
    return periodLogs.find(l => logBusinessDateStr(l) === dateStr)
  }
  
  const status = getStatusText()
  
  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-200">
            <span className="text-5xl">🌸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">经期管理</h1>
          <p className="text-gray-500 mb-6">请在小习惯 App 内使用</p>
          <a href="https://apps.apple.com/app/id1455083310" 
             className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-pink-200">
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }
  
  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* 错误提示 */}
      {loadError && (
        <div className="px-4 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 font-medium">{loadError}</p>
              <p className="text-xs text-yellow-600 mt-1">页面将显示基本功能，部分数据可能无法加载</p>
            </div>
            <button 
              onClick={() => {
                setLoadError(null)
                setIsLoading(true)
                loadConfig().catch(e => console.error('加载配置失败:', e))
                loadData().catch(e => console.error('加载数据失败:', e)).finally(() => setIsLoading(false))
              }}
              className="text-xs text-yellow-700 underline"
            >
              重试
            </button>
          </div>
        </div>
      )}
      {/* 头部状态 */}
      <div className="relative overflow-hidden">
        <div 
          className="px-6 pt-6 pb-8 relative z-10"
          style={{ background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)' }}
        >
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{status.emoji}</span>
                <span className="text-4xl font-bold">{status.main}</span>
              </div>
              <p className="text-white/80 text-sm">{status.sub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={deleteHabit}
                disabled={isDeleting}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-50"
                title="删除习惯"
              >
                🗑️
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                title="设置"
              >
                ⚙️
              </button>
            </div>
          </div>
          
          {/* 快捷操作 */}
          <div className="flex gap-3 mt-6">
            {[
              { icon: '🌸', label: '记经期', color: 'from-white/30 to-white/20', action: 'period' },
              { icon: '😊', label: '记心情', color: 'from-white/30 to-white/20', action: 'mood' },
              { icon: '❤️', label: '记爱爱', color: 'from-white/30 to-white/20', action: 'love' },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => {
                  setSelectedDate(new Date())
                  if (item.action === 'love') setShowLoveModal(true)
                  else if (item.action === 'mood') setShowMoodModal(true)
                  else setShowPeriodModal(true)
                }}
                className={`flex-1 py-3 rounded-2xl bg-gradient-to-br ${item.color} backdrop-blur-sm text-white font-medium active:scale-95 transition-transform`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 装饰圆形 */}
        {/* 注意：装饰层必须禁用 pointer events，否则会挡住右上角按钮点击 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>
      
      {/* 日历 */}
      <div className="px-4 -mt-4 relative z-10">
        <Calendar 
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          onDateSelect={handleCalendarDateSelect}
          periodLogs={periodLogs}
          predictions={predictions}
          config={config}
        />
      </div>
      
      {/* 最近记录 */}
      <div className="px-4 mt-4 pb-8">
        <RecentRecords 
          logs={periodLogs} 
          onRecordClick={(log) => {
            const date = logBusinessDate(log)
            setSelectedDate(date)
            
            let details = {}
            try { details = JSON.parse(log.signUpId) } catch (e) {}
            
            if (details.isLove || details.loveMeasure !== undefined) {
              setShowLoveModal(true)
            } else if (details.isPeriod !== true && details.mood != null) {
              // 纯心情记录：独立弹窗
              setShowMoodModal(true)
            } else {
              setShowPeriodModal(true)
            }
          }}
        />
      </div>
      
      {/* 弹窗 */}
      <PeriodModal 
        isOpen={showPeriodModal} onClose={() => { armSuppressCalendarTap(); setShowPeriodModal(false) }}
        selectedDate={selectedDate} existingLog={getSelectedDateLog()}
        onSave={handleSaveDetails} onDelete={handleDeleteRecord}
        isInitialized={lastPeriodStart !== null}
      />
      <LoveModal 
        isOpen={showLoveModal} onClose={() => { armSuppressCalendarTap(); setShowLoveModal(false) }}
        selectedDate={selectedDate} existingLog={getSelectedDateLog()}
        onSave={handleSaveDetails} onDelete={handleDeleteRecord}
      />
      <MoodModal 
        isOpen={showMoodModal} onClose={() => { armSuppressCalendarTap(); setShowMoodModal(false) }}
        selectedDate={selectedDate} existingLog={getSelectedDateLog()}
        onSave={handleSaveDetails} onDelete={(dateStr) => handleDeleteRecord(dateStr)}
      />
      <SettingsModal 
        isOpen={showSettingsModal} onClose={() => { armSuppressCalendarTap(); setShowSettingsModal(false) }}
        config={config} onSave={handleSaveSettings}
      />
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  )
}
