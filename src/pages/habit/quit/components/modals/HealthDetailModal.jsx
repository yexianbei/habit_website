/**
 * 健康数据详情弹窗
 */

import React from 'react'
import { QUIT_RECOVERY_STAGES } from '../../constants'

// 计算当前所处的阶段
const getCurrentStage = (days) => {
  if (!days || days < 0) return null
  
  // 转换为小时进行比较
  const hours = days * 24
  
  for (let i = QUIT_RECOVERY_STAGES.length - 1; i >= 0; i--) {
    const stage = QUIT_RECOVERY_STAGES[i]
    let stageHours = 0
    
    if (stage.unit === '小时') {
      stageHours = stage.time
    } else if (stage.unit === '周') {
      stageHours = stage.time * 24
    } else if (stage.unit === '月') {
      stageHours = stage.time * 30 * 24
    } else if (stage.unit === '年') {
      stageHours = stage.time * 365 * 24
    }
    
    if (hours >= stageHours) {
      return { stage, index: i, isCurrent: true }
    }
  }
  
  return { stage: QUIT_RECOVERY_STAGES[0], index: 0, isCurrent: true }
}

export const HealthDetailModal = ({ isOpen, onClose, healthData, days, quitDate }) => {
  if (!isOpen) return null

  const currentStageInfo = getCurrentStage(days)
  const currentStage = currentStageInfo?.stage
  const currentIndex = currentStageInfo?.index || 0

  // 计算进度（基于当前阶段）
  const getProgressPercent = () => {
    if (!days || days < 0) return 0
    const hours = days * 24
    
    // 找到下一个阶段
    let nextStageHours = 365 * 24 // 默认1年
    for (let i = currentIndex + 1; i < QUIT_RECOVERY_STAGES.length; i++) {
      const stage = QUIT_RECOVERY_STAGES[i]
      if (stage.unit === '小时') {
        nextStageHours = stage.time
        break
      } else if (stage.unit === '周') {
        nextStageHours = stage.time * 24
        break
      } else if (stage.unit === '月') {
        nextStageHours = stage.time * 30 * 24
        break
      } else if (stage.unit === '年') {
        nextStageHours = stage.time * 365 * 24
        break
      }
    }
    
    // 当前阶段的开始时间
    let currentStageHours = 0
    if (currentIndex > 0) {
      const prevStage = QUIT_RECOVERY_STAGES[currentIndex - 1]
      if (prevStage.unit === '小时') {
        currentStageHours = prevStage.time
      } else if (prevStage.unit === '周') {
        currentStageHours = prevStage.time * 24
      } else if (prevStage.unit === '月') {
        currentStageHours = prevStage.time * 30 * 24
      } else if (prevStage.unit === '年') {
        currentStageHours = prevStage.time * 365 * 24
      }
    }
    
    if (nextStageHours <= currentStageHours) return 100
    const progress = ((hours - currentStageHours) / (nextStageHours - currentStageHours)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const progress = getProgressPercent()

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            健康恢复进度
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 当前阶段展示 */}
          {currentStage && (
            <div className={`bg-gradient-to-br ${currentStage.color} rounded-2xl p-5 border-2 border-quit-green`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">当前阶段</div>
                  <div className="text-2xl font-bold text-gray-800">{currentStage.title}</div>
                </div>
                <div className="text-4xl">{currentStage.benefits[0]?.icon || '❤️'}</div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{currentStage.description}</p>
              
              {/* 进度条 */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>阶段进度</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-quit-green rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* 当前阶段的益处 */}
              <div className="space-y-2">
                {currentStage.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{benefit.icon}</span>
                    <span className="text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 完整恢复时间轴 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📅</span>
              身体恢复时间轴
            </h3>
            <div className="space-y-4">
              {QUIT_RECOVERY_STAGES.map((stage, index) => {
                const isCompleted = index <= currentIndex
                const isCurrent = index === currentIndex
                
                return (
                  <div
                    key={index}
                    className={`relative pl-8 pb-4 ${
                      isCompleted ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    {/* 时间轴线条 */}
                    {index < QUIT_RECOVERY_STAGES.length - 1 && (
                      <div 
                        className={`absolute left-3 top-8 bottom-0 w-0.5 ${
                          isCompleted ? 'bg-quit-green' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    {/* 时间轴节点 */}
                    <div className="absolute left-0 top-1">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isCurrent
                            ? 'bg-quit-green border-quit-green-dark scale-125'
                            : isCompleted
                            ? 'bg-quit-green border-quit-green-dark'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* 内容 */}
                    <div className={`bg-gradient-to-br ${stage.color} rounded-xl p-4 ${isCurrent ? 'ring-2 ring-quit-green' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-800">{stage.title}</div>
                        {isCurrent && (
                          <span className="text-xs bg-quit-green text-white px-2 py-1 rounded-full">当前</span>
                        )}
                        {isCompleted && !isCurrent && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">已完成</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {stage.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs bg-white/60 px-2 py-1 rounded">
                            <span>{benefit.icon}</span>
                            <span className="text-gray-700">{benefit.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 健康小贴士 */}
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 <strong>科学依据：</strong>以上数据基于医学研究，展示了戒烟后身体逐步恢复的过程。每个人的恢复速度可能略有不同，但总体趋势是一致的。继续坚持，你的身体会越来越好！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
