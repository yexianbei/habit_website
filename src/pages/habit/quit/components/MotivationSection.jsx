/**
 * 激励内容组件
 */

import React from 'react'

export const MotivationSection = ({ motivation }) => {
  if (!motivation) return null

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💪</span>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-800 mb-1">今日激励</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{motivation.text || motivation}</p>
        </div>
      </div>
    </div>
  )
}
