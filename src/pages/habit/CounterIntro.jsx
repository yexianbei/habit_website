/**
 * 指尖计数器介绍页
 * 用户从习惯库点击后先看到此页面，点击添加后创建习惯（type: 26）
 */

import React, { useState, useEffect } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { PresentationKind } from '../../constants/presentationKind'
import FloatingBackButton from '../../components/FloatingBackButton'

const features = [
  {
    icon: '👆',
    title: '极简计数',
    desc: '一键点击即记录，全屏模式点哪里都算，操作零门槛',
  },
  {
    icon: '🌙',
    title: '黑夜模式',
    desc: '深色低亮度界面，不刺眼不打扰，适合静心、修行场景',
  },
  {
    icon: '📊',
    title: '时段统计',
    desc: '一眼看出每天什么时段最活跃，周/月计数分布一目了然',
  },
  {
    icon: '📳',
    title: '震动反馈',
    desc: '每次计数触发轻触觉反馈，让坚持更有仪式感（可关闭）',
  },
]

const useCases = [
  '每天念佛 / 持咒 / 念经次数',
  '俯卧撑、深蹲、卷腹组数',
  '每天喝水杯数',
  '每天看书页数',
  '冥想次数 / 专注轮次',
  '戒烟 / 戒色提醒打卡',
  '每天行走步数分段记录',
  '每天工作专注次数',
]

export default function CounterIntro() {
  const {
    isInApp,
    callNative,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
    closePage,
  } = useNativeBridge()

  const [isAdding, setIsAdding] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)

  const pageTitle = '指尖计数器介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    checkIfAdded()
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      const result = await callNative('habit.getList', { type: 26 })
      if (result?.habits && result.habits.length > 0) {
        setHasAdded(true)
      }
    } catch (error) {
      console.error('[CounterIntro] 检查习惯失败:', error)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }

    if (hasAdded) {
      await showToast('已经添加了该习惯，不可重复添加')
      return
    }

    setIsAdding(true)

    try {
      await showLoading('添加中...')

      const customAttributeDefines = [
        {
          id: 'counter_step', key: 'counter_step', name: '步长', type: 1, scope: 1,
          position: 1, required: false,
          config: { defaultValue: 1, minValue: 1, maxValue: 100, decimalPlaces: 0, showInList: true, showInStats: false },
        },
        {
          id: 'counter_vibration_enabled', key: 'counter_vibration_enabled', name: '震动反馈', type: 5, scope: 1,
          position: 2, required: false,
          config: { defaultValue: true, trueLabel: '开启', falseLabel: '关闭' },
        },
        {
          id: 'counter_dark_mode', key: 'counter_dark_mode', name: '黑夜模式', type: 5, scope: 1,
          position: 3, required: false,
          config: { defaultValue: false, trueLabel: '开启', falseLabel: '关闭' },
        },
        {
          id: 'counter_step_log', key: 'counter_step', name: '本次步长', type: 1, scope: 2,
          position: 10, required: true,
          config: { defaultValue: 1, minValue: 1, maxValue: 100, decimalPlaces: 0, showInList: true, showInStats: true },
        },
      ]

      const displayConfig = {
        progressMode: 'counter',
        detailOpenMode: 'h5',
        h5Path: 'counter',
        h5StatsPath: 'counter/stats',
        monthlyCell: { coloringMode: 'presence' },
        weeklyDot: { mode: 'presence' },
        widgets: [
          {
            slotId: 1, visible: true, layout: 'split',
            displaySource: 'computed:today_total_count',
            unit: '次', emptyDisplay: '0',
          },
          {
            slotId: 2, visible: true, layout: 'split',
            displaySource: 'computed:today_step_setting',
            unit: '步长', emptyDisplay: '1',
          },
          { slotId: 3, visible: false },
          {
            slotId: 4, visible: true, layout: 'inline',
            textSource: 'computed:counter_status_text',
          },
        ],
      }

      const computations = [
        {
          id: 'today_total_count',
          computationType: 'today_log_attr_sum',
          inputs: { attributeKey: 'counter_step' },
        },
        {
          id: 'today_step_setting',
          computationType: 'attribute_value',
          inputs: { attributeKey: 'counter_step', scope: 'habit' },
        },
        {
          id: 'counter_status_text',
          computationType: 'counter_status_text',
        },
      ]

      const result = await callNative('habit.create', {
        type: 26,
        name: '指尖计数器',
        icon: 'emoji:👆',
        emojiIcon: '👆',
        bgColor: '#6C63FF',
        description: '极简计数习惯工具，每次点击记录坚持',
        presentationKind: PresentationKind.COUNTER,
        customAttributeDefines,
        displayConfig,
        computations,
      })

      await hideLoading()

      console.log('[CounterIntro] habit.create 返回结果:', result)

      const isSuccess = result && (
        result.success === true ||
        (result.habitId && result.habitId.length > 0)
      )

      if (isSuccess) {
        await showToast('添加成功，请在首页查看')
        setHasAdded(true)
        setTimeout(async () => {
          await closePage()
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        console.error('[CounterIntro] 添加失败:', errorMsg, result)
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
      console.error('[CounterIntro] 添加异常:', error)
      await showToast('添加失败: ' + (error.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleGoHome = () => {
    callNative('ui.showToast', { message: '已经添加，可以直接到首页进行操作' })
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👆</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">指尖计数器</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-indigo-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      <FloatingBackButton />

      {/* 头部 */}
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-100/50 to-transparent" />
        <div className="relative flex justify-center mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
              boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)',
            }}
          >
            <span className="text-5xl">👆</span>
          </div>
        </div>
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">指尖计数器</h1>
          <p className="text-gray-500 text-sm">无声 · 极简 · 不打扰的习惯打卡器</p>
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

      {/* 适用场景 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">✅</span>
            适合记录哪些习惯
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {useCases.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5 text-xs">•</span>
                <span className="text-xs text-gray-600 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
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
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>添加后在首页点击进入，选择「全屏模式」可点击任意位置计数</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>支持自定义每次加几（次/分钟/组数均可）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>黑夜模式下低亮不刺眼，适合静心冥想场景</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>每次计数均上报，可查看时段/周/月统计分布</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={hasAdded ? handleGoHome : handleAddHabit}
            disabled={isAdding}
            className="w-full py-4 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
              boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)',
            }}
          >
            {hasAdded ? '去首页使用 →' : isAdding ? '添加中...' : '添加到首页'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">添加后可在首页快速进入</p>
        </div>
      </div>

      <div className="h-28" />
    </div>
  )
}
