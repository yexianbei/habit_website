/**
 * 戒烟管理介绍页面
 * 用户从习惯库点击后先看到此页面，点击开始使用后进入戒烟功能
 */

import React, { useState, useEffect } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'

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
    setTitle,
    navigateTo,
  } = useNativeBridge()
  
  // 设置页面标题
  const pageTitle = '戒烟管理介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp && setTitle) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])
  
  // 开始使用戒烟功能
  const handleStart = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    // 直接进入戒烟管理页面，如果未设置会自动跳转到引导页
    await navigateTo('https://tinyhabits.top/habit/quit')
  }
  
  // 非 App 环境的提示
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
              <span>所有数据仅存储在本地，保护隐私</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform"
            style={{ boxShadow: '0 4px 20px rgba(0, 227, 0, 0.4)' }}
          >
            开始使用
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            点击开始，设置戒烟日期即可使用
          </p>
        </div>
      </div>
      
      {/* 底部占位 */}
      <div className="h-28" />
    </div>
  )
}
