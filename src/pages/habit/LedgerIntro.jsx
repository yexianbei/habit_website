import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'

export default function LedgerIntro() {
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
  
  const pageTitle = '记账介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])
  
  useEffect(() => {
    checkIfAdded()
  }, [isInApp])
  
  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      // 22 = HabitTypeAccounting
      const result = await callNative('habit.getList', { type: 22 })
      if (result && result.habits && Array.isArray(result.habits) && result.habits.length > 0) {
        setHasAdded(true)
      } else {
        setHasAdded(false)
      }
    } catch (error) {
      setHasAdded(false)
    }
  }
  
  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (hasAdded) {
      await navigateTo('https://tinyhabits.top/habit/accounting')
      return
    }
    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        // 对齐 iOS 端 HabitTypeAccounting = 22
        type: 22,
        name: '记账',
        icon: 'ic_habit_lib_1',
        bgColor: '#34D399',
        description: '多账本记账与分类统计'
      })
      await hideLoading()
      const isSuccess = result && (
        result.success === true || 
        (result.habitId && result.habitId.length > 0)
      )
      if (isSuccess) {
        await showToast('添加成功，请在首页查看')
        setHasAdded(true)
        setTimeout(async () => {
          try {
            await closePage()
          } catch (_) {}
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
      await showToast('添加失败: ' + error.message)
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center text-2xl text-white shadow-sm">📒</div>
          <div className="relative text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">记账</h1>
            <p className="text-gray-500 text-sm">多账本·分类统计·简洁高效</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '📚', title: '多账本', desc: '分别管理个人、家庭、旅行等账本' },
            { icon: '🧾', title: '支出与收入', desc: '快速录入金额与分类' },
            { icon: '📊', title: '分类统计', desc: '支出与收入柱状图对比' },
            { icon: '🔒', title: '隐私保护', desc: '数据仅本地存储' },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          {hasAdded ? (
            <button
              onClick={async () => {
                if (isInApp) {
                  await navigateTo('https://tinyhabits.top/habit/accounting')
                } else {
                  window.location.href = '/habit/accounting'
                }
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 text-white font-medium active:scale-95 transition-transform"
            >
              进入记账
            </button>
          ) : (
            <button
              disabled={isAdding}
              onClick={handleAddHabit}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 text-white font-medium active:scale-95 transition-transform disabled:opacity-60"
            >
              {isAdding ? '添加中...' : '添加记账'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

