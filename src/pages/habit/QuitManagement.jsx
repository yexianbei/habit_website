/**
 * 戒烟管理页面
 * 参考 quit-web-app-main 的绿色主题风格
 * 整合统计、激励、成就等功能
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { formatDate, diffDays, calculateQuitTime } from '../../utils/quitUtils'
import {
  createQuitEventApi,
  deleteQuitAllApi,
  getQuitDashboardApi,
  hasWorkerAuthToken,
  saveGradualDailyCountApi,
} from '../../utils/quitApi'
import { CompactStatsCard } from './quit/components/StatsCard'
import { AchievementSection } from './quit/components/AchievementSection'
import { HealthDetailModal } from './quit/components/modals/HealthDetailModal'
import { MoneyDetailModal } from './quit/components/modals/MoneyDetailModal'
import { AchievementDetailModal } from './quit/components/modals/AchievementDetailModal'
import { RelapseModal } from './quit/components/modals/RelapseModal'

function notify(message) {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message)
  }
}

// ============ 主页面组件 ============

export default function QuitManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInApp, callNative, showToast, closePage } = useNativeBridge()

  const [quitDate, setQuitDate] = useState(null)
  const [lastRelapseDate, setLastRelapseDate] = useState(null) // 最后一次破戒时间
  const [dailyCost, setDailyCost] = useState(0)
  const [cigarettesPerDay, setCigarettesPerDay] = useState(0) // 每天抽多少根
  const [pricePerCigarette, setPricePerCigarette] = useState(0) // 每根多少钱
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [showMoneyModal, setShowMoneyModal] = useState(false)
  const [showRelapseModal, setShowRelapseModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasGradualPlan, setHasGradualPlan] = useState(false)
  const [todayGradualCount, setTodayGradualCount] = useState(0)
  const [todayGradualTarget, setTodayGradualTarget] = useState(0)
  const [todayGradualRemaining, setTodayGradualRemaining] = useState(0)
  const [todayGradualCost, setTodayGradualCost] = useState(0)
  const [todayGradualTar, setTodayGradualTar] = useState(0)
  const [lastGradualSmokeAt, setLastGradualSmokeAt] = useState(null)
  const [weekGradualStats, setWeekGradualStats] = useState(null)
  const [monthGradualStats, setMonthGradualStats] = useState(null)
  const [showQuickGradualModal, setShowQuickGradualModal] = useState(false)
  const [quickGradualCount, setQuickGradualCount] = useState('')
  const [savingQuickGradual, setSavingQuickGradual] = useState(false)
  const [quitTime, setQuitTime] = useState(null) // 实时更新的坚持时间
  const [savedMoney, setSavedMoney] = useState(0) // 实时更新的节省金额

  const pageTitle = '戒烟管理'
  
  useEffect(() => {
    document.title = pageTitle
  }, [])
  
  useEffect(() => {
    // 在浏览器环境也尝试加载数据（会返回 mock 数据）
    loadData()
  }, [])

  // 实时更新坚持时间（每秒更新）
  useEffect(() => {
    if (!quitDate) {
      setQuitTime(null)
      setSavedMoney(0)
      return
    }

    const updateTime = () => {
      const time = calculateQuitTime(quitDate, lastRelapseDate)
      setQuitTime(time)
    }

    // 立即更新一次
    updateTime()

    // 每秒更新
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [quitDate, lastRelapseDate])

  // 实时更新节省金额（跟随quitTime更新，每秒更新显示，但计算基于分钟）
  useEffect(() => {
    if (!quitDate || !quitTime) {
      setSavedMoney(0)
      return
    }

    // 计算节省金额：根据戒烟时间（分钟）和每分钟的成本
    if (cigarettesPerDay > 0 && pricePerCigarette > 0) {
      // 计算总分钟数（包括秒数转换为分钟的小数部分，精确计算）
      const totalMinutes = quitTime.days * 24 * 60 + quitTime.hours * 60 + quitTime.minutes + quitTime.seconds / 60
      
      // 计算每分钟的成本：每天花费 / 每天分钟数
      const costPerMinute = (cigarettesPerDay * pricePerCigarette) / (24 * 60)
      
      // 计算节省金额，精确到小数点后两位
      const saved = totalMinutes * costPerMinute
      setSavedMoney(parseFloat(saved.toFixed(2)))
    } else if (dailyCost > 0) {
      // 如果没有设置根数和单价，使用旧的按天计算方式（也精确到分钟）
      const totalMinutes = quitTime.days * 24 * 60 + quitTime.hours * 60 + quitTime.minutes + quitTime.seconds / 60
      const costPerMinute = dailyCost / (24 * 60)
      const saved = totalMinutes * costPerMinute
      setSavedMoney(parseFloat(saved.toFixed(2)))
    } else {
      setSavedMoney(0)
    }
  }, [quitDate, quitTime, cigarettesPerDay, pricePerCigarette, dailyCost])

  const loadData = async () => {
    try {
      setLoading(true)
      const workerEnabled = await hasWorkerAuthToken().catch(() => false)
      if (!workerEnabled) {
        throw new Error('缺少 token，请在打开 H5 时携带 token 参数')
      }
      
      const params = new URLSearchParams(location.search)
      const skipOnboarding = params.get('skipOnboarding') === '1'

      const today = formatDate(new Date())
      const dashboard = await getQuitDashboardApi(today).catch(() => null)
      if (!dashboard) {
        throw new Error('获取戒烟数据失败')
      }

      const relapseAt = dashboard?.lastRelapseAt
      if (relapseAt) {
        setLastRelapseDate(new Date(relapseAt * 1000).toISOString())
      } else {
        setLastRelapseDate(null)
      }

      const quitStartAt = dashboard?.quitStartAt || dashboard?.profile?.quitStartAt || null
      if (!quitStartAt && !skipOnboarding) {
        setLoading(false)
        navigate('/habit/quit/onboarding', { replace: true })
        return
      }
      if (quitStartAt) setQuitDate(new Date(quitStartAt * 1000))

      const nextDailyCost = Number(dashboard?.profile?.dailyCost || dashboard?.dailyCost || 0)
      setDailyCost(nextDailyCost)
      setCigarettesPerDay(Number(dashboard?.profile?.cigarettesPerDay || 0))
      setPricePerCigarette(Number(dashboard?.profile?.pricePerCigarette || 0))

      const hasPlan = Boolean(dashboard?.gradual?.enabled)
      setHasGradualPlan(hasPlan)
      if (hasPlan) {
        setTodayGradualCount(Number(dashboard?.gradual?.todayCount || 0))
        setTodayGradualTarget(Number(dashboard?.gradual?.targetToday || 0))
        setTodayGradualRemaining(Number(dashboard?.gradual?.remaining || 0))
        setTodayGradualCost(Number(dashboard?.gradual?.todayCost || 0))
        setTodayGradualTar(Number(dashboard?.gradual?.todayTar || 0))
        setLastGradualSmokeAt(dashboard?.gradual?.lastSmokeAt || null)
        setWeekGradualStats(dashboard?.gradual?.week || null)
        setMonthGradualStats(dashboard?.gradual?.month || null)
      } else {
        setTodayGradualCount(0)
        setTodayGradualTarget(0)
        setTodayGradualRemaining(0)
        setTodayGradualCost(0)
        setTodayGradualTar(0)
        setLastGradualSmokeAt(null)
        setWeekGradualStats(null)
        setMonthGradualStats(null)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      notify('加载数据失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHabit = async () => {
    if (!isInApp || isDeleting) return
    let confirmed = false
    try {
      const result = await callNative('ui.showConfirm', {
        title: '删除戒烟',
        message: '确定要删除「戒烟」吗？删除后本地习惯和云端戒烟数据都会被清除，且无法恢复。',
      })
      confirmed = result?.confirmed === true
    } catch (_) {
      return
    }
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await callNative('ui.showLoading', { message: '正在清理云端数据...' })
      try {
        await deleteQuitAllApi()
      } catch (e) {
        await callNative('ui.hideLoading', {})
        await showToast('云端数据删除失败，请重试')
        return
      }

      await callNative('ui.showLoading', { message: '正在删除本地习惯...' })
      const nativeResult = await callNative('habit.deleteWithData', { type: 17 })
      const localDeleted = nativeResult?.success === true
      if (!localDeleted) {
        await callNative('ui.hideLoading', {})
        await showToast('云端数据已删除，但本地习惯删除失败，请重试')
        return
      }

      await callNative('ui.hideLoading', {})
      await showToast('戒烟习惯和云端数据已删除')
      setTimeout(() => closePage(), 800)
    } catch (e) {
      await callNative('ui.hideLoading', {})
      await showToast('删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenQuickGradualRecord = () => {
    if (!hasGradualPlan) {
      navigate('/habit/quit/gradual/config')
      return
    }
    setQuickGradualCount(String(todayGradualCount))
    setShowQuickGradualModal(true)
  }

  const handleSaveQuickGradualRecord = async () => {
    const count = Number(quickGradualCount)
    if (!Number.isFinite(count) || count < 0 || count > 200) {
      notify('请输入 0-200 的有效根数')
      return
    }

    try {
      setSavingQuickGradual(true)
      const today = formatDate(new Date())
      await saveGradualDailyCountApi({
        date: today,
        count,
        datetime: new Date().toISOString(),
      })
      setShowQuickGradualModal(false)
      notify('今日抽烟根数已保存')
      await loadData()
    } catch (error) {
      notify('保存失败: ' + (error.message || '未知错误'))
    } finally {
      setSavingQuickGradual(false)
    }
  }

  const getStatusInfo = () => {
    if (!quitDate) {
      return {
        main: '未设置',
        sub: '点击设置戒烟日期开始',
        emoji: '🚭',
        days: 0,
        savedMoney: 0,
        healthImprovements: {
          heartRate: 0,
          oxygen: 0,
        },
      }
    }

    // 如果有破戒记录，从破戒时间开始计算天数
    const startDate = lastRelapseDate || quitDate
    const today = new Date()
    const days = diffDays(today, startDate)
    
    if (days < 0) {
      return {
        main: '未来日期',
        sub: '请设置正确的戒烟日期',
        emoji: '📅',
        days: 0,
        savedMoney: 0,
        healthImprovements: {
          heartRate: 0,
          oxygen: 0,
        },
      }
    }

    // 使用实时计算的 savedMoney，如果还没有则使用旧的计算方式作为后备
    const calculatedSavedMoney = savedMoney > 0 ? savedMoney : (days * dailyCost)
    const healthImprovements = {
      heartRate: Math.min(20, days * 0.5), // 心率改善（最多20%）
      oxygen: Math.min(15, days * 0.3),    // 血氧改善（最多15%）
    }

    return {
      main: `${days} 天`,
      sub: days > 0 ? '坚持就是胜利！' : '今天开始戒烟',
      emoji: days >= 30 ? '🎉' : days >= 7 ? '💪' : '🚭',
      days,
      savedMoney: calculatedSavedMoney,
      healthImprovements,
    }
  }

  const status = getStatusInfo()
  const formatLastSmoke = (isoText) => {
    if (!isoText) return '暂无记录'
    const date = new Date(isoText)
    if (Number.isNaN(date.getTime())) return '暂无记录'
    return date.toLocaleString('zh-CN')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {quitDate && quitTime && activeTab === 'home' && (
        <div className="relative overflow-hidden shadow-lg bg-gradient-to-br from-quit-green to-quit-green-dark">
          <div
            className="px-6 pt-8 pb-6 relative z-10"
            style={{
              backgroundImage: 'url(/assets/quit/first-images.png)',
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-quit-green/50 to-quit-green-dark/50 backdrop-blur-sm z-0" />
            <div className="relative z-10 text-center">
              <div className="text-white text-sm font-medium mb-4 drop-shadow-md">你已经坚持戒烟</div>
              <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl sm:text-6xl font-extrabold text-white tabular-nums drop-shadow-lg">{quitTime.days}</span>
                  <span className="text-xl sm:text-2xl text-white font-semibold drop-shadow-md">天</span>
                </div>
                <div className="w-px h-10 sm:h-12 bg-white/40"></div>
                <div className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums drop-shadow-md">{String(quitTime.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs text-white/90 mt-0.5 drop-shadow-sm">时</span>
                  </div>
                  <span className="text-xl sm:text-2xl text-white/95 font-light mx-0.5 drop-shadow-sm">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums drop-shadow-md">{String(quitTime.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs text-white/90 mt-0.5 drop-shadow-sm">分</span>
                  </div>
                  <span className="text-xl sm:text-2xl text-white/95 font-light mx-0.5 animate-pulse drop-shadow-sm">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums drop-shadow-md animate-pulse">{String(quitTime.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] sm:text-xs text-white/90 mt-0.5 drop-shadow-sm">秒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
        </div>
      )}

      {!quitDate && activeTab === 'home' && (
        <div className="relative overflow-hidden">
          <div className="px-6 pt-6 pb-8 relative z-10" style={{ background: 'linear-gradient(135deg, #00e300 0%, #00e500 100%)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{status.emoji}</span>
                  <span className="text-4xl font-bold">{status.main}</span>
                </div>
                <p className="text-white/80 text-sm">{status.sub}</p>
              </div>
              <button
                onClick={() => navigate('/habit/quit/onboarding')}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                title="设置戒烟日期"
              >
                ⚙️
              </button>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
        </div>
      )}

      <div className={`px-4 ${activeTab === 'home' && quitDate ? 'pt-4' : 'pt-4'} relative z-10 space-y-4 pb-28`}>
        {activeTab === 'home' && (
          <>
            {quitDate && (
              <div className="flex gap-3">
                <CompactStatsCard
                  icon="💰"
                  title="节省金额"
                  value={`¥${(status.savedMoney || 0).toFixed(2)}`}
                  subtitle={dailyCost > 0 ? `每天¥${dailyCost.toFixed(2)}` : '未设置'}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                  onClick={() => setShowMoneyModal(true)}
                />
                <CompactStatsCard
                  icon="❤️"
                  title="健康改善"
                  value={`+${Math.round(status.healthImprovements?.heartRate || 0)}%`}
                  subtitle="心率恢复"
                  gradient="bg-gradient-to-br from-red-500 to-pink-500"
                  onClick={() => setShowHealthModal(true)}
                />
                <CompactStatsCard
                  icon="🚭"
                  title="破戒"
                  value="记录"
                  subtitle="点击记录"
                  gradient="bg-gradient-to-br from-gray-500 to-gray-600"
                  onClick={() => setShowRelapseModal(true)}
                />
              </div>
            )}

            {hasGradualPlan && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-2xl">📉</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">渐进式戒烟</h3>
                      <p className="text-sm text-gray-500">今日已记录 {todayGradualCount} 根，目标 {todayGradualTarget} 根</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenQuickGradualRecord}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium border border-blue-200 active:scale-95 transition-transform"
                  >
                    记录今日
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-blue-50 py-2">
                    <div className="text-xs text-blue-700">剩余</div>
                    <div className="text-sm font-bold text-blue-900">{todayGradualRemaining} 根</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 py-2">
                    <div className="text-xs text-amber-700">今日花费</div>
                    <div className="text-sm font-bold text-amber-900">¥{Number(todayGradualCost || 0).toFixed(2)}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 py-2">
                    <div className="text-xs text-gray-600">今日焦油</div>
                    <div className="text-sm font-bold text-gray-900">{todayGradualTar} mg</div>
                  </div>
                </div>
              </div>
            )}

            {!quitDate && (
              <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚭</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">开始你的戒烟之旅</h3>
                <p className="text-gray-500 mb-6">设置戒烟日期，开始记录你的戒烟历程</p>
                <button
                  onClick={() => navigate('/habit/quit/onboarding')}
                  className="px-8 py-3 bg-gradient-to-r from-quit-green to-quit-green-dark text-white rounded-xl font-medium shadow-lg shadow-green-200 active:scale-95 transition-transform"
                >
                  设置戒烟日期
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-1">核心统计</h3>
              <p className="text-sm text-gray-500 mb-3">破戒记录仍在首页卡片内，点击“破戒记录”即可填写。</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <div className="text-xs text-amber-700">累计节省</div>
                  <div className="text-xl font-bold text-amber-900">¥{(status.savedMoney || 0).toFixed(2)}</div>
                </div>
                <div className="rounded-xl bg-rose-50 p-3">
                  <div className="text-xs text-rose-700">健康改善</div>
                  <div className="text-xl font-bold text-rose-900">+{Math.round(status.healthImprovements?.heartRate || 0)}%</div>
                </div>
              </div>
            </div>

            {hasGradualPlan && (
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">渐进式今日统计</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-orange-50 p-3">
                      <div className="text-xs text-orange-700">今日根数</div>
                      <div className="text-xl font-bold text-orange-900">{todayGradualCount} 根</div>
                      <div className="text-xs text-orange-700">目标 {todayGradualTarget} 根</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <div className="text-xs text-emerald-700">剩余根数</div>
                      <div className="text-xl font-bold text-emerald-900">{todayGradualRemaining} 根</div>
                      <div className="text-xs text-emerald-700">距离上次：{formatLastSmoke(lastGradualSmokeAt)}</div>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <div className="text-xs text-amber-700">今日花费</div>
                      <div className="text-xl font-bold text-amber-900">¥{Number(todayGradualCost || 0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-xs text-slate-600">今日焦油</div>
                      <div className="text-xl font-bold text-slate-900">{todayGradualTar} mg</div>
                    </div>
                  </div>
                </div>

                {weekGradualStats && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">本周统计</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">总根数</div><div className="text-xl font-bold text-gray-800">{weekGradualStats.total}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">平均每天</div><div className="text-xl font-bold text-gray-800">{weekGradualStats.average}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">最多</div><div className="text-xl font-bold text-gray-800">{weekGradualStats.max}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">最少</div><div className="text-xl font-bold text-gray-800">{weekGradualStats.min}</div></div>
                    </div>
                  </div>
                )}

                {monthGradualStats && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">本月统计</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">总根数</div><div className="text-xl font-bold text-gray-800">{monthGradualStats.total}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">平均每天</div><div className="text-xl font-bold text-gray-800">{monthGradualStats.average}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">最多</div><div className="text-xl font-bold text-gray-800">{monthGradualStats.max}</div></div>
                      <div className="rounded-xl bg-gray-50 p-3"><div className="text-xs text-gray-500">最少</div><div className="text-xl font-bold text-gray-800">{monthGradualStats.min}</div></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'achievement' && (
          <>
            {quitDate && quitTime ? (
              <>
                <AchievementSection
                  days={quitTime.days}
                  hours={quitTime.days * 24 + quitTime.hours}
                  onViewAll={() => setShowAchievementModal(true)}
                />
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img src="/assets/quit/achievements.svg" alt="achievements" className="w-16 h-16 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-quit-green-dark mb-0.5">Money, Achievements, Health</h4>
                      <h3 className="text-lg font-bold text-quit-green-dark">Track your success</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">你的成就会随着无烟天数累计展示在这里，你还可以查看全部成就明细。</p>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm text-sm text-gray-500">开始戒烟后，这里会显示你的成就进度。</div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-amber-700">请通过带 token 的链接打开本页面，否则无法加载戒烟数据。</p>
            </div>

            {isInApp && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
                <button
                  onClick={handleDeleteHabit}
                  disabled={isDeleting}
                  className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium border border-red-200 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isDeleting ? '删除中...' : '删除戒烟习惯与云端数据'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">删除后将清空当前账号所有戒烟云端数据，并删除本地习惯入口</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
          <button onClick={() => setActiveTab('home')} className={`text-sm font-medium ${activeTab === 'home' ? 'text-quit-green' : 'text-gray-500'}`}>
            首页
          </button>
          <button onClick={() => setActiveTab('stats')} className={`text-sm font-medium ${activeTab === 'stats' ? 'text-quit-green' : 'text-gray-500'}`}>
            统计
          </button>
          <button onClick={() => setActiveTab('achievement')} className={`text-sm font-medium ${activeTab === 'achievement' ? 'text-quit-green' : 'text-gray-500'}`}>
            成就
          </button>
        </div>
      </div>

      {/* 健康数据详情弹窗 */}
      <HealthDetailModal 
        isOpen={showHealthModal} 
        onClose={() => setShowHealthModal(false)}
        healthData={status.healthImprovements}
        days={status.days}
        quitDate={quitDate}
      />

      {/* 金额统计详情弹窗 */}
      <MoneyDetailModal 
        isOpen={showMoneyModal} 
        onClose={() => setShowMoneyModal(false)}
        savedMoney={status.savedMoney}
        dailyCost={dailyCost}
        days={status.days}
        onDailyCostChange={(newCost) => {
          setDailyCost(newCost)
        }}
        onSettingsChange={(settings) => {
          if (settings.cigarettesPerDay) {
            setCigarettesPerDay(settings.cigarettesPerDay)
          }
          if (settings.pricePerCigarette) {
            setPricePerCigarette(settings.pricePerCigarette)
          }
        }}
        showToast={notify}
        showLoading={() => {}}
        hideLoading={() => {}}
      />

      {/* 成就详情弹窗 */}
      {quitTime && (
        <AchievementDetailModal 
          isOpen={showAchievementModal} 
          onClose={() => setShowAchievementModal(false)}
          days={quitTime.days}
          hours={quitTime.days * 24 + quitTime.hours}
        />
      )}

      {/* 破戒记录弹窗 */}
      <RelapseModal
        isOpen={showRelapseModal}
        onClose={() => setShowRelapseModal(false)}
        onSave={async (relapseData) => {
          try {
            const now = new Date()
            const datetime = relapseData.datetime || now.toISOString()

            await createQuitEventApi({
              date: formatDate(new Date(datetime)),
              eventAt: datetime,
              type: 'relapse',
              resetQuitDate: true,
              details: {
                datetime,
                cigaretteType: relapseData.cigaretteType || '',
                note: relapseData.note || '',
              },
            })
            
            // 更新本地状态
            setLastRelapseDate(datetime)
            setQuitDate(new Date(datetime))
            
            // 重新加载数据
            await loadData()
            
            notify('破戒记录已保存，戒烟时间已重置')
            setShowRelapseModal(false)
          } catch (error) {
            console.error('保存破戒记录失败:', error)
            notify('保存失败: ' + (error.message || '未知错误'))
          }
        }}
      />

      {showQuickGradualModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQuickGradualModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">记录今日抽烟根数</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">今日吸烟根数</label>
              <input
                type="number"
                min="0"
                max="200"
                value={quickGradualCount}
                onChange={(e) => setQuickGradualCount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                placeholder="输入今日吸烟根数"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuickGradualModal(false)}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={handleSaveQuickGradualRecord}
                disabled={savingQuickGradual}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-quit-green to-quit-green-dark text-white font-medium active:scale-95 transition-transform disabled:opacity-50"
              >
                {savingQuickGradual ? '保存中...' : '保存'}
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
