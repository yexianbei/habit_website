/**
 * 渐进式戒烟工具函数
 */

import { formatDate } from './quitUtils'

/**
 * 计算渐进式戒烟计划
 * @param {number} initialCount - 初始每日根数
 * @param {number} targetCount - 目标每日根数
 * @param {number} weeks - 计划周期（周数）
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @returns {Array} 每周的目标根数数组
 */
export const calculateGradualPlan = (initialCount, targetCount, weeks, startDate) => {
  const plan = []
  const totalReduction = initialCount - targetCount
  const reductionPerWeek = totalReduction / weeks

  for (let week = 0; week < weeks; week++) {
    const target = Math.max(targetCount, Math.round(initialCount - reductionPerWeek * (week + 1)))
    plan.push({
      week: week + 1,
      targetCount: target,
      startDate: getWeekStartDate(startDate, week),
      endDate: getWeekEndDate(startDate, week),
    })
  }

  return plan
}

/**
 * 获取第N周的开始日期
 */
const getWeekStartDate = (startDate, weekIndex) => {
  const date = new Date(startDate)
  date.setDate(date.getDate() + weekIndex * 7)
  return formatDate(date)
}

/**
 * 获取第N周的结束日期
 */
const getWeekEndDate = (startDate, weekIndex) => {
  const date = new Date(startDate)
  date.setDate(date.getDate() + weekIndex * 7 + 6)
  return formatDate(date)
}

/**
 * 计算两个日期之间的天数差
 */
export const diffDays = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24))
}

/**
 * 计算距离上次吸烟的时间
 * @param {string} lastSmokeTime - ISO 日期字符串
 * @returns {object} { days, hours, minutes, seconds }
 */
export const calculateTimeSinceLastSmoke = (lastSmokeTime) => {
  if (!lastSmokeTime) return null

  const now = new Date()
  const last = new Date(lastSmokeTime)
  const diff = now - last

  if (diff < 0) return null

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, totalSeconds }
}

/**
 * 格式化时间差为可读字符串
 */
export const formatTimeSince = (timeObj) => {
  if (!timeObj) return '未知'

  if (timeObj.days > 0) {
    return `${timeObj.days}天${timeObj.hours}小时`
  } else if (timeObj.hours > 0) {
    return `${timeObj.hours}小时${timeObj.minutes}分钟`
  } else if (timeObj.minutes > 0) {
    return `${timeObj.minutes}分钟`
  } else {
    return `${timeObj.seconds}秒`
  }
}

/**
 * 计算焦油量（毫克）
 * 假设每根香烟平均含焦油 10-15mg，这里取 12mg
 */
export const calculateTarAmount = (cigaretteCount, tarPerCigarette = 12) => {
  return cigaretteCount * tarPerCigarette
}

/**
 * 计算今日花费
 */
export const calculateTodayCost = (cigaretteCount, pricePerCigarette) => {
  return cigaretteCount * pricePerCigarette
}

/**
 * 获取本周的开始和结束日期
 */
export const getWeekRange = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一为开始
  const start = new Date(d.setDate(diff))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}

/**
 * 获取本月的开始和结束日期
 */
export const getMonthRange = (date = new Date()) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)

  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}

/**
 * 计算周统计
 */
export const calculateWeekStats = (records, weekRange) => {
  const weekRecords = records.filter(r => {
    const recordDate = r.date || r.details?.date
    return recordDate >= weekRange.start && recordDate <= weekRange.end
  })

  const total = weekRecords.reduce((sum, r) => sum + (r.count || 0), 0)
  const average = weekRecords.length > 0 ? (total / weekRecords.length).toFixed(1) : 0
  const max = weekRecords.length > 0 ? Math.max(...weekRecords.map(r => r.count || 0)) : 0
  const min = weekRecords.length > 0 ? Math.min(...weekRecords.map(r => r.count || 0)) : 0

  return {
    total,
    average: parseFloat(average),
    max,
    min,
    days: weekRecords.length,
  }
}

/**
 * 计算月统计
 */
export const calculateMonthStats = (records, monthRange) => {
  const monthRecords = records.filter(r => {
    const recordDate = r.date || r.details?.date
    return recordDate >= monthRange.start && recordDate <= monthRange.end
  })

  const total = monthRecords.reduce((sum, r) => sum + (r.count || 0), 0)
  const average = monthRecords.length > 0 ? (total / monthRecords.length).toFixed(1) : 0
  const max = monthRecords.length > 0 ? Math.max(...monthRecords.map(r => r.count || 0)) : 0
  const min = monthRecords.length > 0 ? Math.min(...monthRecords.map(r => r.count || 0)) : 0

  return {
    total,
    average: parseFloat(average),
    max,
    min,
    days: monthRecords.length,
  }
}
