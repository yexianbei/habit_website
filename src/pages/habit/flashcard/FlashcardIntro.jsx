import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../../utils/useNativeBridge'

export default function FlashcardIntro() {
  const { 
    isInApp, 
    callNative,
    setTitle,
    showToast, 
    showLoading, 
    hideLoading,
    closePage,
    navigateTo,
  } = useNativeBridge()

  const [isAdding, setIsAdding] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)

  const pageTitle = '记忆闪卡介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  useEffect(() => {
    if (isInApp) {
      checkIfAdded()
    }
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      const result = await callNative('habit.getList', { type: 21 })
      if (result && result.habits && Array.isArray(result.habits) && result.habits.length > 0) {
        setHasAdded(true)
      } else {
        setHasAdded(false)
      }
    } catch (error) {
      console.error('[FlashcardIntro] 检查习惯失败:', error)
      setHasAdded(false)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (hasAdded) return

    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        type: 21,  // 闪卡记忆类型
        name: '记忆闪卡',
        icon: 'habit_35',
        bgColor: '#579d91',
        description: '使用闪卡法复习知识点，巩固记忆'
      })
      await hideLoading()

      const isSuccess = result && (
        result.success === true ||
        (result.habitId && result.habitId.length > 0)
      )

      if (isSuccess) {
        await showToast('已添加到首页')
        setHasAdded(true)
        setTimeout(async () => {
          await closePage()
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        await showToast(errorMsg)
      }
    } catch (e) {
      await hideLoading()
      console.error('[FlashcardIntro] 添加异常:', e)
      await showToast('添加失败: ' + (e?.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await navigateTo('https://tinyhabits.top/habit/flashcard')
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">记忆闪卡</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">记忆闪卡</h2>
                <p className="text-sm text-gray-500">用闪卡法高效复习</p>
              </div>
            </div>

            <div className="space-y-4 mt-6 text-sm text-gray-700">
              <p>· 把知识点拆成「问题-答案」的小卡片，更容易坚持复习。</p>
              <p>· 支持导入题库 / 手动添加，自动记录学习进度。</p>
              <p>· 通过重复和间隔复习，帮助你长期记住重要内容。</p>
            </div>

            <div className="mt-6">
              {hasAdded ? (
                <button
                  onClick={handleEnter}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium shadow-lg shadow-indigo-200"
                >
                  进入记忆闪卡
                </button>
              ) : (
                <button
                  onClick={handleAddHabit}
                  disabled={isAdding}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium shadow-lg shadow-indigo-200 disabled:opacity-60"
                >
                  {isAdding ? '添加中...' : '添加到首页'}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              添加后可在首页快速进入闪卡复习
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


