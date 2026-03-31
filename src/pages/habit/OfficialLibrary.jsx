/**
 * 官方习惯库（在线版）- 电商风改版
 * 像应用商店一样陈列精选习惯，支持搜索、横向热门滚动与分类。
 */
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { HABIT_TYPE_H5 } from '../../constants/platformHabit'
import { hasPeriodHabit, hasFingerCounterHabit } from '../../utils/platformHabitExists'

// === 数据配置 ===

// 自定义简易检测器（优先用本地存储判断测试环境是否开通）
const hasKidFinanceHabit = async () => {
  try {
    return localStorage.getItem('kid_finance_data_v1') !== null
  } catch {
    return false
  }
}

const OFFICIAL_HABITS = [
  {
    id: 'kid_finance',
    type: HABIT_TYPE_H5,
    name: '财商小管家',
    desc: '启蒙阶段专属：完成打卡攒零花，存入定期赚利息，培养孩子记账与延迟满足的好习惯。',
    icon: '💰',
    bg: 'from-[#aa89ff] to-[#ff6ec7]',
    introPath: '/habit/kid-finance/intro',
    usePath: '/habit/kid-finance',
    tag: '亲子与教育',
    hot: true,
  },
  {
    id: 'period_management',
    type: HABIT_TYPE_H5,
    name: '经期管理',
    desc: '记录与预测经期，关爱女性健康。',
    icon: '🌸',
    bg: 'from-pink-500 to-rose-500',
    introPath: '/habit/period/intro',
    usePath: '/habit/period',
    tag: '女性健康',
    hot: true,
  },
  {
    id: 'finger_counter',
    type: HABIT_TYPE_H5,
    name: '指尖计数器',
    desc: '极简计数，全屏黑夜模式，记录每日坚持次数，支持震动反馈。',
    icon: '👆',
    bg: 'from-indigo-500 to-violet-500',
    introPath: '/habit/counter/intro',
    usePath: '/habit/counter',
    statsPath: '/habit/counter/stats',
    tag: '专注打卡',
    hot: true,
  },
  {
    id: 'quit_smoking',
    type: 17,
    name: '戒烟日志',
    desc: '记录戒烟天数，追踪健康状态与省钱金额。',
    icon: '🚭',
    bg: 'from-emerald-400 to-lime-400',
    introPath: '/habit/quit/intro',
    usePath: '/habit/quit',
    tag: '健康管理',
  },
  {
    id: 'body_data',
    type: 19,
    name: '身体数据',
    desc: '记录体重、体脂等关键身体指标，自动生成图表曲线。',
    icon: '🧍',
    bg: 'from-sky-500 to-indigo-500',
    introPath: '/habit/body/intro',
    usePath: '/habit/body',
    tag: '身体与健康',
  },
  {
    id: 'strength_training',
    type: 25,
    name: '力量训练',
    desc: '像专业工具一样记录每一次力量训练、计划与训练量统计。',
    icon: '🏋️',
    bg: 'from-violet-500 to-fuchsia-500',
    introPath: '/habit/training/intro',
    usePath: '/habit/training',
    tag: '运动与健康',
    hot: true,
  },
  {
    id: 'sleep_management',
    type: 20,
    name: '睡眠管理',
    desc: '记录睡眠时长与质量，培养稳定健康的作息节律。',
    icon: '🛌',
    bg: 'from-indigo-500 to-blue-600',
    introPath: '/habit/sleep/intro',
    usePath: '/habit/sleep',
    tag: '身体与健康',
  },
  {
    id: 'flashcard_memory',
    type: 21,
    name: '闪卡记忆',
    desc: '用科学的间隔重复法背单词、记考点知识，考试不慌张。',
    icon: '🃏',
    bg: 'from-orange-400 to-pink-500',
    introPath: '/habit/flashcard/intro',
    usePath: '/habit/flashcard',
    tag: '学习与效率',
  },
  {
    id: 'accounting',
    type: 22,
    name: '极简记账',
    desc: '快速记录支出收入，掌握每一笔资金流向，月度图表分析。',
    icon: '📒',
    bg: 'from-emerald-400 to-teal-500',
    introPath: '/habit/accounting/intro',
    usePath: '/habit/accounting',
    tag: '理财与账本',
  },
  {
    id: 'blood_sugar',
    type: 24,
    name: '血糖记录',
    desc: '精准记录各时段血糖，追踪变化波动，护航家人健康。',
    icon: '🩸',
    bg: 'from-red-500 to-pink-500',
    introPath: '/habit/glucose/intro',
    usePath: '/habit/glucose',
    tag: '健康管理',
  },
]

