import { BASE_URL } from '../../config'
import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'

export default function SleepIntro() {
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
  
  const pageTitle = '睡眠管理介绍'
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
      // type 20 = HabitTypeSleep
      const result = await callNative('habit.getList', { type: 20 })
      if (result && result.habits && Array.isArray(result.habits) && result.habits.length > 0) {
        setHasAdded(true)
      } else {
        setHasAdded(false)
      }
    } catch (error) {
      console.error('[SleepIntro] 检查习惯失败:', error)
      setHasAdded(false)
    }
  }
  
  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (hasAdded) {
      await navigateTo(`${BASE_URL}/habit/sleep`)
      return
    }
    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        // 对齐 iOS 端 HabitTypeSleep = 20
        type: 20,
        name: '睡眠管理',
        icon: 'emoji:🛌',
        emojiIcon: '🛌',
        bgColor: '#4F46E5',
        description: '记录睡觉与起床时间，统计睡眠时长'
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* 悬浮返回按钮 */}
      <FloatingBackButton />
      
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl text-white shadow-sm">🛌</div>
          <div className="relative text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">睡眠管理</h1>
            <p className="text-gray-500 text-sm">记录·统计·对比</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🕒', title: '记录睡觉起床', desc: '支持跨午夜自动计算' },
            { icon: '📈', title: '统计睡眠时长', desc: '分钟级时长统计' },
            { icon: '📊', title: '周对比柱状图', desc: '本周对比上周' },
            { icon: '🔒', title: '隐私保护', desc: '仅存储在本地' },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            使用说明
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入睡眠管理</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>每日记录睡觉与起床时间，自动统计时长</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>可查看本周与上周的柱状图对比</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>所有数据仅存储在本地，保护隐私</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          {hasAdded ? (
            <button
              onClick={async () => {
                if (isInApp) {
                  await navigateTo(`${BASE_URL}/habit/sleep`)
                } else {
                  window.location.href = '/habit/sleep'
                }
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium active:scale-95 transition-transform"
            >
              进入睡眠管理
            </button>
          ) : (
            <button
              disabled={isAdding}
              onClick={handleAddHabit}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium active:scale-95 transition-transform disabled:opacity-60"
            >
              {isAdding ? '添加中...' : '添加睡眠管理'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

