/**
 * 官方习惯库（在线版）
 * 用于在 App 内 WebView 中展示官方习惯列表，方便之后通过 H5 动态配置。
 * 在 App 内，会根据本地是否已有对应类型的习惯，决定显示「查看介绍」还是「去使用」。
 */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { HABIT_TYPE_H5 } from '../../constants/platformHabit'
import { hasPeriodHabit, hasFingerCounterHabit } from '../../utils/platformHabitExists'

const OFFICIAL_HABITS = [
  {
    id: 'period_management',
    type: HABIT_TYPE_H5,
    name: '经期管理',
    desc: '记录与预测经期，关爱女性健康',
    icon: '🌸',
    bg: 'from-pink-500 to-rose-500',
    introPath: '/habit/period/intro',
    usePath: '/habit/period',
    tag: '女性健康',
  },
  {
    id: 'finger_counter',
    type: HABIT_TYPE_H5,
    name: '指尖计数器',
    desc: '极简计数，全屏黑夜模式，记录每日坚持次数',
    icon: '👆',
    bg: 'from-indigo-500 to-violet-500',
    introPath: '/habit/counter/intro',
    usePath: '/habit/counter',
    /** 已添加时习惯库卡片展示的快捷入口（与 displayConfig.h5StatsPath 一致） */
    statsPath: '/habit/counter/stats',
    tag: '专注打卡',
  },
  {
    id: 'quit_smoking',
    type: 17,
    name: '戒烟',
    desc: '记录戒烟天数，追踪健康与节省金额',
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
    desc: '记录体重、体脂等关键身体指标',
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
    desc: '像训记一样记录每一次力量训练、计划与训练量统计',
    icon: '🏋️',
    bg: 'from-violet-500 to-fuchsia-500',
    introPath: '/habit/training/intro',
    usePath: '/habit/training',
    tag: '运动与健康',
  },
  {
    id: 'sleep_management',
    type: 20,
    name: '睡眠管理',
    desc: '记录睡眠时长与质量，培养稳定作息',
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
    desc: '用间隔重复法记单词、知识点',
    icon: '🃏',
    bg: 'from-orange-400 to-pink-500',
    introPath: '/habit/flashcard/intro',
    usePath: '/habit/flashcard',
    tag: '学习与效率',
  },
  {
    id: 'accounting',
    type: 22,
    name: '记账',
    desc: '快速记账，掌握每日收支与分类统计',
    icon: '📒',
    bg: 'from-emerald-400 to-teal-500',
    introPath: '/habit/accounting/intro',
    usePath: '/habit/accounting',
    tag: '理财与账本',
  },
  {
    id: 'baby_growth',
    type: 23,
    name: '宝宝成长',
    desc: '记录喂奶、睡眠、体温、疫苗、身高与体重等成长数据',
    icon: '👶',
    bg: 'from-orange-400 to-pink-500',
    introPath: '/habit/baby/intro',
    usePath: '/habit/baby',
    tag: '家庭与亲子',
  },
  {
    id: 'blood_sugar',
    type: 24,
    name: '血糖记录',
    desc: '记录血糖值，追踪血糖变化趋势，管理健康',
    icon: '🩸',
    bg: 'from-red-500 to-pink-500',
    introPath: '/habit/glucose/intro',
    usePath: '/habit/glucose',
    tag: '健康管理',
  },
]

/** 当前开放添加的习惯 id 集合，其余点击后提示「会尽快开放～请稍等」 */
const ENABLED_HABIT_IDS = new Set(['period_management', 'finger_counter'])

/** 官方习惯 id → 是否已添加（与 docs/platform 一致，不限于单一 HabitType） */
const HABIT_EXISTENCE_CHECKERS = {
  period_management: hasPeriodHabit,
  finger_counter: hasFingerCounterHabit,
}

/** Flutter WebView 在 onPageFinished 才注入 callNative，首屏 useEffect 可能早于注入，需短暂等待 */
function waitForNativeCallNative(maxMs = 8000) {
  return new Promise((resolve) => {
    const ok = () =>
      typeof window !== 'undefined' &&
      window.__nativeBridgeReady &&
      typeof window.callNative === 'function'
    if (ok()) {
      resolve(true)
      return
    }
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

export default function OfficialLibrary() {
  const navigate = useNavigate()
  const { callNative, isInApp, setTitle } = useNativeBridge()
  const [existMap, setExistMap] = useState({})

  useEffect(() => {
    document.title = '官方习惯库'
    if (isInApp) setTitle('官方习惯库')
  }, [isInApp, setTitle])

  // 根据本地 habit.getList 刷新「已添加」状态（Flutter WebView 首帧常尚无 callNative，不能依赖首次 isInApp）
  useEffect(() => {
    let cancelled = false

    const checkAll = async () => {
      try {
        const nativeOk = await waitForNativeCallNative(8000)
        if (cancelled || !nativeOk) return

        if (!cancelled) {
          const map = {}
          for (const item of OFFICIAL_HABITS) {
            if (!ENABLED_HABIT_IDS.has(item.id)) continue
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
        console.error('[OfficialLibrary] 检查官方习惯是否已添加失败:', e)
      }
    }

    checkAll()

    return () => {
      cancelled = true
    }
  }, [callNative])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* 官方习惯列表 */}
      <div className="px-4 pt-6 pb-6 grid grid-cols-2 gap-3">
        {OFFICIAL_HABITS.filter(item => ENABLED_HABIT_IDS.has(item.id)).map((item) => {
          const hasAdded = !!existMap[item.id]
          const ctaText = hasAdded ? '点击进入' : '查看介绍 →'

          return (
            <div
              key={item.id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col active:scale-[0.98] transition-transform"
            >
              <button
                type="button"
                onClick={() => {
                  if (hasAdded) navigate(item.usePath)
                  else navigate(item.introPath)
                }}
                className="p-4 text-left w-full"
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
                  {ctaText}
                </div>
              </button>
              {hasAdded && (
                <div className="flex items-center gap-2 px-4 pb-3 pt-0 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => navigate(item.introPath)}
                    className="text-[10px] text-slate-500 font-medium py-1"
                  >
                    介绍
                  </button>
                  {item.statsPath ? (
                    <button
                      type="button"
                      onClick={() => navigate(item.statsPath)}
                      className="text-[10px] text-indigo-600 font-medium py-1"
                    >
                      高级统计
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

