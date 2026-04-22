/**
 * 戒烟管理介绍页面
 * 用户从习惯库点击后先看到此页面，点击添加后通过 jsbridge 创建习惯
 */

import React, { useState, useEffect } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'

// 功能特点数据
const features = [
  {
    icon: '📊',
    title: '追踪成就',
    desc: '记录戒烟天数，查看节省金额和健康改善'
  },
  {
    icon: '💪',
    title: '激励支持',
    desc: '每日激励语和里程碑提醒，助你坚持'
  },
  {
    icon: '💰',
    title: '节省统计',
    desc: '实时计算节省的金钱，直观看到收益'
  },
  {
    icon: '❤️',
    title: '健康数据',
    desc: '追踪健康改善，心率、血氧等指标'
  }
]

export default function QuitIntro() {
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
  
  const pageTitle = '戒烟管理介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp && setTitle) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  useEffect(() => {
    const checkIfAdded = async () => {
      if (!isInApp) return
      try {
        const result = await callNative('habit.getList', { type: 17 })
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
      const result = await callNative('habit.create', {
        type: 17,
        name: '戒烟',
        icon: 'emoji:🚭',
        emojiIcon: '🚭',
        bgColor: '#00E300',
        description: '记录戒烟天数，追踪健康改善和节省金额',
      })
      await hideLoading()
      const success = result && (result.success === true || (result.habitId && result.habitId.length > 0))
      if (!success) {
        await showToast(result?.message || '添加失败，请重试')
        return
      }
      setHasAdded(true)
      await showToast('添加成功，请在首页查看')
      setTimeout(() => closePage(), 1200)
    } catch (e) {
      await hideLoading()
      await showToast('添加失败: ' + (e?.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
            <span className="text-5xl">🚭</span>
          </div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">戒烟管理</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* 悬浮返回按钮 */}
      <FloatingBackButton />
      
      {/* 头部装饰 */}
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-quit-green/20 to-transparent" />
        
        {/* 图标 */}
        <div className="relative flex justify-center mb-6">
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #00e300 0%, #00e500 100%)',
              boxShadow: '0 8px 32px rgba(0, 227, 0, 0.3)'
            }}
          >
            <span className="text-5xl">🚭</span>
          </div>
        </div>
        
        {/* 标题 */}
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">戒烟管理</h1>
          <p className="text-gray-500 text-sm">记录·追踪·坚持</p>
        </div>
      </div>
      
      {/* 功能特点 */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
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
              <span className="text-quit-green-dark mt-0.5">•</span>
              <span>首次使用需要设置戒烟日期和每日花费</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-quit-green-dark mt-0.5">•</span>
              <span>系统自动计算戒烟天数、节省金额和健康改善</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-quit-green-dark mt-0.5">•</span>
              <span>每日查看激励内容，获得坚持动力</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-quit-green-dark mt-0.5">•</span>
              <span>添加习惯走 App 本地，详细数据走云端接口（D1）</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={hasAdded ? () => showToast('已经添加，可以直接到首页使用') : handleAddHabit}
            disabled={isAdding}
            className="w-full py-4 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
            style={{ boxShadow: '0 4px 20px rgba(0, 227, 0, 0.4)' }}
          >
            {hasAdded ? '去首页使用 →' : (isAdding ? '添加中...' : '添加到首页')}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            添加后可在首页快速进入
          </p>
        </div>
      </div>
      
      {/* 底部占位 */}
      <div className="h-28" />
    </div>
  )
}