// 开放的功能清单白名单
const ENABLED_HABIT_IDS = new Set([
  'kid_finance',
  'period_management', 
  'finger_counter'
])


const HABIT_EXISTENCE_CHECKERS = {
  period_management: hasPeriodHabit,
  finger_counter: hasFingerCounterHabit,
  kid_finance: hasKidFinanceHabit,
}

// 供 H5 的安全拉起轮询方案
function waitForNativeCallNative(maxMs = 8000) {
  return new Promise((resolve) => {
    const ok = () =>
      typeof window !== 'undefined' &&
      window.__nativeBridgeReady &&
      typeof window.callNative === 'function'
    if (ok()) return resolve(true)
    const start = Date.now()
    const id = setInterval(() => {
      if (ok()) {
        clearInterval(id)
        resolve(true)
      } else if (Date.now() - start >= maxMs) {
        clearInterval(id)
        resolve(false)
      }
    }, 40)
  })
}

// === 主组件 ===

export default function OfficialLibrary() {
  const navigate = useNavigate()
  const { callNative, isInApp, setTitle } = useNativeBridge()
  const [existMap, setExistMap] = useState({})
  
  // 过滤出最终可见的
  const visibleHabits = useMemo(() => OFFICIAL_HABITS.filter(h => ENABLED_HABIT_IDS.has(h.id)), [])
  
  // 提取唯一分类
  const categories = useMemo(() => {
    const tags = new Set(visibleHabits.map(h => h.tag))
    return ['全部', ...Array.from(tags)]
  }, [visibleHabits])

  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')

  useEffect(() => {
    document.title = '官方习惯库'
    if (isInApp) setTitle('官方习惯库')
  }, [isInApp, setTitle])

  // Native 连接与状态拉取
  useEffect(() => {
    let cancelled = false
    const checkAll = async () => {
      try {
        const nativeOk = await waitForNativeCallNative(8000)
        if (cancelled || (!nativeOk && isInApp)) return

        if (!cancelled) {
          const map = {}
          for (const item of visibleHabits) {
            const checker = HABIT_EXISTENCE_CHECKERS[item.id]
            try {
              map[item.id] = checker ? await checker(callNative) : false
            } catch {
              map[item.id] = false
            }
          }
          setExistMap(map)
        }
      } catch (e) {
        console.error('[OfficialLibrary] 状态拉取失败:', e)
      }
    }
    checkAll()
    return () => { cancelled = true }
  }, [callNative, visibleHabits, isInApp])

  // 数据衍生
  const hotHabits = useMemo(() => visibleHabits.filter(h => h.hot), [visibleHabits])
  const heroHabit = visibleHabits.find(h => h.id === 'kid_finance') || visibleHabits[0] // 指定主推Banner
  
  const filteredHabits = useMemo(() => {
    let list = visibleHabits
    if (activeCategory !== '全部') list = list.filter(h => h.tag === activeCategory)
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q))
    }
    return list
  }, [visibleHabits, activeCategory, searchText])


  // 小卡片渲染函数
  const renderCard = (item, type = 'grid') => {
    const hasAdded = !!existMap[item.id]
    const ctaText = hasAdded ? '已添加，进入' : '去开启'
    
    if (type === 'row') {
      // 热门区块样式
      return (
        <button
          key={item.id}
          onClick={() => navigate(hasAdded ? item.usePath : item.introPath)}
          className="flex-shrink-0 w-44 bg-white rounded-3xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col active:scale-95 transition-transform text-left"
        >
          <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${item.bg} flex items-center justify-center text-2xl text-white shadow-sm mb-3`}>
            {item.icon}
          </div>
          <h3 className="text-[15px] font-bold text-gray-800 truncate mb-1">{item.name}</h3>
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug mb-3 flex-1">{item.desc}</p>
          <div className="w-full flex items-center justify-between">
             <span className="px-2 py-[2px] rounded-md bg-gray-50 text-[10px] text-gray-500 font-medium">
                {item.tag}
             </span>
             <div className={`text-[11px] font-bold ${hasAdded ? 'text-gray-400' : 'text-indigo-500'}`}>
                {ctaText}
             </div>
          </div>
        </button>
      )
    }

    // 瀑布流（List/Grid）网格样式
    return (
      <div key={item.id} className="bg-white rounded-[24px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden flex flex-col group">
        <button
          onClick={() => navigate(hasAdded ? item.usePath : item.introPath)}
          className="p-4 text-left w-full flex-1 flex flex-col active:opacity-60 transition-opacity"
        >
          <div className="flex justify-between items-start mb-3">
             <div className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${item.bg} flex items-center justify-center text-[22px] text-white`}>
                {item.icon}
             </div>
             <span className="px-2 py-[2px] rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-gray-500 inline-block font-medium">
                {item.tag}
             </span>
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.desc}</p>
          
          <div className="mt-auto flex items-center gap-1.5 text-[12px] font-bold text-indigo-500 bg-indigo-50/50 w-full justify-center py-2 rounded-xl">
            {hasAdded ? <span className="text-gray-600">从首页进入</span> : <span>立即配置 →</span>}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-10">
      
      {/* (1) 搜索框区：吸顶 + 毛玻璃 */}
      <div className="sticky top-0 z-50 w-full px-5 py-3 backdrop-blur-md bg-white/80 border-b border-gray-100/50 mb-4 transition-all shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input 
            className="w-full bg-[#f1f3f6] text-gray-800 text-sm rounded-full pl-10 pr-4 py-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow"
            placeholder="搜索习惯名字或关键词，如'财商'"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* 以下是如果没有搜索关键词，则显示重磅推荐和热门区，有搜索则不显示 */}
      {!searchText.trim() && (
        <>
          {/* (2) 主推大 Banner 专区 */}
          {heroHabit && (
            <div className="px-5 mb-8">
              <div 
                className="relative w-full rounded-[28px] overflow-hidden p-[22px] text-white shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #1b1642 0%, #302b63 100%)' }}
                onClick={() => navigate(existMap[heroHabit.id] ? heroHabit.usePath : heroHabit.introPath)}
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex">
                  <div className="flex-1 pr-2">
                    <span className="inline-block px-2.5 py-[3px] rounded bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-wide mb-2">Editor's Pick</span>
                    <h2 className="text-[22px] font-bold leading-tight mb-2 flex items-center gap-1.5">
                      {heroHabit.name} <span className="text-[20px]">{heroHabit.icon}</span>
                    </h2>
                    <p className="text-[12px] opacity-80 leading-relaxed font-light line-clamp-2 pr-4">{heroHabit.desc}</p>
                    <div className="mt-4 bg-white text-[#302b63] w-max px-4 py-[7px] rounded-full text-[12px] font-bold shadow-sm">
                      {existMap[heroHabit.id] ? '进入小金库' : '开启初体验 →'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* (3) 热门横向滚动列表 (Hot Habits) */}
          {hotHabits.length > 0 && (
            <div className="mb-8 pl-5 overflow-hidden">
              <div className="flex justify-between items-center pr-5 mb-4">
                <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-1.5">
                  🔥 本周热门
                </h2>
              </div>
              {/* x 轴滚动区域 */}
              <div className="flex gap-4 overflow-x-auto pb-4 pr-5 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                {hotHabits.map(h => (
                  <div key={h.id} className="snap-start">
                     {renderCard(h, 'row')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* (4) 分类导航 (Category Tabs) */}
      <div className="px-5 mb-4 sticky top-[60px] z-40 bg-[#F8F9FB]/90 backdrop-blur-sm pt-2 pb-2">
         {/* 横向滚动标签 */}
         <div className="flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all shadow-sm ${
                  activeCategory === cat 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      {/* (5) 习惯大卖场 / 搜索结果 */}
      <div className="px-5">
        <h2 className="text-[17px] font-bold text-gray-900 mb-4 pl-1">
          {searchText ? '搜索结果' : '探索全部'}
          <span className="text-sm font-normal text-gray-400 ml-2">[{filteredHabits.length}]</span>
        </h2>

        {filteredHabits.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">没有找到相关习惯，换个词试试</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredHabits.map(h => renderCard(h, 'grid'))}
          </div>
        )}
      </div>

    </div>
  )
}
