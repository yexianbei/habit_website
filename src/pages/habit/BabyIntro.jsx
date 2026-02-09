/**
 * 宝宝成长介绍页面
 * 用户从官方习惯库点击后先看到此页面，点击添加后创建习惯
 */
import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'

// 功能特点数据
const features = [
  {
    icon: '🍼',
    title: '喂奶记录',
    desc: '记录每次喂奶的时间、方式和奶量，安心掌握宝宝摄入情况',
  },
  {
    icon: '😴',
    title: '睡眠追踪',
    desc: '记录睡眠时长和次数，逐渐看出宝宝的作息节奏',
  },
  {
    icon: '🌡',
    title: '健康监测',
    desc: '记录体温、疫苗等关键信息，出现异常更早发现',
  },
  {
    icon: '📈',
    title: '成长曲线',
    desc: '按时间查看身高体重曲线，见证一点点长大',
  },
]

export default function BabyIntro() {
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

  // 与原生约定的 HabitTypeBaby（示例：23）
  const HABIT_TYPE_BABY = 23

  // 设置页面标题
  const pageTitle = '宝宝成长介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  // 检查是否已添加此习惯
  useEffect(() => {
    checkIfAdded()
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return

    try {
      const result = await callNative('habit.getList', { type: HABIT_TYPE_BABY })
      if (result?.habits && result.habits.length > 0) {
        setHasAdded(true)
      }
    } catch (error) {
      console.error('[BabyIntro] 检查习惯失败:', error)
    }
  }

  // 添加宝宝成长习惯
  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }

    if (hasAdded) {
      // 已添加，直接进入管理页面（走原生导航，保持与其它习惯一致）
      await navigateTo('https://tinyhabits.top/habit/baby')
      return
    }

    setIsAdding(true)

    try {
      await showLoading('添加中...')

      // 创建宝宝成长习惯
      const result = await callNative('habit.create', {
        type: HABIT_TYPE_BABY,
        name: '宝宝成长',
        icon: 'ic_habit_baby', // 由原生映射到宝宝相关图标
        bgColor: '#FDBA74', // 暖橙渐变主色
        description: '记录宝宝喂奶、睡眠、体温、身高体重等成长数据',
      })

      await hideLoading()

      // 调试日志
      console.log('[BabyIntro] habit.create 返回结果:', result)

      // 判断成功：success 为 true，或者有 habitId（兼容不同返回格式）
      const isSuccess =
        result &&
        (result.success === true || (result.habitId && result.habitId.length > 0))

      if (isSuccess) {
        await showToast('添加成功，请在首页查看')
        setHasAdded(true)

        // 延迟后关闭页面，返回原生栈
        setTimeout(async () => {
          try {
            await closePage()
          } catch (e) {
            console.warn('[BabyIntro] closePage 调用失败:', e)
          }
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        console.error('[BabyIntro] 添加失败:', errorMsg, result)
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
      console.error('[BabyIntro] 添加异常:', error)
      await showToast('添加失败: ' + (error.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  // 进入宝宝成长页面
  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await navigateTo('https://tinyhabits.top/habit/baby')
  }

  // 非 App 环境提示
  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👶</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">宝宝成长</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-orange-400 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* 头部装饰 */}
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-100/60 to-transparent" />

        {/* 图标 */}
        <div className="relative flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FDBA74 0%, #FB7185 100%)',
              boxShadow: '0 8px 32px rgba(251, 113, 133, 0.35)',
            }}
          >
            <span className="text-5xl">👶</span>
          </div>
        </div>

        {/* 标题 */}
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">宝宝成长</h1>
          <p className="text-gray-500 text-sm">记录·陪伴·安心</p>
        </div>
      </div>

      {/* 功能特点 */}
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

      {/* 使用说明 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            使用说明
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入宝宝成长页面</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>可以记录喂奶、睡眠、体温、疫苗、身高和体重</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>部分数据会整理成图表，方便查看长期趋势</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>所有数据仅存储在本地设备，可随时删除或修改</span>
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
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(251, 113, 133, 0.45)' }}
            >
              进入宝宝成长
            </button>
          ) : (
            <button
              onClick={handleAddHabit}
              disabled={isAdding}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
              style={{ boxShadow: '0 4px 20px rgba(251, 113, 133, 0.45)' }}
            >
              {isAdding ? '添加中...' : '添加到首页'}
            </button>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">添加后可在首页快速进入</p>
        </div>
      </div>

      {/* 底部占位 */}
      <div className="h-28" />
    </div>
  )
}

