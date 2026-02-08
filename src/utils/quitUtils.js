/**
 * 戒烟功能工具函数
 */

// 格式化日期
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 计算两个日期之间的天数差
export const diffDays = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24))
}

// 计算精确的坚持时间（天数、小时、分钟、秒）
// 如果有破戒记录，从最后一次破戒时间开始计算
export const calculateQuitTime = (quitDate, lastRelapseDate) => {
  if (!quitDate) return null
  
  // 如果有破戒记录，从破戒时间开始计算
  const startDate = lastRelapseDate || quitDate
  
  const now = new Date()
  const start = new Date(startDate)
  const diff = now - start
  
  if (diff < 0) return null
  
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60
  
  return { days, hours, minutes, seconds, totalSeconds }
}

// 格式化数字
export const formatNumber = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toFixed(0)
}
