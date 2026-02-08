/**
 * 成就详情弹窗
 */

import React from 'react'
import { generateAchievements, getNextAchievement, getAchievementProgress } from '../../achievements'

export const AchievementDetailModal = ({ isOpen, onClose, days, hours }) => {
  if (!isOpen) return null

  // 确保days和hours是数字
  const safeDays = days || 0
  const safeHours = hours || 0

  const achievements = generateAchievements(safeDays, safeHours)
  const completedCount = achievements.filter(a => a.achieved).length
  const totalCount = achievements.length
  
  // 按类型分组
  const achievementsByType = {
    newbie: achievements.filter(a => a.type === 'newbie'),
    persistent: achievements.filter(a => a.type === 'persistent'),
    advanced: achievements.filter(a => a.type === 'advanced'),
    master: achievements.filter(a => a.type === 'master'),
    legend: achievements.filter(a => a.type === 'legend'),
  }
  
  const typeLabels = {
    newbie: { title: '🌱 新手成就', desc: '开始你的戒烟之旅' },
    persistent: { title: '💪 坚持成就', desc: '建立稳定的习惯' },
    advanced: { title: '💎 进阶成就', desc: '巩固你的成果' },
    master: { title: '🏆 大师成就', desc: '长期坚持的证明' },
    legend: { title: '⭐ 传奇成就', desc: '超越极限的荣耀' },
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              成就系统
            </h2>
            <p className="text-xs text-gray-500 mt-1">已完成 {completedCount}/{totalCount} 个成就</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 总体进度 */}
          <div className="bg-gradient-to-br from-quit-green/10 to-quit-green-dark/10 rounded-2xl p-4 border border-quit-green">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-quit-green-dark">总体进度</span>
              <span className="text-sm font-bold text-quit-green-dark">{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-quit-green to-quit-green-dark transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* 按类型展示成就 */}
          {Object.entries(achievementsByType).map(([type, typeAchievements]) => {
            if (typeAchievements.length === 0) return null
            
            const typeLabel = typeLabels[type]
            const typeCompleted = typeAchievements.filter(a => a.achieved).length
            
            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{typeLabel.title}</h3>
                    <p className="text-xs text-gray-500">{typeLabel.desc}</p>
                  </div>
                  <span className="text-xs text-gray-500">{typeCompleted}/{typeAchievements.length}</span>
                </div>
                
                <div className="space-y-2">
                  {typeAchievements.map((achievement) => {
                    const progress = getAchievementProgress(achievement, safeDays, safeHours, achievements)
                    const isNext = !achievement.achieved && achievement.id === getNextAchievement(achievements)?.id
                    
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-xl border-2 relative ${
                          achievement.achieved
                            ? `bg-gradient-to-br ${achievement.color} ${achievement.borderColor}`
                            : isNext
                            ? 'bg-gray-50 border-2 border-dashed border-quit-green'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {achievement.achieved && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-quit-green rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${achievement.achieved ? '' : 'opacity-50'}`}>
                            {achievement.icon}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-base ${achievement.achieved ? 'text-quit-green-dark' : 'text-gray-400'}`}>
                                {achievement.time}{achievement.unit === 'hour' ? '小时' : '天'}
                              </span>
                              {achievement.achieved && (
                                <span className="text-xs bg-quit-green text-white px-2 py-0.5 rounded-full">已完成</span>
                              )}
                              {isNext && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">即将达成</span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mb-1">{achievement.title}</div>
                            <div className="text-xs text-gray-500 mb-2">{achievement.desc}</div>
                            
                            {!achievement.achieved && (
                              <div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                                  <div 
                                    className="h-full bg-quit-green transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500">
                                  还需 {achievement.time - (achievement.unit === 'hour' ? safeHours : safeDays)}{achievement.unit === 'hour' ? '小时' : '天'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
