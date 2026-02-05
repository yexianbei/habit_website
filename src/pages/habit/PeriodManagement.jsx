/**
 * 经期管理页面
 * 完整功能版 - 从旧版 detail.html 迁移
 * 
 * 功能：
 * - 记录经期开始/结束
 * - 日历视图（经期、预测、排卵、易孕期）
 * - 详细记录（流量、痛经、颜色、心情、爱爱）
 * - 智能预测
 * - 最近记录列表
 * - 设置周期和经期长度
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNativeBridge, useNativeEvent } from '../../utils/useNativeBridge'

// ============ 常量定义 ============

// 经期状态
const PERIOD_STATUS = {
  NONE: 'none',
  PERIOD: 'period',
  PREDICTED: 'predicted',
  OVULATION: 'ovulation',
  FERTILE: 'fertile',
  LOVE: 'love',
}

// 流量选项
const FLOW_OPTIONS = [
  { value: 1, label: '少', icon: '💧' },
  { value: 2, label: '中', icon: '💧💧' },
  { value: 3, label: '多', icon: '💧💧💧' },
]

// 痛经选项
const PAIN_OPTIONS = [
  { value: 0, label: '无', icon: '😊' },
  { value: 1, label: '轻度', icon: '😐' },
  { value: 2, label: '重度', icon: '😣' },
]

// 颜色选项
const COLOR_OPTIONS = [
  { value: 1, label: '鲜红', color: '#FF4D4D' },
  { value: 2, label: '深红', color: '#CC0000' },
  { value: 3, label: '褐色', color: '#8B4513' },
]

// 心情选项
const MOOD_OPTIONS = [
  { value: 1, label: '开心', icon: '😊' },
  { value: 2, label: '平淡', icon: '😐' },
  { value: 3, label: '难过', icon: '😢' },
  { value: 4, label: '焦虑', icon: '😰' },
  { value: 5, label: '生气', icon: '😠' },
]

// 避孕措施选项
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

const parseDate = (str) => {
  if (!str) return null
  return new Date(str.replace(/-/g, '/'))
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const diffDays = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24))
}

// ============ 日历组件 ============

const Calendar = ({ currentMonth, setCurrentMonth, selectedDate, onDateSelect, periodLogs, predictions, config }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }
  
  const getDateInfo = (date) => {
    if (!date) return { status: PERIOD_STATUS.NONE }
    const dateStr = formatDate(date)
    const log = periodLogs.find(l => formatDate(new Date(l.createTime)) === dateStr)
    
    let info = { status: PERIOD_STATUS.NONE, log: null, mood: null, hasLove: false }
    
    if (log) {
      info.log = log
      try {
        const details = JSON.parse(log.signUpId || '{}')
        const isPeriod = details.isPeriod !== false && (details.flow || details.pain || details.color || !details.isLove)
        
        if (isPeriod) {
          info.status = PERIOD_STATUS.PERIOD
        } else if (details.isLove) {
          info.status = PERIOD_STATUS.LOVE
        }
        
        if (details.mood) info.mood = details.mood
        if (details.isLove || details.loveMeasure !== undefined) info.hasLove = true
      } catch (e) {
        info.status = PERIOD_STATUS.PERIOD
      }
    } else if (predictions) {
      if (predictions.predictedDates?.includes(dateStr)) {
        info.status = PERIOD_STATUS.PREDICTED
      } else if (predictions.ovulationDate === dateStr) {
        info.status = PERIOD_STATUS.OVULATION
      } else if (predictions.fertileDates?.includes(dateStr)) {
        info.status = PERIOD_STATUS.FERTILE
      }
    }
    
    return info
  }
  
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const todayStr = formatDate(new Date())
  
  const MOOD_ICONS = { 1: '😊', 2: '😐', 3: '😢', 4: '😰', 5: '😠' }
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 text-pink-500 text-lg"
        >
          ❮
        </button>
        <span className="text-lg font-bold text-gray-800">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 text-pink-500 text-lg"
        >
          ❯
        </button>
      </div>
      
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <div key={index} className="aspect-square" />
          
          const dateStr = formatDate(date)
          const info = getDateInfo(date)
          const isSelected = selectedDate && dateStr === formatDate(selectedDate)
          const isToday = dateStr === todayStr
          
          let bgClass = ''
          let textClass = ''
          let borderClass = ''
          
          switch (info.status) {
            case PERIOD_STATUS.PERIOD:
              bgClass = 'bg-pink-500'
              textClass = 'text-white'
              break
            case PERIOD_STATUS.PREDICTED:
              bgClass = 'bg-pink-100'
              textClass = 'text-pink-500'
              borderClass = 'border border-dashed border-pink-400'
              break
            case PERIOD_STATUS.OVULATION:
              bgClass = 'bg-purple-100'
              textClass = 'text-purple-600'
              borderClass = 'border-2 border-purple-500'
              break
            case PERIOD_STATUS.FERTILE:
              bgClass = 'bg-purple-50'
              textClass = 'text-purple-500'
              break
            case PERIOD_STATUS.LOVE:
              bgClass = 'bg-purple-100'
              textClass = 'text-purple-600'
              break
          }
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                aspect-square rounded-full flex flex-col items-center justify-center text-sm relative
                ${bgClass} ${textClass} ${borderClass}
                ${isToday && !bgClass ? 'border border-pink-500 text-pink-500 font-bold' : ''}
                ${isSelected ? 'ring-2 ring-pink-500 ring-offset-1' : ''}
              `}
            >
              <span>{date.getDate()}</span>
              {/* 心情图标 */}
              {info.mood && (
                <span className="absolute top-0 left-0 text-[8px]">{MOOD_ICONS[info.mood]}</span>
              )}
              {/* 爱爱图标 */}
              {info.hasLove && (
                <span className="absolute top-0 right-0 text-[8px]">❤️</span>
              )}
            </button>
          )
        })}
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <span>经期</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-100 border border-dashed border-pink-400" />
          <span>预测</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-50" />
          <span>排卵期</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-100 border-2 border-purple-500" />
          <span>排卵日</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❤️</span>
          <span>爱爱</span>
        </div>
        <div className="flex items-center gap-1">
          <span>😊</span>
          <span>心情</span>
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
          px-3 py-1.5 rounded-full text-sm transition-all
          ${value === opt.value 
            ? 'bg-pink-100 text-pink-600 border border-pink-400' 
            : 'bg-gray-100 text-gray-600 border border-transparent'}
        `}
        style={colorMode && opt.color ? { 
          backgroundColor: value === opt.value ? opt.color + '30' : undefined,
          borderColor: value === opt.value ? opt.color : undefined,
          color: value === opt.value ? opt.color : undefined,
        } : undefined}
      >
        {opt.icon && <span className="mr-1">{opt.icon}</span>}
        {opt.label}
      </button>
    ))}
  </div>
)

// ============ 详情弹窗组件 ============

const DetailModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  existingLog,
  onSave,
  onDelete,
}) => {
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
      // 重置状态
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
      // 全部关闭，删除记录
      if (existingLog) {
        onDelete()
      } else {
        onClose()
      }
      return
    }
    
    const data = {
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
    }
    
    onSave(data)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="text-center font-bold text-lg py-4 border-b">
          {formatDate(selectedDate)}
        </div>
        
        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 大姨妈来了 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">🌸 大姨妈来了</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPeriod} 
                onChange={e => {
                  setIsPeriod(e.target.checked)
                  if (!e.target.checked) {
                    setPeriodEnded(false)
                  }
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
          
          {/* 开始时间 */}
          {isPeriod && (
            <div className="pl-4">
              <label className="block text-sm text-gray-500 mb-1">开始时间</label>
              <input 
                type="time" 
                value={periodStartTime}
                onChange={e => setPeriodStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}
          
          {/* 经期走了 */}
          {isPeriod && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium">经期走了</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={periodEnded} 
                    onChange={e => setPeriodEnded(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
              
              {periodEnded && (
                <div className="pl-4">
                  <label className="block text-sm text-gray-500 mb-1">结束时间</label>
                  <input 
                    type="time" 
                    value={periodEndTime}
                    onChange={e => setPeriodEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
            </>
          )}
          
          {/* 经期详情 */}
          {isPeriod && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm text-gray-500 mb-2">流量</label>
                <SelectorChip options={FLOW_OPTIONS} value={flow} onChange={setFlow} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">痛经</label>
                <SelectorChip options={PAIN_OPTIONS} value={pain} onChange={setPain} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">颜色</label>
                <SelectorChip options={COLOR_OPTIONS} value={color} onChange={setColor} colorMode />
              </div>
            </div>
          )}
          
          {/* 心情 - 总是显示 */}
          <div className="pt-2 border-t">
            <label className="block text-sm text-gray-500 mb-2">心情</label>
            <SelectorChip options={MOOD_OPTIONS} value={mood} onChange={setMood} />
          </div>
          
          {/* 爱爱 */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">❤️ 爱爱</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isLove} 
                  onChange={e => setIsLove(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            {isLove && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">避孕措施</label>
                  <SelectorChip options={CONTRACEPTION_OPTIONS} value={loveMeasure} onChange={setLoveMeasure} />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">时间</label>
                  <input 
                    type="time" 
                    value={loveTime}
                    onChange={e => setLoveTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex gap-3 p-4 border-t">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-full font-medium"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-pink-500 text-white rounded-full font-medium"
          >
            保存
          </button>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-center font-bold text-lg mb-6">设置经期</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">经期长度 (天)</label>
            <input 
              type="number" 
              value={periodLen}
              onChange={e => setPeriodLen(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="15"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">周期长度 (天)</label>
            <input 
              type="number" 
              value={cycleLen}
              onChange={e => setCycleLen(parseInt(e.target.value) || 28)}
              className="w-full px-3 py-2 border rounded-lg"
              min="15"
              max="60"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-full font-medium"
          >
            取消
          </button>
          <button 
            onClick={() => onSave(cycleLen, periodLen)}
            className="flex-1 py-3 bg-pink-500 text-white rounded-full font-medium"
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
  const MAP_FLOW = { 1: '流量:少', 2: '流量:中', 3: '流量:多' }
  const MAP_PAIN = { 0: '无痛经', 1: '轻度痛经', 2: '重度痛经' }
  const MAP_COLOR = { 1: '鲜红', 2: '深红', 3: '褐色' }
  const MAP_MOOD = { 1: '开心', 2: '平淡', 3: '难过', 4: '焦虑', 5: '生气' }
  const MAP_LOVE = { 0: '无措施', 1: '避孕套', 2: '体外', 3: '未射精', 4: '紧急药', 5: '短效药', 6: '长效药', 7: '节育环', 8: '其他' }
  
  const logsWithDetails = logs
    .filter(l => l.signUpId && l.signUpId !== '{}')
    .sort((a, b) => b.createTime - a.createTime)
    .slice(0, 10)
  
  if (logsWithDetails.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm text-gray-500 mb-3">最近记录</h3>
        <div className="text-center text-gray-400 py-4">暂无详细记录</div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm text-gray-500 mb-3">最近记录</h3>
      <div className="space-y-3">
        {logsWithDetails.map((log, idx) => {
          const date = new Date(log.createTime)
          let details = {}
          try {
            details = JSON.parse(log.signUpId)
          } catch (e) {}
          
          const tags = []
          if (details.flow) tags.push({ text: MAP_FLOW[details.flow], type: 'flow' })
          if (details.pain && details.pain !== 0) tags.push({ text: MAP_PAIN[details.pain], type: 'pain' })
          if (details.color) tags.push({ text: MAP_COLOR[details.color], type: 'color' })
          if (details.mood) tags.push({ text: `心情:${MAP_MOOD[details.mood]}`, type: 'mood' })
          if (details.isLove || details.loveMeasure !== undefined) {
            let measure = details.loveMeasure !== undefined ? MAP_LOVE[details.loveMeasure] : '爱爱'
            if (details.loveTime) measure += ` ${details.loveTime}`
            tags.push({ text: `❤️ ${measure}`, type: 'love' })
          }
          
          if (tags.length === 0) tags.push({ text: '打卡完成', type: 'default' })
          
          const tagColors = {
            flow: 'bg-blue-50 text-blue-600',
            pain: 'bg-red-50 text-red-600',
            color: 'bg-orange-50 text-orange-600',
            mood: 'bg-amber-50 text-amber-600',
            love: 'bg-purple-50 text-purple-600',
            default: 'bg-gray-50 text-gray-600',
          }
          
          return (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-12 text-center bg-pink-50 rounded-lg py-1 flex-shrink-0">
                <div className="text-lg font-bold text-pink-500">{String(date.getDate()).padStart(2, '0')}</div>
                <div className="text-[10px] text-pink-400">{date.getMonth() + 1}月</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, i) => (
                  <span key={i} className={`text-[11px] px-2 py-0.5 rounded ${tagColors[tag.type]}`}>
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
  const { 
    isInApp, 
    setTitle,
    showToast, 
    showLoading, 
    hideLoading,
    callNative,
  } = useNativeBridge()
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [periodLogs, setPeriodLogs] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [config, setConfig] = useState({ cycleLen: 28, periodLen: 5 })
  const [lastPeriodStart, setLastPeriodStart] = useState(null)
  
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // 设置页面标题
  useEffect(() => {
    if (isInApp) {
      setTitle('经期管理')
    }
  }, [isInApp, setTitle])
  
  // 加载数据
  useEffect(() => {
    if (isInApp) {
      loadConfig()
      loadData()
    }
  }, [isInApp, currentMonth])
  
  const loadConfig = async () => {
    try {
      const result = await callNative('period.getSettings')
      if (result) {
        setConfig({
          cycleLen: result.cycleLength || 28,
          periodLen: result.periodLength || 5,
        })
      }
    } catch (e) {
      console.error('加载配置失败:', e)
    }
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
        
        // 获取最后经期开始日期
        if (result.lastPeriodStart) {
          setLastPeriodStart(parseDate(result.lastPeriodStart))
        }
      }
      
      // 获取预测
      const pred = await callNative('period.predict')
      if (pred) {
        setPredictions(pred)
      }
    } catch (e) {
      console.error('加载数据失败:', e)
    }
  }
  
  // 计算状态
  const getStatusText = () => {
    if (!lastPeriodStart) {
      return { main: '未记录', sub: '点击"记经期"开始记录' }
    }
    
    const today = new Date()
    const daysSinceStart = diffDays(today, lastPeriodStart) + 1
    
    // 检查是否已结束
    let hasEnded = false
    let endedDayIndex = 0
    
    periodLogs.forEach(log => {
      if (log.signUpId) {
        try {
          const d = JSON.parse(log.signUpId)
          if (d.periodEnded) {
            hasEnded = true
            const logDate = new Date(log.createTime)
            const dayIndex = diffDays(logDate, lastPeriodStart) + 1
            endedDayIndex = Math.max(endedDayIndex, dayIndex)
          }
        } catch (e) {}
      }
    })
    
    let inPeriod = daysSinceStart <= config.periodLen
    if (hasEnded && daysSinceStart >= endedDayIndex) {
      inPeriod = false
    }
    
    if (inPeriod) {
      return { main: `第 ${daysSinceStart} 天`, sub: `经期中 | 周期: ${config.cycleLen}天` }
    } else if (daysSinceStart <= config.cycleLen) {
      const daysLeft = config.cycleLen - daysSinceStart
      return { main: `还有 ${daysLeft} 天`, sub: '距离下次经期' }
    } else {
      const late = daysSinceStart - config.cycleLen
      return { main: `延后 ${late} 天`, sub: '建议注意休息' }
    }
  }
  
  // 保存详情
  const handleSaveDetails = async (data) => {
    try {
      await showLoading('保存中...')
      
      await callNative('period.save', {
        date: formatDate(selectedDate),
        details: JSON.stringify(data),
      })
      
      await hideLoading()
      await showToast('保存成功')
      setShowDetailModal(false)
      loadData()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }
  
  // 删除记录
  const handleDeleteRecord = async () => {
    try {
      await callNative('period.delete', { date: formatDate(selectedDate) })
      await showToast('已删除')
      setShowDetailModal(false)
      loadData()
    } catch (e) {
      await showToast('删除失败: ' + e.message)
    }
  }
  
  // 保存设置
  const handleSaveSettings = async (cycleLen, periodLen) => {
    try {
      await callNative('period.updateSettings', { cycleLength: cycleLen, periodLength: periodLen })
      setConfig({ cycleLen, periodLen })
      setShowSettingsModal(false)
      await showToast('设置已保存')
      loadData()
    } catch (e) {
      await showToast('保存失败: ' + e.message)
    }
  }
  
  // 获取选中日期的记录
  const getSelectedDateLog = () => {
    const dateStr = formatDate(selectedDate)
    return periodLogs.find(l => formatDate(new Date(l.createTime)) === dateStr)
  }
  
  const status = getStatusText()
  
  // 非 App 环境
  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">请在小习惯 App 内打开</h1>
          <p className="text-gray-500 text-sm">经期管理功能需要在 App 内使用</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div 
        className="px-5 pt-5 pb-12 text-white relative"
        style={{ background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">经期管理</h1>
            <p className="text-sm opacity-90 mt-1">关爱自己，从记录开始</p>
          </div>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="text-2xl opacity-90"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      {/* 状态卡片 */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-sm text-gray-500 mb-1">当前状态</div>
          <div className="text-4xl font-bold text-pink-500 mb-1">{status.main}</div>
          <div className="text-sm text-gray-500">{status.sub}</div>
        </div>
      </div>
      
      {/* 日历 */}
      <div className="px-4 mt-4">
        <Calendar 
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date)
            setShowDetailModal(true)
          }}
          periodLogs={periodLogs}
          predictions={predictions}
          config={config}
        />
      </div>
      
      {/* 操作按钮 */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3">
        <button 
          onClick={() => {
            setSelectedDate(new Date())
            setShowDetailModal(true)
          }}
          className="bg-white rounded-xl py-4 shadow-sm flex flex-col items-center text-pink-500"
        >
          <span className="text-xl mb-1">🌸</span>
          <span className="text-sm font-medium">记经期</span>
        </button>
        <button 
          onClick={() => {
            setSelectedDate(new Date())
            setShowDetailModal(true)
          }}
          className="bg-white rounded-xl py-4 shadow-sm flex flex-col items-center text-amber-500"
        >
          <span className="text-xl mb-1">😊</span>
          <span className="text-sm font-medium">记心情</span>
        </button>
        <button 
          onClick={() => {
            setSelectedDate(new Date())
            setShowDetailModal(true)
          }}
          className="bg-white rounded-xl py-4 shadow-sm flex flex-col items-center text-purple-500"
        >
          <span className="text-xl mb-1">❤️</span>
          <span className="text-sm font-medium">记爱爱</span>
        </button>
      </div>
      
      {/* 最近记录 */}
      <div className="px-4 mt-4 pb-8">
        <RecentRecords logs={periodLogs} />
      </div>
      
      {/* 详情弹窗 */}
      <DetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        selectedDate={selectedDate}
        existingLog={getSelectedDateLog()}
        onSave={handleSaveDetails}
        onDelete={handleDeleteRecord}
      />
      
      {/* 设置弹窗 */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onSave={handleSaveSettings}
      />
      
      {/* 动画样式 */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease; }
      `}</style>
    </div>
  )
}

