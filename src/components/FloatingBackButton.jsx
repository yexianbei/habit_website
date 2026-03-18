/**
 * 悬浮返回按钮组件
 * 用于习惯介绍页面返回到官方习惯库
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function FloatingBackButton() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/habit/library/official')
  }

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center text-gray-600 hover:bg-white active:scale-95 transition-all"
      style={{ 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
      }}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
  )
}