/**
 * 渐进式戒烟配置页面
 * 设置初始根数、目标根数、计划周期等
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNativeBridge from '../../utils/useNativeBridge'
import { formatDate, calculateGradualPlan } from '../../utils/gradualQuitUtils'

export default function GradualQuitConfig() {
  const navigate = useNavigate()
  const {
    isInApp,
    callNative,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
  } = useNativeBridge()

  const [initialCount, setInitialCount] = useState('20')
  const [targetCount, setTargetCount] = useState('0')
  const [weeks, setWeeks] = useState('8')
  const [startDate, setStartDate] = useState(formatDate(new Date()))
  const [planPreview, setPlanPreview] = useState([])
  const [loading, setLoading] = useState(true)

  const pageTitle = '渐进式戒烟配置'

  useEffect(() => {
    document.title = pageTitle
  }, [])

  useEffect(() => {
    if (isInApp && setTitle) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  useEffect(() => {
    loadExistingPlan()
  }, [])

  useEffect(() => {
    updatePlanPreview()
  }, [initialCount, targetCount, weeks, startDate])

  const loadExistingPlan = async () => {
    try {
      if (!isInApp) {
        setLoading(false)
        return
      }

      const plan = await callNative('quit.getGradualPlan').catch(() => null)
      if (plan) {
        setInitialCount(String(plan.initialCount || 20))
        setTargetCount(String(plan.targetCount || 0))
        setWeeks(String(plan.weeks || 8))
        if (plan.startDate) {
          setStartDate(plan.startDate)
        }
      }
    } catch (error) {
      console.error('加载计划失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePlanPreview = () => {
    const initial = Number(initialCount) || 0
    const target = Number(targetCount) || 0
    const weekCount = Number(weeks) || 8

    if (initial > 0 && weekCount > 0 && startDate) {
      const preview = calculateGradualPlan(initial, target, weekCount, startDate)
      setPlanPreview(preview)
    } else {
      setPlanPreview([])
    }
  }

  const handleSubmit = async () => {
    const initial = Number(initialCount)
    const target = Number(targetCount)
    const weekCount = Number(weeks)

    if (!initial || initial <= 0) {
      showToast('请输入有效的初始根数')
      return
    }

    if (target < 0 || target >= initial) {
      showToast('目标根数应小于初始根数')
      return
    }

    if (!weekCount || weekCount <= 0 || weekCount > 52) {
      showToast('计划周期应在1-52周之间')
      return
    }

    if (!startDate) {
      showToast('请选择开始日期')
      return
    }

    try {
      await showLoading('保存中...')

      await callNative('quit.setGradualPlan', {
        initialCount: initial,
        targetCount: target,
        weeks: weekCount,
        startDate,
      })

      await hideLoading()
      await showToast('配置保存成功')
      navigate('/habit/quit/gradual/stats', { replace: true })
    } catch (error) {
      await hideLoading()
      console.error('保存配置失败:', error)
      showToast('保存失败: ' + (error.message || '未知错误'))
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">渐进式戒烟配置</h1>
          <p className="text-gray-500 text-sm">设置你的戒烟计划，逐步减少吸烟量</p>
        </div>

        {/* 配置表单 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前每日吸烟根数
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={initialCount}
                onChange={(e) => setInitialCount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                placeholder="例如：20"
              />
              <p className="text-xs text-gray-400 mt-2">你目前每天大约抽多少根烟</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标每日根数
              </label>
              <input
                type="number"
                min="0"
                max={Number(initialCount) - 1 || 0}
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                placeholder="例如：0（完全戒除）"
              />
              <p className="text-xs text-gray-400 mt-2">计划达到的每日根数，通常为0</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计划周期（周数）
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                placeholder="例如：8"
              />
              <p className="text-xs text-gray-400 mt-2">计划用多少周完成戒烟（建议8-12周）</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={formatDate(new Date())}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
              />
              <p className="text-xs text-gray-400 mt-2">计划开始执行的日期</p>
            </div>
          </div>
        </div>

        {/* 计划预览 */}
        {planPreview.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">计划预览</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {planPreview.map((week, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-700">第 {week.week} 周</div>
                    <div className="text-xs text-gray-500">
                      {week.startDate} ~ {week.endDate}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-quit-green">
                    目标: {week.targetCount} 根/天
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium active:scale-95 transition-transform"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-quit-green to-quit-green-dark text-white font-medium shadow-lg active:scale-95 transition-transform"
          >
            保存配置
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>科学建议：</strong>渐进式戒烟比突然戒断更容易坚持。建议每周减少10-15%的吸烟量，给身体适应的时间。
          </p>
        </div>
      </div>
    </div>
  )
}
