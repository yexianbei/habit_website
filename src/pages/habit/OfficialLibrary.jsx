/**
 * 官方习惯库（在线版）
 * 用于在 App 内 WebView 中展示官方习惯列表，方便之后通过 H5 动态配置。
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

const OFFICIAL_HABITS = [
  {
    id: 'period_management',
    name: '经期管理',
    desc: '记录与预测经期，关爱女性健康',
    icon: '🌸',
    bg: 'from-pink-500 to-rose-500',
    path: '/habit/period/intro',
    tag: '女性健康',
  },
  {
    id: 'quit_smoking',
    name: '戒烟',
    desc: '记录戒烟天数，追踪健康与节省金额',
    icon: '🚭',
    bg: 'from-emerald-400 to-lime-400',
    path: '/habit/quit/intro',
    tag: '健康管理',
  },
  {
    id: 'body_data',
    name: '身体数据',
    desc: '记录体重、体脂等关键身体指标',
    icon: '🧍',
    bg: 'from-sky-500 to-indigo-500',
    path: '/habit/body/intro',
    tag: '身体与健康',
  },
  {
    id: 'sleep_management',
    name: '睡眠管理',
    desc: '记录睡眠时长与质量，培养稳定作息',
    icon: '🛌',
    bg: 'from-indigo-500 to-blue-600',
    path: '/habit/sleep/intro',
    tag: '身体与健康',
  },
  {
    id: 'flashcard_memory',
    name: '闪卡记忆',
    desc: '用间隔重复法记单词、知识点',
    icon: '🃏',
    bg: 'from-orange-400 to-pink-500',
    path: '/habit/flashcard/intro',
    tag: '学习与效率',
  },
  {
    id: 'accounting',
    name: '记账',
    desc: '快速记账，掌握每日收支与分类统计',
    icon: '📒',
    bg: 'from-emerald-400 to-teal-500',
    path: '/habit/accounting/intro',
    tag: '理财与账本',
  },
]

export default function OfficialLibrary() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* 头部 */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-2xl text-white shadow-md">
            ⭐️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">官方习惯库</h1>
            <p className="text-xs text-gray-500">精选场景 · 一键添加到首页</p>
          </div>
        </div>
      </div>

      {/* 提示 */}
      <div className="px-6 pb-2">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm border border-slate-100">
          <span className="text-base">💡</span>
          <div className="text-xs text-gray-600 leading-relaxed">
            点击任意卡片可先查看功能介绍，然后在介绍页一键添加到首页习惯列表。
          </div>
        </div>
      </div>

      {/* 官方习惯列表 */}
      <div className="px-4 pb-6 grid grid-cols-2 gap-3">
        {OFFICIAL_HABITS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left active:scale-[0.97] transition-transform"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center text-xl text-white shadow-sm mb-3`}
            >
              {item.icon}
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
              <span className="ml-2 px-2 py-[2px] rounded-full bg-slate-100 text-[10px] text-slate-500">
                {item.tag}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.desc}</p>
            <div className="mt-3 text-[10px] text-indigo-500 font-medium group-active:opacity-70">
              查看介绍 →
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

