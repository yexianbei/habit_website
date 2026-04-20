/**
 * 戒烟管理介绍页面
 * 用户从习惯库点击后先看到此页面，点击按钮进入戒烟管理
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  
  const pageTitle = '戒烟管理介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
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
              <span>所有数据通过 token + 云端接口访问</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/habit/quit')}
            className="w-full py-4 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-xl font-medium shadow-lg active:scale-98 transition-transform disabled:opacity-70"
            style={{ boxShadow: '0 4px 20px rgba(0, 227, 0, 0.4)' }}
          >
            进入戒烟管理
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            请确保链接中携带 token 参数
          </p>
        </div>
      </div>
      
      {/* 底部占位 */}
      <div className="h-28" />
    </div>
  )
}
