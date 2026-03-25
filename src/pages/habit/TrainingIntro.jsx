import { BASE_URL } from '../../config'
import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'

const FEATURES = [
  {
    icon: '🏋️',
    title: '记录每一组训练',
    desc: '动作、重量、次数、RPE 一次性记下，回顾更清晰',
  },
  {
    icon: '📅',
    title: '训练计划视图',
    desc: '按训练日拆分推拉腿/全身计划，配合 App 打卡',
  },
  {
    icon: '📊',
    title: '训练量统计',
    desc: '自动统计每日/每周训练量（重量 × 次数），对比趋势',
  },
  {
    icon: '🔒',
    title: '本地隐私存储',
    desc: '所有训练数据仅保存在本机，不上传云端',
  },
]

export default function TrainingIntro() {
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

  // 与原生约定的 HabitTypeStrengthTraining（示例：25）
  const HABIT_TYPE_TRAINING = 25

  const pageTitle = '力量训练介绍'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      const result = await callNative('habit.getList', { type: HABIT_TYPE_TRAINING })
      if (result?.habits && result.habits.length > 0) {
        setHasAdded(true)
      }
    } catch (error) {
      console.error('[TrainingIntro] 检查习惯失败:', error)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }

    if (hasAdded) {
      await navigateTo(`${BASE_URL}/habit/training`)
      return
    }

    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        type: HABIT_TYPE_TRAINING,
        name: '力量训练',
        icon: 'emoji:🏋️',
        emojiIcon: '🏋️',
        bgColor: '#8B5CF6',
        description: '像训记一样记录力量训练、训练计划和训练量统计',
      })
      await hideLoading()

      const isSuccess =
        result &&
        (result.success === true || (result.habitId && result.habitId.length > 0))

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
        console.error('[TrainingIntro] 添加失败:', errorMsg, result)
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
      console.error('[TrainingIntro] 添加异常:', error)
      await showToast('添加失败: ' + (error.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await navigateTo(`${BASE_URL}/habit/training`)
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">力量训练</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-violet-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50">
      {/* 悬浮返回按钮 */}
      <FloatingBackButton />
      
      {/* 头部装饰 */}
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-violet-100/60 to-transparent" />

        <div className="relative flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.35)',
            }}
          >
            <span className="text-5xl">🏋️</span>
          </div>
        </div>

        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">力量训练</h1>
          <p className="text-gray-500 text-sm">像训记一样记录力量训练与训练量</p>
        </div>
      </div>

      {/* 功能特点 */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-medium text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            使用说明
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入力量训练记录页面</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">•</span>
              <span>支持按动作记录重量、次数和 RPE，自动计算训练量</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">•</span>
              <span>可以配置简单的训练计划（如推/拉/腿）并在当天一键加载</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-500 mt-0.5">•</span>
              <span>所有数据仅存储在本地，可随时导出或删除</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          {hasAdded ? (
            <button
              onClick={handleEnter}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45)' }}
            >
              进入力量训练
            </button>
          ) : (
            <button
              onClick={handleAddHabit}
              disabled={isAdding}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
              style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45)' }}
            >
              {isAdding ? '添加中...' : '添加到首页'}
            </button>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">
            添加后可在首页快速进入
          </p>
        </div>
      </div>

      <div className="h-28" />
    </div>
  )
}

