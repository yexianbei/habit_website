import React, { useState, useEffect } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'

const features = [
  {
    icon: '💰',
    title: '基础零花钱',
    desc: '设定每周/每月的固定基础零花钱，从小树立预算意识。',
  },
  {
    icon: '✅',
    title: '行为打卡关联',
    desc: '按时早睡、自动写作业等好习惯可直接获得零花钱奖励或加息资格。',
  },
  {
    icon: '📦',
    title: '定期存款收息',
    desc: '活期随时取，定期赚利息，培养孩子的延迟满足和储蓄习惯。',
  },
  {
    icon: '💸',
    title: '消费记录追溯',
    desc: '每一笔花销清晰记录，帮助孩子了解钱花在了哪里，健康理财。',
  },
]

export default function KidFinanceIntro() {
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

  const pageTitle = '培养孩子财商'
  
  useEffect(() => {
    document.title = pageTitle
  }, [])

  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    const checkIfAdded = async () => {
      if (!isInApp) return
      try {
        const result = await callNative('habit.getList', { type: 3000 })
        if (result?.habits && Array.isArray(result.habits) && result.habits.length > 0) {
          setHasAdded(true)
        } else {
          setHasAdded(false)
        }
      } catch (_) {
        setHasAdded(false)
      }
    }
    checkIfAdded()
  }, [isInApp, callNative])

  const handleAddHabit = async () => {
    if (!isInApp) {
      await showToast('请在 App 内添加到首页后使用')
      return
    }

    if (hasAdded) {
      await showToast('已经添加了该习惯，不可重复添加')
      return
    }

    setIsAdding(true)

    try {
      await showLoading('生成金库中...')

      // 模拟调用原生进行配置下发
      const result = await callNative('habit.create', {
        type: 3000,
        name: '财商小管家',
        icon: 'emoji:💰',
        emojiIcon: '💰',
        bgColor: '#FF88D8',
        description: '培养从小记账与储蓄的好习惯',
        presentationKind: 'kid_finance',
        habitSubType: 'kid_finance',
        conditionValue: {
          displayConfig: {
             h5Path: 'kid-finance',
          }
        }
      })

      await hideLoading()

      // 为了容错，即使原生尚未完全配置好此类型也会给予成功回馈
      const isSuccess = !!(result && (result.success === true || (result.habitId && result.habitId.length > 0)))

      if (isSuccess) {
        await showToast('添加成功，请在首页查看')
        setHasAdded(true)
        setTimeout(() => closePage(), 1200)
      } else {
        await showToast('添加失败，请重试')
      }
    } catch (error) {
      await hideLoading()
      console.error('[KidFinanceIntro] 添加异常:', error)
      await showToast('添加失败，请稍后重试')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf6fd] pb-20">
      <FloatingBackButton />

      {/* 头部特效区域 */}
      <div className="relative pt-12 pb-10 px-6 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[120%] h-56 bg-gradient-to-br from-[#f0e5ff] to-[#ff88d8] opacity-30 rounded-b-[100px]" />
        
        <div className="relative flex justify-center mb-6 z-10">
          <div
            className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #9476ff 0%, #ff88d8 100%)',
              boxShadow: '0 8px 32px rgba(148, 118, 255, 0.4)',
            }}
          >
            <span className="text-5xl">💰</span>
          </div>
        </div>
        <div className="relative text-center z-10">
          <h1 className="text-[22px] font-bold text-[#554a77] mb-2 tracking-wide">启蒙宝贝理财记账本</h1>
          <p className="text-[#9476ff]/80 text-sm font-medium">储蓄 · 记账 · 任务奖励</p>
        </div>
      </div>

      {/* 功能特点展示区 */}
      <div className="px-6 pb-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#fdf6fd]">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-[#554a77] text-[15px] mb-1.5">{feature.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 我们为什么要做这个 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#fdf6fd]">
          <h3 className="font-bold text-[#554a77] mb-3 flex items-center gap-2">
            <span className="text-xl">✨</span>
            给家长的寄语
          </h3>
          <p className="text-[#7d7a8d] text-[14px] leading-relaxed mb-4">
            「财商」是孩子们必备的人生技能之一。单纯地说教不如让孩子亲自掌管一笔小钱：
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-[#ff88d8] font-bold mt-[-1px]">·</span>
              <span className="text-[#7d7a8d] text-[13px] leading-snug">完成好习惯任务，体会努力赚钱的价值</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#9476ff] font-bold mt-[-1px]">·</span>
              <span className="text-[#7d7a8d] text-[13px] leading-snug">存入定期获取利息，感受时间与复利的魔力</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部悬浮按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[rgba(253,246,253,1)] to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAddHabit}
            disabled={isAdding}
            className="w-full py-[18px] text-white rounded-[20px] font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 text-[16px]"
            style={{
              background: 'linear-gradient(135deg, #9476ff 0%, #ff88d8 100%)',
              boxShadow: '0 8px 24px rgba(255, 136, 216, 0.4)',
            }}
          >
            {hasAdded ? '去我的金库 →' : isAdding ? '开启中...' : '开启小金库之旅'}
          </button>
        </div>
      </div>
      
    </div>
  )
}
