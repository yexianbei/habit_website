/**
 * 统计卡片组件
 */

import React from 'react'

// 标准统计卡片
export const StatsCard = ({ icon, title, value, subtitle, gradient, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-3xl p-6 shadow-lg ${gradient} relative overflow-hidden ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{icon}</span>
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1">{value}</div>
        {subtitle && <div className="text-sm text-white/70">{subtitle}</div>}
        {onClick && (
          <div className="mt-3 text-xs text-white/60 flex items-center gap-1">
            <span>点击查看详情</span>
            <span>→</span>
          </div>
        )}
      </div>
      {/* 装饰圆形 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
    </div>
  )
}

// 紧凑型统计卡片组件（手机端单行显示）
export const CompactStatsCard = ({ icon, title, value, subtitle, gradient, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex-1 rounded-2xl p-3 shadow-md ${gradient} relative overflow-hidden ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      <div className="relative z-10 text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-lg font-bold text-white mb-0.5">{value}</div>
        <div className="text-xs text-white/80">{title}</div>
        {subtitle && <div className="text-xs text-white/70 mt-0.5">{subtitle}</div>}
      </div>
      {/* 装饰圆形 */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/10 rounded-full" />
    </div>
  )
}
