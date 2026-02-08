/**
 * 破戒记录弹窗组件
 */

import React, { useState } from 'react'
import { formatDate } from '../../../../../utils/quitUtils'

export const RelapseModal = ({ isOpen, onClose, onSave }) => {
  const [relapseDate, setRelapseDate] = useState(formatDate(new Date()))
  const [relapseTime, setRelapseTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [cigaretteType, setCigaretteType] = useState('')
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    const datetime = `${relapseDate}T${relapseTime}:00`
    onSave({
      datetime,
      cigaretteType,
      note,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🚭</span>
            记录破戒
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-700">
              ⚠️ 记录破戒后，戒烟时间将从破戒时间重新开始计算。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">破戒日期</label>
            <input
              type="date"
              value={relapseDate}
              onChange={(e) => setRelapseDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">破戒时间</label>
            <input
              type="time"
              value={relapseTime}
              onChange={(e) => setRelapseTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">香烟类型（可选）</label>
            <input
              type="text"
              value={cigaretteType}
              onChange={(e) => setCigaretteType(e.target.value)}
              placeholder="例如：中华、红塔山等"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录当时的情况或感受..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:scale-95 transition-transform"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-lg active:scale-95 transition-transform"
            >
              确认记录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
