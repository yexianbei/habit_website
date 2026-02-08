/**
 * 成就展示组件
 */

import React from 'react'
import { generateAchievements, getNextAchievement, getAchievementProgress } from '../achievements'

export const AchievementSection = ({ days, hours, onViewAll }) => {
  // 确保days和hours是数字
  const safeDays = days || 0
  const safeHours = hours || 0
  
  const achievements = generateAchievements(safeDays, safeHours)
  const completedCount = achievements.filter(a => a.achieved).length
  const totalCount = achievements.length
  const nextAchievement = getNextAchievement(achievements)
  
  // 显示最近完成的3个成就和下一个即将达成的成就
  const recentAchievements = achievements
    .filter(a => a.achieved)
    .slice(-3)
    .reverse()
  
  const displayAchievements = [...recentAchievements]
  if (nextAchievement && !displayAchievements.find(a => a.id === nextAchievement.id)) {
    displayAchievements.push(nextAchievement)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-quit-green-dark">成就系统</h4>
            <h3 className="text-lg font-bold text-quit-green-dark">我的成就</h3>
            <p className="text-xs text-gray-500 mt-0.5">已完成 {completedCount}/{totalCount}</p>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-quit-green-dark font-medium px-2 py-1 rounded-lg hover:bg-quit-green/10 active:scale-95 transition-transform"
          >
            查看全部 →
          </button>
        )}
      </div>
      
      {/* 进度条 */}
      <div className="mb-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-quit-green to-quit-green-dark transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {displayAchievements.map((achievement, index) => {
          const progress = getAchievementProgress(achievement, safeDays, safeHours, achievements)
          const isNext = !achievement.achieved && achievement.id === nextAchievement?.id
          
          return (
            <div
              key={achievement.id}
              className={`p-3 rounded-xl border-2 relative overflow-hidden ${
                achievement.achieved
                  ? `bg-gradient-to-br ${achievement.color} ${achievement.borderColor}`
                  : isNext
                  ? 'bg-gray-50 border-2 border-dashed border-quit-green'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {achievement.achieved && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-quit-green rounded-bl-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xl ${achievement.achieved ? '' : 'opacity-50'}`}>
                  {achievement.icon}
                </span>
                <span className={`font-bold text-sm ${achievement.achieved ? 'text-quit-green-dark' : 'text-gray-400'}`}>
                  {achievement.time}{achievement.unit === 'hour' ? '小时' : '天'}
                </span>
              </div>
              <div className="text-xs font-medium text-gray-700 mb-1">{achievement.title}</div>
              <div className="text-[10px] text-gray-500 line-clamp-1">{achievement.desc}</div>
              
              {!achievement.achieved && isNext && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-quit-green transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">还需 {achievement.time - (achievement.unit === 'hour' ? hours : days)}{achievement.unit === 'hour' ? '小时' : '天'}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
