/**
 * 渐进式戒烟统计页面
 * 显示周/月统计、多维度数据卡片
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatDate,
  calculateTimeSinceLastSmoke,
  formatTimeSince,
  calculateTarAmount,
  calculateTodayCost,
  getWeekRange,
  getMonthRange,
  calculateWeekStats,
  calculateMonthStats,
} from '../../utils/gradualQuitUtils'
import {
  getGradualDailyCountApi,
  getGradualLastSmokeApi,
  getGradualPlanApi,
  getGradualRecordsApi,
  getQuitProfileApi,
  hasWorkerAuthToken,
  saveGradualDailyCountApi,
} from '../../utils/quitApi'

function notify(message) {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message)
  }
}

export default function GradualQuitStats() {
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [todayCount, setTodayCount] = useState(0)
  const [lastSmokeTime, setLastSmokeTime] = useState(null)
  const [timeSinceLastSmoke, setTimeSinceLastSmoke] = useState(null)
  const [records, setRecords] = useState([])
  const [weekStats, setWeekStats] = useState(null)
  const [monthStats, setMonthStats] = useState(null)
  const [pricePerCigarette, setPricePerCigarette] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordCount, setRecordCount] = useState('')

  const pageTitle = '渐进式戒烟统计'

  useEffect(() => {
    document.title = pageTitle
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  // 实时更新距离上次吸烟的时间
  useEffect(() => {
    if (!lastSmokeTime) {
      setTimeSinceLastSmoke(null)
      return
    }

    const updateTime = () => {
      const time = calculateTimeSinceLastSmoke(lastSmokeTime)
      setTimeSinceLastSmoke(time)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [lastSmokeTime])

  const loadData = async () => {
    try {
      setLoading(true)

      const today = formatDate(new Date())
      const hasToken = await hasWorkerAuthToken().catch(() => false)
      if (!hasToken) throw new Error('缺少 token，请在打开 H5 时携带 token 参数')

      // 并行加载数据
      const [planData, todayCountData, lastSmokeData, settingsData] = await Promise.all([
        getGradualPlanApi().catch(() => null),
        getGradualDailyCountApi(today).catch(() => 0),
        getGradualLastSmokeApi().catch(() => null),
        getQuitProfileApi().catch(() => null),
      ])

      setPlan(planData)
      setTodayCount(todayCountData || 0)
      setLastSmokeTime(lastSmokeData)

      if (settingsData?.pricePerCigarette) {
        setPricePerCigarette(settingsData.pricePerCigarette)
      }

      // 加载记录数据
      const weekRange = getWeekRange()
      const monthRange = getMonthRange()
      const startDate = new Date(monthRange.start)
      startDate.setMonth(startDate.getMonth() - 1) // 加载近2个月的数据

      const recordsResult = await getGradualRecordsApi(
        formatDate(startDate),
        formatDate(new Date()),
      ).catch(() => [])
      const recordsData = Array.isArray(recordsResult) ? recordsResult : (recordsResult || [])

      setRecords(Array.isArray(recordsData) ? recordsData : [])

      // 计算统计
      const week = calculateWeekStats(recordsData || [], weekRange)
      const month = calculateMonthStats(recordsData || [], monthRange)
      setWeekStats(week)
      setMonthStats(month)
    } catch (error) {
      console.error('加载数据失败:', error)
      notify('加载数据失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTodayCount = async () => {
    const count = Number(recordCount)
    if (isNaN(count) || count < 0) {
      notify('请输入有效的根数')
      return
    }

    try {
      const today = formatDate(new Date())
      await saveGradualDailyCountApi({
        date: today,
        count,
        datetime: new Date().toISOString(),
      })
      notify('记录保存成功')
      setShowRecordModal(false)
      setRecordCount('')
      await loadData()
    } catch (error) {
      console.error('保存记录失败:', error)
      notify('保存失败: ' + (error.message || '未知错误'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-quit-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-5xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">尚未配置计划</h2>
          <p className="text-gray-500 mb-6">请先配置渐进式戒烟计划</p>
          <button
            onClick={() => navigate('/habit/quit/gradual/config')}
            className="px-6 py-3 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
          >
            去配置
          </button>
        </div>
      </div>
    )
  }

  // 获取今日目标根数
  const getTodayTarget = (planData) => {
    if (!planData || !planData.startDate) return 0

    const today = new Date()
    const start = new Date(planData.startDate)
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const currentWeek = Math.floor(diffDays / 7) + 1

    if (currentWeek > planData.weeks) {
      return planData.targetCount
    }

    const totalReduction = planData.initialCount - planData.targetCount
    const reductionPerWeek = totalReduction / planData.weeks
    const target = Math.max(
      planData.targetCount,
      Math.round(planData.initialCount - reductionPerWeek * currentWeek)
    )

    return target
  }

  const todayCost = calculateTodayCost(todayCount, pricePerCigarette)
  const todayTar = calculateTarAmount(todayCount)
  const targetToday = plan ? getTodayTarget(plan) : 0
  const remaining = Math.max(0, targetToday - todayCount)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <div className="px-4 py-6 max-w-2xl mx-auto pb-24">
        {/* 头部操作 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">渐进式戒烟统计</h1>
          <button
            onClick={() => navigate('/habit/quit/gradual/config')}
            className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 active:scale-95 transition-transform"
          >
            配置
          </button>
        </div>

        {/* 今日记录卡片 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">今日记录</h2>
            <button
              onClick={() => {
                setRecordCount(String(todayCount))
                setShowRecordModal(true)
              }}
              className="px-4 py-2 bg-quit-green text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              记录
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon="🚬"
              title="今日根数"
              value={`${todayCount} 根`}
              subtitle={`目标: ${targetToday} 根`}
              color="from-orange-500 to-red-500"
            />
            <StatCard
              icon="💰"
              title="今日花费"
              value={`¥${todayCost.toFixed(2)}`}
              subtitle={`每根 ¥${pricePerCigarette.toFixed(2)}`}
              color="from-amber-500 to-orange-500"
            />
            <StatCard
              icon="💨"
              title="今日焦油"
              value={`${todayTar} mg`}
              subtitle="约等于"
              color="from-gray-500 to-gray-600"
            />
            <StatCard
              icon="📉"
              title="剩余额度"
              value={`${remaining} 根`}
              subtitle={remaining > 0 ? '还可以抽' : '已用完'}
              color={remaining > 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}
            />
          </div>
        </div>

        {/* 上次吸烟时间 */}
        {lastSmokeTime && (
          <StatCard
            icon="⏰"
            title="距离上次吸烟"
            value={formatTimeSince(timeSinceLastSmoke)}
            subtitle={new Date(lastSmokeTime).toLocaleString('zh-CN')}
            color="from-blue-500 to-cyan-500"
            fullWidth
            className="mb-4"
          />
        )}

        {/* 周统计 */}
        {weekStats && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">本周统计</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">总根数</div>
                <div className="text-2xl font-bold text-gray-800">{weekStats.total}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">平均每天</div>
                <div className="text-2xl font-bold text-gray-800">{weekStats.average}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">最多</div>
                <div className="text-2xl font-bold text-gray-800">{weekStats.max}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">最少</div>
                <div className="text-2xl font-bold text-gray-800">{weekStats.min}</div>
              </div>
            </div>
          </div>
        )}

        {/* 月统计 */}
        {monthStats && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">本月统计</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">总根数</div>
                <div className="text-2xl font-bold text-gray-800">{monthStats.total}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">平均每天</div>
                <div className="text-2xl font-bold text-gray-800">{monthStats.average}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">最多</div>
                <div className="text-2xl font-bold text-gray-800">{monthStats.max}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">最少</div>
                <div className="text-2xl font-bold text-gray-800">{monthStats.min}</div>
              </div>
            </div>
          </div>
        )}

        {/* 计划进度 */}
        {plan && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">计划进度</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">初始根数</span>
                <span className="font-bold text-gray-800">{plan.initialCount} 根/天</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">目标根数</span>
                <span className="font-bold text-gray-800">{plan.targetCount} 根/天</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">计划周期</span>
                <span className="font-bold text-gray-800">{plan.weeks} 周</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">开始日期</span>
                <span className="font-bold text-gray-800">{plan.startDate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 记录弹窗 */}
      {showRecordModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRecordModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">记录今日根数</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今日吸烟根数
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={recordCount}
                onChange={(e) => setRecordCount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                placeholder="输入今日吸烟根数"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRecordModal(false)}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleSaveTodayCount}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-quit-green to-quit-green-dark text-white font-medium active:scale-95 transition-transform"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  )
}

// 统计卡片组件
function StatCard({ icon, title, value, subtitle, color, fullWidth, className = '' }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium opacity-90">{title}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subtitle && <div className="text-xs opacity-80">{subtitle}</div>}
    </div>
  )
}
