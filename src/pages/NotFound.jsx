import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="text-5xl mb-3">🧭</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">页面未找到</h1>
        <p className="text-gray-500 text-sm mb-6">请确认链接是否正确，或通过以下入口访问。</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <Link to="/habit/sleep/intro" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white">睡眠管理介绍</Link>
          <Link to="/habit/body/intro" className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-white">身体数据介绍</Link>
          <Link to="/habit/ledger/intro" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white">记账介绍</Link>
          <Link to="/habit/library/official" className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700">返回习惯库</Link>
        </div>
      </div>
    </div>
  )
}

