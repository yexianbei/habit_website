/**
 * 经期管理介绍页面
 * 用户从习惯库点击后先看到此页面，点击添加后创建习惯
 */

import React, { useState, useEffect } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'

// 功能特点数据
const features = [
  {
    icon: '📅',
    title: '智能预测',
    desc: '根据您的历史记录，智能预测下次经期和排卵日'
  },
  {
    icon: '📊',
    title: '周期分析',
    desc: '详细的周期分析报告，了解您的身体规律'
  },
  {
    icon: '🔔',
    title: '贴心提醒',
    desc: '经期、排卵期提前提醒，做好准备'
  },
  {
    icon: '🔒',
    title: '隐私保护',
    desc: '所有数据本地存储，保护您的隐私安全'
  }
]

export default function PeriodIntro() {
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
  
  // 设置页面标题
  useEffect(() => {
    if (isInApp) {
      setTitle('经期管理')
    }
  }, [isInApp, setTitle])
  
  // 检查是否已添加此习惯
  useEffect(() => {
    checkIfAdded()
  }, [isInApp])
  
  const checkIfAdded = async () => {
    if (!isInApp) return
    
    try {
      const result = await callNative('habit.getList', { type: 16 })
      if (result?.habits && result.habits.length > 0) {
        setHasAdded(true)
      }
    } catch (error) {
      console.error('检查习惯失败:', error)
    }
  }
  
  // 添加经期管理习惯
  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    
    if (hasAdded) {
      // 已添加，直接进入管理页面
      await callNative('ui.navigateTo', { url: 'https://tinyhabits.top/habit/period' })
      return
    }
    
    setIsAdding(true)
    
    try {
      await showLoading('添加中...')
      
      // 创建经期管理习惯
      const result = await callNative('habit.create', {
        type: 16,  // 经期管理类型
        name: '经期管理',
        icon: 'period_icon',
        bgColor: '#FF6B8A',
        description: '记录和预测经期，关爱女性健康'
      })
      
      await hideLoading()
      
      if (result?.success) {
        await showToast('添加成功')
        setHasAdded(true)
        
        // 延迟后关闭页面，让用户从首页进入
        setTimeout(() => {
          closePage()
        }, 1000)
      } else {
        await showToast(result?.message || '添加失败')
      }
    } catch (error) {
      await hideLoading()
      await showToast('添加失败: ' + error.message)
    } finally {
      setIsAdding(false)
    }
  }
  
  // 进入经期管理页面
  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await callNative('ui.navigateTo', { url: 'https://tinyhabits.top/habit/period' })
  }
  
  // 非 App 环境的提示
  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">经期管理</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a 
            href="https://apps.apple.com/app/id1455083310" 
            className="inline-block px-6 py-2 bg-pink-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* 头部装饰 */}
      <div className="relative pt-8 pb-12 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-pink-100/50 to-transparent" />
        
        {/* 图标 */}
        <div className="relative flex justify-center mb-6">
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)',
              boxShadow: '0 8px 32px rgba(255, 107, 138, 0.3)'
            }}
          >
            <span className="text-5xl">🌸</span>
          </div>
        </div>
        
        {/* 标题 */}
        <div className="relative text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">经期管理</h1>
          <p className="text-gray-500 text-sm">记录·预测·关爱</p>
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
              <span className="text-pink-500 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入经期管理</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>记录至少 2 次经期后，系统将自动预测</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>支持设置周期长度和经期长度</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>所有数据仅存储在本地，保护隐私</span>
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
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(255, 107, 138, 0.4)' }}
            >
              进入经期管理
            </button>
          ) : (
            <button
              onClick={handleAddHabit}
              disabled={isAdding}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
              style={{ boxShadow: '0 4px 20px rgba(255, 107, 138, 0.4)' }}
            >
              {isAdding ? '添加中...' : '添加到首页'}
            </button>
          )}
          
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
