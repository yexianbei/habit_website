/**
 * 经期管理 - 首次使用引导页
 * 目标：收集最小必要信息（周期长度、经期长度、上一次经期开始日期）
 * 写入：eventAttr.habit.set + eventAttr.log.save（经 periodEventAttr 封装）
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import {
  fetchPeriodSettings,
  updatePeriodSettings,
  savePeriodRecord,
} from '../../utils/periodEventAttr'

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 用于 <input type="datetime-local"> 的默认值：YYYY-MM-DDTHH:mm
const formatDateTimeLocal = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const datePart = formatDate(d)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${datePart}T${hh}:${mm}`
}

export default function PeriodOnboarding() {
  const navigate = useNavigate()
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } = useNativeBridge()

  const [cycleLen, setCycleLen] = useState(28)
  const [periodLen, setPeriodLen] = useState(5)
  const [lastStartDate, setLastStartDate] = useState(formatDate(new Date()))
  const [lastStartTime, setLastStartTime] = useState('08:00')

  const canSubmit = useMemo(() => {
    const c = Number(cycleLen)
    const p = Number(periodLen)
    return (
      !!lastStartDate &&
      Number.isFinite(c) && c >= 20 && c <= 45 &&
      Number.isFinite(p) && p >= 2 && p <= 10
    )
  }, [cycleLen, periodLen, lastStartDate])

  const pageTitle = '经期管理'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    // 预填已有设置
    const load = async () => {
      if (!isInApp) return
      try {
        const s = await fetchPeriodSettings(callNative)
        if (s) {
          if (s.cycleLength) setCycleLen(s.cycleLength)
          if (s.periodLength) setPeriodLen(s.periodLength)
        }
      } catch (_) {}
    }
    load()
  }, [isInApp, callNative])

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await showLoading('初始化中...')

      await updatePeriodSettings(callNative, {
        cycleLength: Number(cycleLen),
        periodLength: Number(periodLen),
      })

      const saveCreateTime = new Date(lastStartDate + 'T' + (lastStartTime || '08:00') + ':00').getTime()
      await savePeriodRecord(callNative, {
        date: lastStartDate,
        createTime: saveCreateTime,
        details: {
          saveType: 'period',
          isPeriod: true,
          periodStartTime: lastStartTime || null,
        },
      })

      await hideLoading()
      await showToast('初始化完成')
      // skipOnboarding=1 防止主页面因 lastPeriodStart 暂时未查到而再次跳回此页
      navigate('/habit/period?skipOnboarding=1', { replace: true })
    } catch (e) {
      await hideLoading()
      await showToast('初始化失败: ' + (e?.message || '未知错误'))
    }
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-200">
            <span className="text-5xl">🌸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">经期管理</h1>
          <p className="text-gray-500">请在小习惯 App 内使用</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">首次使用初始化</h2>
                <p className="text-sm text-gray-500">填完即可开始预测</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">周期长度（天）</label>
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={cycleLen}
                  onChange={(e) => setCycleLen(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <p className="text-xs text-gray-400 mt-2">推荐范围 20–45，默认 28</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">经期长度（天）</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={periodLen}
                  onChange={(e) => setPeriodLen(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <p className="text-xs text-gray-400 mt-2">推荐范围 2–10，默认 5</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上一次经期开始时间</label>
                <div className="flex gap-2 sm:gap-3 items-stretch min-w-0">
                  <input
                    type="date"
                    value={lastStartDate}
                    onChange={(e) => setLastStartDate(e.target.value)}
                    className="flex-1 min-w-0 box-border px-3 sm:px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm max-[400px]:text-xs"
                  />
                  <input
                    type="time"
                    value={lastStartTime}
                    onChange={(e) => setLastStartTime(e.target.value)}
                    className="flex-shrink-0 w-24 sm:w-28 min-w-0 box-border px-2 sm:px-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm max-[400px]:text-xs"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">这是预测的关键数据，精确到时分</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg shadow-pink-200 disabled:opacity-50"
              >
                开始使用
              </button>

              <button
                onClick={() => navigate('/habit/period?skipOnboarding=1', { replace: true })}
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

