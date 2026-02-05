/**
 * 经期管理页面
 * 用于 App 内 WebView 打开，通过 NativeBridge 与原生通信
 * 
 * 功能：
 * - 记录经期开始/结束
 * - 日历视图展示经期、排卵日、易孕期
 * - 智能预测下次经期
 * - 设置周期和经期长度
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNativeBridge, useNativeEvent } from '../../utils/useNativeBridge'

// 经期状态
const PERIOD_STATUS = {
  NONE: 'none',           // 未记录
  PERIOD: 'period',       // 经期中
  FERTILE: 'fertile',     // 易孕期
  OVULATION: 'ovulation', // 排卵日
  SAFE: 'safe',           // 安全期
  PREDICTED: 'predicted', // 预测经期
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case PERIOD_STATUS.PERIOD:
      return '#FF6B8A'
    case PERIOD_STATUS.PREDICTED:
      return '#FFAFC5'
    case PERIOD_STATUS.FERTILE:
      return '#FFB84D'
    case PERIOD_STATUS.OVULATION:
      return '#FF4D6A'
    case PERIOD_STATUS.SAFE:
      return '#4CAF50'
    default:
      return '#9E9E9E'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case PERIOD_STATUS.PERIOD:
      return '经期中'
    case PERIOD_STATUS.PREDICTED:
      return '预测经期'
    case PERIOD_STATUS.FERTILE:
      return '易孕期'
    case PERIOD_STATUS.OVULATION:
      return '排卵日'
    case PERIOD_STATUS.SAFE:
      return '安全期'
    default:
      return '未记录'
  }
}

// 日历组件
const Calendar = ({ selectedDate, onDateSelect, periodDates, predictions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // 添加前面的空白天
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // 添加当月的天
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }
  
  const formatDate = (date) => {
    if (!date) return ''
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  const getDateStatus = (date) => {
    if (!date) return PERIOD_STATUS.NONE
    const dateStr = formatDate(date)
    
    // 已记录的经期
    if (periodDates.includes(dateStr)) {
      return PERIOD_STATUS.PERIOD
    }
    // 预测的经期
    if (predictions?.predictedDates?.includes(dateStr)) {
      return PERIOD_STATUS.PREDICTED
    }
    // 排卵日
    if (predictions?.ovulationDate === dateStr) {
      return PERIOD_STATUS.OVULATION
    }
    // 易孕期
    if (predictions?.fertileDates?.includes(dateStr)) {
      return PERIOD_STATUS.FERTILE
    }
    return PERIOD_STATUS.NONE
  }
  
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-medium">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="aspect-square" />
          }
          
          const status = getDateStatus(date)
          const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate)
          const isToday = formatDate(date) === formatDate(new Date())
          const hasStatus = status !== PERIOD_STATUS.NONE
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm relative
                transition-all duration-200 active:scale-95
                ${isSelected ? 'ring-2 ring-pink-500 ring-offset-1' : ''}
                ${isToday ? 'font-bold' : ''}
              `}
              style={{
                backgroundColor: hasStatus ? getStatusColor(status) + '30' : 'transparent',
                color: (status === PERIOD_STATUS.PERIOD || status === PERIOD_STATUS.PREDICTED) ? '#FF6B8A' : 'inherit',
              }}
            >
              {date.getDate()}
              {status === PERIOD_STATUS.PERIOD && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full" />
              )}
              {status === PERIOD_STATUS.PREDICTED && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-pink-300 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(PERIOD_STATUS.PERIOD) }} />
          <span>经期</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(PERIOD_STATUS.PREDICTED) }} />
          <span>预测</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(PERIOD_STATUS.OVULATION) }} />
          <span>排卵日</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(PERIOD_STATUS.FERTILE) }} />
          <span>易孕期</span>
        </div>
      </div>
    </div>
  )
}

// 主页面组件
export default function PeriodManagement() {
  const { 
    isInApp, 
    platform,
    setTitle,
    showToast, 
    showLoading, 
    hideLoading,
    savePeriodRecord,
    getPeriodRecords,
    predictNextPeriod,
    showDatePicker,
    callNative,
  } = useNativeBridge()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [periodDates, setPeriodDates] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  
  // 设置页面标题
  useEffect(() => {
    if (isInApp) {
      setTitle('经期管理')
    }
  }, [isInApp, setTitle])
  
  // 加载数据
  useEffect(() => {
    loadData()
  }, [])
  
  // 监听经期数据更新事件
  useNativeEvent('periodUpdated', () => {
    loadData()
  })
  
  const loadData = async () => {
    if (!isInApp) return
    
    try {
      // 获取最近 3 个月的记录
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      
      const startStr = formatDateStr(startDate)
      const endStr = formatDateStr(endDate)
      
      const result = await getPeriodRecords(startStr, endStr)
      if (result?.records) {
        setPeriodDates(result.records.map(r => r.date))
      }
      
      // 获取预测
      const prediction = await predictNextPeriod()
      if (prediction) {
        setPredictions(prediction)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
  
  const formatDateStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  // 记录经期开始
  const handleStartPeriod = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    
    try {
      await showLoading('记录中...')
      
      // 计算经期日期（默认 5 天）
      const dates = []
      for (let i = 0; i < periodLength; i++) {
        const date = new Date(selectedDate)
        date.setDate(date.getDate() + i)
        dates.push(formatDateStr(date))
      }
      
      await savePeriodRecord({
        startDate: formatDateStr(selectedDate),
        endDate: formatDateStr(new Date(selectedDate.getTime() + (periodLength - 1) * 24 * 60 * 60 * 1000)),
        dates: dates,
        cycleLength: cycleLength,
      })
      
      await hideLoading()
      await showToast('记录成功')
      
      // 刷新数据
      loadData()
    } catch (error) {
      await hideLoading()
      await showToast('记录失败: ' + error.message)
    }
  }
  
  // 非 App 环境的提示
  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">请在小习惯 App 内打开</h1>
          <p className="text-gray-500 text-sm">经期管理功能需要在 App 内使用</p>
          <a 
            href="https://apps.apple.com/app/id1455083310" 
            className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* 顶部状态卡片 */}
      <div className="p-4">
        <div 
          className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)' }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {predictions?.daysUntilNext || '--'}
            </div>
            <div className="text-sm opacity-90">
              {predictions?.nextStartDate ? '天后来经期' : '记录经期以获取预测'}
            </div>
            {predictions?.nextStartDate && (
              <div className="mt-2 text-xs opacity-80">
                预计 {predictions.nextStartDate}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 日历 */}
      <div className="px-4">
        <Calendar 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          periodDates={periodDates}
          predictions={predictions}
        />
      </div>
      
      {/* 快捷操作 */}
      <div className="p-4 space-y-3">
        <button
          onClick={handleStartPeriod}
          className="w-full py-4 bg-pink-500 text-white rounded-xl font-medium shadow-lg shadow-pink-200 active:scale-98 transition-transform"
        >
          记录经期开始
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => callNative('ui.showActionSheet', {
              title: '周期长度',
              options: ['25天', '26天', '27天', '28天', '29天', '30天', '31天', '32天']
            }).then(res => {
              if (res?.index !== undefined) {
                setCycleLength(25 + res.index)
              }
            })}
            className="py-3 bg-white rounded-xl text-gray-700 shadow-sm"
          >
            <div className="text-xs text-gray-500">周期长度</div>
            <div className="font-medium">{cycleLength} 天</div>
          </button>
          
          <button
            onClick={() => callNative('ui.showActionSheet', {
              title: '经期长度',
              options: ['3天', '4天', '5天', '6天', '7天', '8天']
            }).then(res => {
              if (res?.index !== undefined) {
                setPeriodLength(3 + res.index)
              }
            })}
            className="py-3 bg-white rounded-xl text-gray-700 shadow-sm"
          >
            <div className="text-xs text-gray-500">经期长度</div>
            <div className="font-medium">{periodLength} 天</div>
          </button>
        </div>
      </div>
      
      {/* 健康提示 */}
      <div className="px-4 pb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-2">💡 健康小贴士</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            规律记录经期可以帮助您更好地了解自己的身体周期，
            预测下次经期和排卵日，为健康管理提供参考。
          </p>
        </div>
      </div>
    </div>
  )
}
