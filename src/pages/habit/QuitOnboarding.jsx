/**
 * 戒烟管理 - 首次使用引导页
 * 目标：收集最小必要信息（戒烟日期、每日吸烟花费）
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useNativeBridge from '../../utils/useNativeBridge'

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function QuitOnboarding() {
  const navigate = useNavigate()
  const {
    isInApp,
    callNative,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
  } = useNativeBridge()

  const [quitDate, setQuitDateLocal] = useState(formatDate(new Date()))
  const [quitTime, setQuitTime] = useState('08:00')
  const [dailyCost, setDailyCostLocal] = useState('20')

  const canSubmit = useMemo(() => {
    const date = quitDate
    const cost = Number(dailyCost)
    return (
      !!date &&
      Number.isFinite(cost) && cost > 0 && cost <= 10000
    )
  }, [quitDate, dailyCost])

  const pageTitle = '戒烟管理'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp && setTitle) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  useEffect(() => {
    // 预填已有设置
    const load = async () => {
      if (!isInApp) return
      try {
        const date = await callNative('quit.getQuitDate').catch(() => null)
        const cost = await callNative('quit.getDailyCost').catch(() => 0)
        if (date) {
          const d = new Date(date)
          setQuitDateLocal(formatDate(d))
          setQuitTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
        }
        if (cost) {
          setDailyCostLocal(String(cost))
        }
      } catch (_) {}
    }
    load()
  }, [isInApp, getQuitDate, getDailyCost])

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await showLoading('初始化中...')

      // 1) 设置戒烟日期（包含时间）
      const dateTime = `${quitDate}T${quitTime}:00`
      await callNative('quit.setQuitDate', { date: dateTime })

      // 2) 设置每日花费
      await callNative('quit.setDailyCost', { cost: Number(dailyCost) })

      await hideLoading()
      await showToast('初始化完成')
      navigate('/habit/quit', { replace: true })
    } catch (e) {
      await hideLoading()
      await showToast('初始化失败: ' + (e?.message || '未知错误'))
    }
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
            <span className="text-5xl">🚭</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">戒烟管理</h1>
          <p className="text-gray-500">请在小习惯 App 内使用</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-quit-green to-quit-green-dark flex items-center justify-center shadow-lg shadow-green-200">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">首次使用初始化</h2>
                <p className="text-sm text-gray-500">填完即可开始记录</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">戒烟日期</label>
                <input
                  type="date"
                  value={quitDate}
                  onChange={(e) => setQuitDateLocal(e.target.value)}
                  max={formatDate(new Date())}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                />
                <p className="text-xs text-gray-400 mt-2">选择你开始戒烟的日期</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">戒烟时间</label>
                <input
                  type="time"
                  value={quitTime}
                  onChange={(e) => setQuitTime(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                />
                <p className="text-xs text-gray-400 mt-2">选择你开始戒烟的具体时间</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">每日吸烟花费（元）</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="0.01"
                  value={dailyCost}
                  onChange={(e) => setDailyCostLocal(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                />
                <p className="text-xs text-gray-400 mt-2">用于计算节省金额，例如：20 元/天</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-quit-green to-quit-green-dark text-white font-medium shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                开始使用
              </button>

              <button
                onClick={() => navigate('/habit/quit?skipOnboarding=1', { replace: true })}
                className="w-full py-2 text-sm text-gray-400"
              >
                稍后再填
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            数据仅存本机，可随时删除或修改
          </p>
        </div>
      </div>
    </div>
  )
}
