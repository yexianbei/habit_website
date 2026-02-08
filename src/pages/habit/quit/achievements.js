/**
 * 成就系统相关函数
 */

// 生成完整的成就列表
export const generateAchievements = (days, hours) => {
  const achievements = []
  
  // 新手成就（1-7天）- 鼓励开始
  achievements.push(
    { id: 'first-hour', type: 'newbie', time: 1, unit: 'hour', title: '第一小时', desc: '你已经坚持了1小时！', icon: '🌱', color: 'from-green-100 to-emerald-100', borderColor: 'border-green-300', achieved: hours >= 1 },
    { id: 'first-3hours', type: 'newbie', time: 3, unit: 'hour', title: '三小时战士', desc: '坚持3小时，身体开始恢复', icon: '🌿', color: 'from-green-200 to-emerald-200', borderColor: 'border-green-400', achieved: hours >= 3 },
    { id: 'first-6hours', type: 'newbie', time: 6, unit: 'hour', title: '半天坚持', desc: '6小时了，继续加油！', icon: '🍀', color: 'from-green-300 to-emerald-300', borderColor: 'border-green-500', achieved: hours >= 6 },
    { id: 'first-day', type: 'newbie', time: 1, unit: 'day', title: '第一天', desc: '恭喜完成第一天！这是最重要的开始', icon: '🎯', color: 'from-blue-100 to-cyan-100', borderColor: 'border-blue-300', achieved: days >= 1 },
    { id: 'first-3days', type: 'newbie', time: 3, unit: 'day', title: '三天坚持', desc: '尼古丁开始清除，身体在恢复', icon: '⭐', color: 'from-blue-200 to-cyan-200', borderColor: 'border-blue-400', achieved: days >= 3 },
    { id: 'first-week', type: 'newbie', time: 7, unit: 'day', title: '第一周', desc: '一周了！你已经建立了初步习惯', icon: '🌟', color: 'from-blue-300 to-cyan-300', borderColor: 'border-blue-500', achieved: days >= 7 },
  )
  
  // 坚持成就（7-30天）- 建立习惯
  achievements.push(
    { id: 'two-weeks', type: 'persistent', time: 14, unit: 'day', title: '两周坚持', desc: '循环系统显著改善', icon: '💪', color: 'from-purple-100 to-violet-100', borderColor: 'border-purple-300', achieved: days >= 14 },
    { id: 'three-weeks', type: 'persistent', time: 21, unit: 'day', title: '三周挑战', desc: '习惯正在形成，保持住！', icon: '🔥', color: 'from-purple-200 to-violet-200', borderColor: 'border-purple-400', achieved: days >= 21 },
    { id: 'first-month', type: 'persistent', time: 30, unit: 'day', title: '第一个月', desc: '肺功能显著提升，你太棒了！', icon: '🏅', color: 'from-purple-300 to-violet-300', borderColor: 'border-purple-500', achieved: days >= 30 },
  )
  
  // 进阶成就（30-100天）- 巩固成果
  achievements.push(
    { id: '45-days', type: 'advanced', time: 45, unit: 'day', title: '45天坚持', desc: '一个半月了，你正在改变自己', icon: '💎', color: 'from-amber-100 to-orange-100', borderColor: 'border-amber-300', achieved: days >= 45 },
    { id: 'two-months', type: 'advanced', time: 60, unit: 'day', title: '两个月', desc: '心血管健康大幅改善', icon: '👑', color: 'from-amber-200 to-orange-200', borderColor: 'border-amber-400', achieved: days >= 60 },
    { id: '100-days', type: 'advanced', time: 100, unit: 'day', title: '百日挑战', desc: '100天！这是巨大的里程碑', icon: '🎖️', color: 'from-amber-300 to-orange-300', borderColor: 'border-amber-500', achieved: days >= 100 },
  )
  
  // 大师成就（100-365天）- 长期坚持
  achievements.push(
    { id: 'half-year', type: 'master', time: 180, unit: 'day', title: '半年坚持', desc: '身体基本恢复，你已经是大师了', icon: '🏆', color: 'from-red-100 to-pink-100', borderColor: 'border-red-300', achieved: days >= 180 },
    { id: 'nine-months', type: 'master', time: 270, unit: 'day', title: '九个月', desc: '接近一年了，你创造了奇迹', icon: '💫', color: 'from-red-200 to-pink-200', borderColor: 'border-red-400', achieved: days >= 270 },
    { id: 'one-year', type: 'master', time: 365, unit: 'day', title: '一年坚持', desc: '一年了！你完全恢复了健康', icon: '👑', color: 'from-red-300 to-pink-300', borderColor: 'border-red-500', achieved: days >= 365 },
  )
  
  // 传奇成就（365天以上）
  achievements.push(
    { id: 'two-years', type: 'legend', time: 730, unit: 'day', title: '两年坚持', desc: '两年了！你是真正的传奇', icon: '🌟', color: 'from-yellow-100 to-amber-100', borderColor: 'border-yellow-300', achieved: days >= 730 },
    { id: 'three-years', type: 'legend', time: 1095, unit: 'day', title: '三年坚持', desc: '三年！你超越了99%的人', icon: '⭐', color: 'from-yellow-200 to-amber-200', borderColor: 'border-yellow-400', achieved: days >= 1095 },
  )
  
  return achievements
}

// 获取下一个即将达成的成就
export const getNextAchievement = (achievements) => {
  return achievements.find(a => !a.achieved) || null
}

// 计算成就进度百分比
export const getAchievementProgress = (achievement, days, hours, allAchievements) => {
  if (achievement.achieved) return 100
  
  const currentTime = achievement.unit === 'hour' ? hours : days
  const targetTime = achievement.time
  
  if (currentTime >= targetTime) return 100
  
  // 找到前一个成就作为起点
  const prevAchievements = allAchievements.filter(a => a.achieved && a.unit === achievement.unit)
  const prevAchievement = prevAchievements.length > 0 
    ? prevAchievements[prevAchievements.length - 1]
    : null
  
  const startTime = prevAchievement ? prevAchievement.time : 0
  const range = targetTime - startTime
  if (range <= 0) return 0
  
  const progress = ((currentTime - startTime) / range) * 100
  
  return Math.max(0, Math.min(100, progress))
}
