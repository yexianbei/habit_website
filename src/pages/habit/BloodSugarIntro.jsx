/**
 * 血糖记录介绍页面
 * 用户从官方习惯库点击后先看到此页面，点击添加后创建习惯
 */
import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'

const features = [
  {
    icon: '🩸',
    title: '多场景记录',
    desc: '空腹、餐前、餐后都可以单独记录，方便医生查看',
  },
  {
    icon: '📊',
    title: '趋势查看',
    desc: '按天/周查看血糖变化，识别高低波动',
  },
  {
    icon: '💊',
    title: '用药关联',
    desc: '记录胰岛素/口服药，观察药物调整效果',
  },
  {
    icon: '🔒',
    title: '隐私保护',
    desc: '数据仅存储在本机，不上传到云端',
  },
]

export default function BloodSugarIntro() {
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

  // 与原生约定的 HabitTypeBloodSugar（示例：24）
  const HABIT_TYPE_BLOOD_SUGAR = 24

  const pageTitle = '血糖记录介绍'
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
      const result = await callNative('habit.getList', { type: HABIT_TYPE_BLOOD_SUGAR })
      if (result?.habits && result.habits.length > 0) {
        setHasAdded(true)
      }
    } catch (error) {
      console.error('[BloodSugarIntro] 检查习惯失败:', error)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (hasAdded) {
      await navigateTo('https://tinyhabits.top/habit/glucose')
      return
    }
    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        type: HABIT_TYPE_BLOOD_SUGAR,
        name: '血糖记录',
        icon: 'ic_habit_blood_sugar',
        bgColor: '#F97373',
        description: '记录每日血糖，配合用药调整，守护血糖稳定',
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
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
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
    await navigateTo('https://tinyhabits.top/habit/glucose')
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🩸</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">血糖记录</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-rose-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-rose-100/60 to-transparent" />

        <div className="relative flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FB7185 0%, #F97373 100%)',
              boxShadow: '0 8px 32px rgba(248, 113, 113, 0.35)',
            }}
          >
            <span className="text-5xl">🩸</span>
          </div>
        </div>

        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">血糖记录</h1>
          <p className="text-gray-500 text-sm">记录·对比·守护血糖稳定</p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
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
              <span className="text-rose-500 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入血糖记录页面</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>支持区分空腹、餐前、餐后血糖，方便回顾</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>可以记录当前是否使用胰岛素或口服药</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>所有数据仅存储在本地，可随时导出或展示给医生</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          {hasAdded ? (
            <button
              onClick={handleEnter}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-400 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(248, 113, 113, 0.45)' }}
            >
              进入血糖记录
            </button>
          ) : (
            <button
              onClick={handleAddHabit}
              disabled={isAdding}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-400 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
              style={{ boxShadow: '0 4px 20px rgba(248, 113, 113, 0.45)' }}
            >
              {isAdding ? '添加中...' : '添加到首页'}
            </button>
          )}
          <p className="text-center text-xs text-gray-400 mt-3">
            建议配合医生指导，一起使用
          </p>
        </div>
      </div>

      <div className="h-28" />
    </div>
  )
}

