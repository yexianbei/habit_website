/**
 * 经期管理页面
 * 完整功能版 - 现代 UI 风格
 */

import React, { useState, useEffect } from 'react'
import { useNativeBridge, useNativeEvent } from '../../utils/useNativeBridge'

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

const diffDays = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24))
}

// ============ 日历组件 ============

const Calendar = ({ currentMonth, setCurrentMonth, selectedDate, onDateSelect, periodLogs, predictions }) => {
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
  
  const getDateInfo = (date) => {
    if (!date) return { status: PERIOD_STATUS.NONE }
    const dateStr = formatDate(date)
    const log = periodLogs.find(l => formatDate(new Date(l.createTime)) === dateStr)
    
    let info = { status: PERIOD_STATUS.NONE, mood: null, hasLove: false }
    
    if (log) {
      try {
        const details = JSON.parse(log.signUpId || '{}')
        const isPeriod = details.isPeriod !== false && (details.flow || details.pain || details.color || !details.isLove)
        
        if (isPeriod) info.status = PERIOD_STATUS.PERIOD
        else if (details.isLove) info.status = PERIOD_STATUS.LOVE
        
        if (details.mood) info.mood = details.mood
        if (details.isLove || details.loveMeasure !== undefined) info.hasLove = true
      } catch (e) {
        info.status = PERIOD_STATUS.PERIOD
      }
    } else if (predictions) {
      if (predictions.predictedDates?.includes(dateStr)) info.status = PERIOD_STATUS.PREDICTED
      else if (predictions.ovulationDate === dateStr) info.status = PERIOD_STATUS.OVULATION
      else if (predictions.fertileDates?.includes(dateStr)) info.status = PERIOD_STATUS.FERTILE
    }
    
    return info
  }
  
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const todayStr = formatDate(new Date())
  const MOOD_ICONS = { 1: '😊', 2: '😐', 3: '😢', 4: '😰', 5: '😠' }
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 active:bg-pink-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-800">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 active:bg-pink-100"
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
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date, index) => {
          if (!date) return <div key={index} className="aspect-square" />
          
          const dateStr = formatDate(date)
          const info = getDateInfo(date)
          const isSelected = selectedDate && dateStr === formatDate(selectedDate)
          const isToday = dateStr === todayStr
          
          const statusStyles = {
            [PERIOD_STATUS.PERIOD]: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200',
            [PERIOD_STATUS.PREDICTED]: 'bg-pink-100 text-pink-600 border-2 border-dashed border-pink-300',
            [PERIOD_STATUS.OVULATION]: 'bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-md shadow-purple-200',
            [PERIOD_STATUS.FERTILE]: 'bg-purple-100 text-purple-600',
            [PERIOD_STATUS.LOVE]: 'bg-purple-100 text-purple-600',
          }
          
          // 判断是否有任何图标需要显示
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
              {/* 心情图标 - 左上角 */}
              {hasMood && (
                <span className="absolute -top-1 -left-1 text-[10px] drop-shadow-sm">
                  {MOOD_ICONS[info.mood]}
                </span>
              )}
              {/* 爱爱图标 - 右上角 */}
              {hasLove && (
                <span className="absolute -top-1 -right-1 text-[10px] drop-shadow-sm">
                  ❤️
                </span>
              )}
            </button>
          )
        })}
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-100">
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

