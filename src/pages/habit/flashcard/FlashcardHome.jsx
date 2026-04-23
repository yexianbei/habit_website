/**
 * 闪卡列表首页
 * 借鉴经期管理 UI 风格
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlashcardData } from './useFlashcardData'
import { useNativeBridge } from '../../../utils/useNativeBridge'
import { deleteFlashcardAllApi } from '../../../utils/flashcardApi'

export default function FlashcardHome() {
  const navigate = useNavigate()
  const { decks, stats, loading } = useFlashcardData()
  const { isInApp, callNative, showToast, closePage } = useNativeBridge()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteFlashcard = async () => {
    if (isDeleting) return

    let confirmed = true
    if (isInApp) {
      try {
        const result = await callNative('ui.showConfirm', {
          title: '删除记忆闪卡',
          message: '确认删除闪卡习惯吗？云端数据与本地习惯都会被删除，且无法恢复。',
        })
        confirmed = result?.confirmed === true
      } catch (_) {
        confirmed = false
      }
    } else {
      confirmed = window.confirm('确认删除闪卡全部云端数据？该操作不可恢复。')
    }
    if (!confirmed) return

    try {
      setIsDeleting(true)
      if (isInApp) {
        await callNative('ui.showLoading', { message: '删除中...' })
      }

      const deleteResult = await deleteFlashcardAllApi()
      const totalDeleted = Number(deleteResult?.totalDeleted || 0)

      if (isInApp) {
        const result = await callNative('habit.deleteWithData', { type: 21 })
        await callNative('ui.hideLoading', {})
        if (result?.success) {
          await showToast(`已删除云端 ${totalDeleted} 条数据，本地习惯已移除`)
          setTimeout(() => closePage(), 800)
          return
        }
        await showToast('云端已删除，本地删除失败，请重试')
      } else {
        window.alert(`云端数据已删除，共 ${totalDeleted} 条`)
        window.location.reload()
      }
    } catch (error) {
      if (isInApp) {
        try {
          await callNative('ui.hideLoading', {})
        } catch (_) {}
        await showToast(`删除失败: ${error?.message || '未知错误'}`)
      } else {
        window.alert(`删除失败: ${error?.message || '未知错误'}`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* 头部装饰 */}
      <div className="relative pt-8 pb-6 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-100/50 to-transparent" />
        
        {/* 标题 */}
        <div className="relative">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">记忆闪卡</h1>
          <p className="text-gray-500 text-sm">碎片时间，高效记忆</p>
        </div>
      </div>

      {/* 统计概览 (Mock) */}
      <div className="px-6 mb-6 relative">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">今日待复习</p>
            <p className="text-3xl font-bold text-gray-800">{stats?.dueToday || 0}</p>
          </div>
          <div className="h-10 w-[1px] bg-gray-100"></div>
          <div>
            <p className="text-xs text-gray-400 mb-1">已掌握</p>
            <p className="text-3xl font-bold text-gray-800">{stats?.mastered || 0}</p>
          </div>
          <div className="h-10 w-[1px] bg-gray-100"></div>
          <div>
            <p className="text-xs text-gray-400 mb-1">坚持天数</p>
            <p className="text-3xl font-bold text-gray-800">{stats?.streakDays || 0}</p>
          </div>
        </div>
      </div>

      {/* 卡组列表 */}
      <div className="px-6 pb-24 space-y-4 relative">
        <h2 className="text-lg font-bold text-gray-800 mb-4">我的卡组</h2>
        
        {decks.map((deck) => (
          <div 
            key={deck.id}
            onClick={() => navigate(`/habit/flashcard/study/${deck.id}`)}
            className="bg-white rounded-2xl p-5 shadow-sm active:scale-98 transition-transform cursor-pointer relative overflow-hidden"
          >
            {/* 进度条背景 */}
            <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
              <div 
                className={`h-full bg-gradient-to-r ${deck.color}`} 
                style={{ width: `${deck.total > 0 ? Math.min(100, ((deck.total - deck.due) / deck.total) * 100) : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deck.color} flex items-center justify-center text-2xl shadow-lg ${deck.shadow}`}>
                  {deck.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{deck.title}</h3>
                  <p className="text-xs text-gray-500">{deck.desc}</p>
                </div>
              </div>
              {deck.due > 0 ? (
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                  待复习 {deck.due}
                </div>
              ) : (
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  已完成
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>总卡片 {deck.total}</span>
              <span>进度 {deck.total > 0 ? Math.round(((deck.total - deck.due) / deck.total) * 100) : 0}%</span>
            </div>
          </div>
        ))}

        {/* 添加新卡组按钮 */}
        <button 
          onClick={() => navigate('/habit/flashcard/import')}
          className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> 添加新卡组 / 导入
        </button>

        <div className="pt-6 flex justify-center">
          <button
            onClick={handleDeleteFlashcard}
            disabled={isDeleting}
            className="px-5 py-2 rounded-full text-xs font-bold text-gray-400 active:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {isDeleting ? '删除中...' : '删除闪卡习惯与云端数据'}
          </button>
        </div>
      </div>
    </div>
  )
}