const DetailModal = ({ isOpen, onClose, selectedDate, existingLog, onSave, onDelete }) => {
  const [isPeriod, setIsPeriod] = useState(false)
  const [periodEnded, setPeriodEnded] = useState(false)
  const [periodStartTime, setPeriodStartTime] = useState('')
  const [periodEndTime, setPeriodEndTime] = useState('')
  const [flow, setFlow] = useState(null)
  const [pain, setPain] = useState(null)
  const [color, setColor] = useState(null)
  const [mood, setMood] = useState(null)
  const [isLove, setIsLove] = useState(false)
  const [loveMeasure, setLoveMeasure] = useState(null)
  const [loveTime, setLoveTime] = useState('')
  
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      if (existingLog?.signUpId) {
        try {
          const d = JSON.parse(existingLog.signUpId)
          setIsPeriod(d.isPeriod !== false)
          setPeriodEnded(d.periodEnded || false)
          setPeriodStartTime(d.periodStartTime || nowTime)
          setPeriodEndTime(d.periodEndTime || nowTime)
          setFlow(d.flow || null)
          setPain(d.pain || null)
          setColor(d.color || null)
          setMood(d.mood || null)
          setIsLove(d.isLove || false)
          setLoveMeasure(d.loveMeasure ?? null)
          setLoveTime(d.loveTime || '')
        } catch (e) {
          resetForm(nowTime)
        }
      } else {
        resetForm(nowTime)
      }
    }
  }, [isOpen, existingLog])
  
  const resetForm = (nowTime) => {
    setIsPeriod(false)
    setPeriodEnded(false)
    setPeriodStartTime(nowTime)
    setPeriodEndTime(nowTime)
    setFlow(null)
    setPain(null)
    setColor(null)
    setMood(null)
    setIsLove(false)
    setLoveMeasure(null)
    setLoveTime('')
  }
  
  const handleSave = () => {
    if (!isPeriod && !isLove && !mood) {
      if (existingLog) onDelete()
      else onClose()
      return
    }
    
    onSave({
      isPeriod,
      periodStartTime: isPeriod ? periodStartTime : null,
      periodEnded: isPeriod ? periodEnded : false,
      periodEndTime: isPeriod && periodEnded ? periodEndTime : null,
      flow: isPeriod ? flow : null,
      pain: isPeriod ? pain : null,
      color: isPeriod ? color : null,
      mood,
      isLove,
      loveMeasure: isLove ? loveMeasure : null,
      loveTime: isLove ? loveTime : null,
    })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 text-sm">取消</button>
          <span className="font-bold text-gray-800">{formatDate(selectedDate)}</span>
          <button onClick={handleSave} className="text-pink-500 font-medium text-sm">保存</button>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 大姨妈来了 */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌸</span>
                <span className="font-bold text-gray-800">大姨妈来了</span>
              </div>
              <Toggle checked={isPeriod} onChange={(v) => { setIsPeriod(v); if (!v) setPeriodEnded(false) }} />
            </div>
            
            {isPeriod && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">开始时间</span>
                  <input 
                    type="time" value={periodStartTime} onChange={e => setPeriodStartTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-pink-100">
                  <span className="text-sm text-gray-600">经期走了</span>
                  <Toggle checked={periodEnded} onChange={setPeriodEnded} />
                </div>
                
                {periodEnded && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-16">结束时间</span>
                    <input 
                      type="time" value={periodEndTime} onChange={e => setPeriodEndTime(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 经期详情 */}
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
          
          {/* 心情 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">今日心情</label>
            <SelectorChip options={MOOD_OPTIONS} value={mood} onChange={setMood} />
          </div>
          
          {/* 爱爱 */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <span className="font-bold text-gray-800">爱爱</span>
              </div>
              <Toggle checked={isLove} onChange={setIsLove} color="purple" />
            </div>
            
            {isLove && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">避孕措施</label>
                  <SelectorChip options={CONTRACEPTION_OPTIONS} value={loveMeasure} onChange={setLoveMeasure} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-gray-500 w-16">时间</span>
                  <input 
                    type="time" value={loveTime} onChange={e => setLoveTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 设置弹窗组件 ============

const SettingsModal = ({ isOpen, onClose, config, onSave }) => {
  const [cycleLen, setCycleLen] = useState(28)
  const [periodLen, setPeriodLen] = useState(5)
  
  useEffect(() => {
    if (isOpen) {
      setCycleLen(config.cycleLen || 28)
      setPeriodLen(config.periodLen || 5)
    }
  }, [isOpen, config])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-sm p-6 animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="font-bold text-xl text-gray-800">周期设置</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">经期长度</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="3" max="10" value={periodLen} onChange={e => setPeriodLen(parseInt(e.target.value))}
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
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium active:scale-98">
            取消
          </button>
          <button 
            onClick={() => onSave(cycleLen, periodLen)}
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

const RecentRecords = ({ logs }) => {
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
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span>
        最近记录
      </h3>
      <div className="space-y-3">
        {logsWithDetails.map((log, idx) => {
          const date = new Date(log.createTime)
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
          
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-14 text-center bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl py-2 flex-shrink-0">
                <div className="text-lg font-bold text-pink-600">{String(date.getDate()).padStart(2, '0')}</div>
                <div className="text-[10px] text-pink-400">{date.getMonth() + 1}月</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${tag.bg} ${tag.color} font-medium`}>
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
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } = useNativeBridge()
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [periodLogs, setPeriodLogs] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [config, setConfig] = useState({ cycleLen: 28, periodLen: 5 })
  const [lastPeriodStart, setLastPeriodStart] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  useEffect(() => {
    if (isInApp) setTitle('经期管理')
  }, [isInApp, setTitle])
  
  useEffect(() => {
    if (isInApp) { loadConfig(); loadData() }
  }, [isInApp, currentMonth])
  
  const loadConfig = async () => {
    try {
      const result = await callNative('period.getSettings')
      if (result) setConfig({ cycleLen: result.cycleLength || 28, periodLen: result.periodLength || 5 })
    } catch (e) { console.error('加载配置失败:', e) }
  }
  
  const loadData = async () => {
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = formatDate(new Date(year, month - 1, 1))
      const endDate = formatDate(new Date(year, month + 2, 0))
      
      const result = await callNative('period.getRecords', { startDate, endDate })
      if (result?.records) {
        setPeriodLogs(result.records)
        if (result.lastPeriodStart) setLastPeriodStart(parseDate(result.lastPeriodStart))
      }
      
      const pred = await callNative('period.predict')
      if (pred) setPredictions(pred)
    } catch (e) { console.error('加载数据失败:', e) }
  }
  
  const getStatusText = () => {
    if (!lastPeriodStart) return { main: '未记录', sub: '点击日历开始记录', emoji: '🌸' }
    
    const today = new Date()
    const daysSinceStart = diffDays(today, lastPeriodStart) + 1
    
    let hasEnded = false, endedDayIndex = 0
    periodLogs.forEach(log => {
      if (log.signUpId) {
        try {
          const d = JSON.parse(log.signUpId)
          if (d.periodEnded) {
            hasEnded = true
            const dayIndex = diffDays(new Date(log.createTime), lastPeriodStart) + 1
            endedDayIndex = Math.max(endedDayIndex, dayIndex)
          }
        } catch (e) {}
      }
    })
    
    let inPeriod = daysSinceStart <= config.periodLen
    if (hasEnded && daysSinceStart >= endedDayIndex) inPeriod = false
    
    if (inPeriod) return { main: `第 ${daysSinceStart} 天`, sub: '经期中，注意休息', emoji: '🩸' }
    if (daysSinceStart <= config.cycleLen) {
      const daysLeft = config.cycleLen - daysSinceStart
      return { main: `${daysLeft} 天`, sub: '距离下次经期', emoji: '📅' }
    }
    return { main: `延后 ${daysSinceStart - config.cycleLen} 天`, sub: '建议关注身体状况', emoji: '⚠️' }
  }
  
  const handleSaveDetails = async (data) => {
    try {
      await showLoading('保存中...')
      await callNative('period.save', { date: formatDate(selectedDate), details: JSON.stringify(data) })
      await hideLoading()
      await showToast('保存成功')
      setShowDetailModal(false)
      loadData()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }
  
  const handleDeleteRecord = async () => {
    try {
      await callNative('period.delete', { date: formatDate(selectedDate) })
      await showToast('已删除')
      setShowDetailModal(false)
      loadData()
    } catch (e) { await showToast('删除失败: ' + e.message) }
  }
  
  const handleSaveSettings = async (cycleLen, periodLen) => {
    try {
      await callNative('period.updateSettings', { cycleLength: cycleLen, periodLength: periodLen })
      setConfig({ cycleLen, periodLen })
      setShowSettingsModal(false)
      await showToast('设置已保存')
      loadData()
    } catch (e) { await showToast('保存失败: ' + e.message) }
  }
  
  const getSelectedDateLog = () => {
    const dateStr = formatDate(selectedDate)
    return periodLogs.find(l => formatDate(new Date(l.createTime)) === dateStr)
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* 头部状态 */}
      <div className="relative overflow-hidden">
        <div 
          className="px-6 pt-6 pb-8"
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
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"
            >
              ⚙️
            </button>
          </div>
          
          {/* 快捷操作 */}
          <div className="flex gap-3 mt-6">
            {[
              { icon: '🌸', label: '记经期', color: 'from-white/30 to-white/20' },
              { icon: '😊', label: '记心情', color: 'from-white/30 to-white/20' },
              { icon: '❤️', label: '记爱爱', color: 'from-white/30 to-white/20' },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => { setSelectedDate(new Date()); setShowDetailModal(true) }}
                className={`flex-1 py-3 rounded-2xl bg-gradient-to-br ${item.color} backdrop-blur-sm text-white font-medium active:scale-95 transition-transform`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 装饰圆形 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
      </div>
      
      {/* 日历 */}
      <div className="px-4 -mt-4 relative z-10">
        <Calendar 
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          onDateSelect={(date) => { setSelectedDate(date); setShowDetailModal(true) }}
          periodLogs={periodLogs}
          predictions={predictions}
        />
      </div>
      
      {/* 最近记录 */}
      <div className="px-4 mt-4 pb-8">
        <RecentRecords logs={periodLogs} />
      </div>
      
      {/* 弹窗 */}
      <DetailModal 
        isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}
        selectedDate={selectedDate} existingLog={getSelectedDateLog()}
        onSave={handleSaveDetails} onDelete={handleDeleteRecord}
      />
      <SettingsModal 
        isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}
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
