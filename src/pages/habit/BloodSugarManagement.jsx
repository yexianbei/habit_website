/**
 * 健康数据记录管理页面（血糖、血压、血脂）
 * 风格对齐经期管理：顶部状态卡片 + 快捷记录按钮 + 当天记录列表 + 详情弹窗
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { useNativeBridge } from '../../utils/useNativeBridge'
import {
  formatDate,
  formatTime,
  parseDetails,
  renderRecordSummary,
  calculateTodaySummary,
  METRIC_TYPES,
} from './health/utils'
import HealthDataModal from './health/components/HealthDataModal'

export default function BloodSugarManagement() {
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } =
    useNativeBridge()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [defaultMetricType, setDefaultMetricType] = useState(METRIC_TYPES.GLUCOSE)

  const pageTitle = '健康数据记录'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    // 浏览器预览：使用假数据
    if (!isInApp) {
      const now = Date.now()
      setRecords([
        {
          id: 'mock-1',
          type: 'health',
          createTime: now - 1000 * 60 * 20,
          detailsRaw: JSON.stringify({
            metricType: METRIC_TYPES.GLUCOSE,
            value: 6.2,
            scene: 'fasting',
            meal: null,
            meds: '二甲双胍 0.5 片',
            note: '早晨空腹',
            time: '07:30',
          }),
        },
        {
          id: 'mock-2',
          type: 'health',
          createTime: now - 1000 * 60 * 60,
          detailsRaw: JSON.stringify({
            metricType: METRIC_TYPES.BLOOD_PRESSURE,
            systolic: 120,
            diastolic: 80,
            heartRate: 72,
            bpScene: 'morning',
            note: '晨起测量',
            time: '08:00',
          }),
        },
        {
          id: 'mock-3',
          type: 'health',
          createTime: now - 1000 * 60 * 120,
          detailsRaw: JSON.stringify({
            metricType: METRIC_TYPES.LIPID,
            tc: 4.5,
            tg: 1.3,
            hdl: 1.2,
            ldl: 2.0,
            lipidScene: 'fasting',
            note: '抽血检查',
            time: '09:00',
          }),
        },
      ])
      setIsLoading(false)
      return
    }

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const dateStr = formatDate(selectedDate)
        const res = await callNative('bloodSugar.getRecords', { date: dateStr })
        const list = Array.isArray(res?.records) ? res.records : []
        const mapped = list.map((r) => ({
          id: r.id || r.recordId || null,
          type: 'health',
          createTime: r.createTime,
          detailsRaw: r.details,
        }))
        mapped.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
        setRecords(mapped)
      } catch (e) {
        console.error('[HealthDataManagement] 加载失败:', e)
        setLoadError('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [isInApp, callNative, selectedDate])

  const todaySummary = useMemo(() => calculateTodaySummary(records), [records])

  const handleOpenNew = (metricType = METRIC_TYPES.GLUCOSE) => {
    setDefaultMetricType(metricType)
    setEditingIndex(null)
    setIsModalOpen(true)
  }

  const handleSaveRecord = async (details, options = {}) => {
    // 预览模式：只在内存中更新
    if (!isInApp) {
      const now = Date.now()
      const merged = {
        ...details,
        createdFrom: 'health_data_preview',
      }
      const newRecord = {
        id:
          options.index != null && records[options.index]
            ? records[options.index].id
            : `preview-${now}`,
        type: 'health',
        createTime: now,
        detailsRaw: JSON.stringify(merged),
      }
      setRecords((prev) => {
        if (options.index != null && options.index >= 0 && options.index < prev.length) {
          const copy = [...prev]
          copy[options.index] = newRecord
          return copy
        }
        return [newRecord, ...prev]
      })
      setIsModalOpen(false)
      return
    }

    try {
      await showLoading('保存中...')
      await callNative('bloodSugar.save', {
        recordId: options.recordId || null,
        date: formatDate(selectedDate),
        details: JSON.stringify({
          ...details,
          createdFrom: 'health_data_management',
        }),
      })
      await hideLoading()
      await showToast('已记录')
      setIsModalOpen(false)

      const dateStr = formatDate(selectedDate)
      const res = await callNative('bloodSugar.getRecords', { date: dateStr })
      const list = Array.isArray(res?.records) ? res.records : []
      const mapped = list.map((r) => ({
        id: r.id || r.recordId || null,
        type: 'health',
        createTime: r.createTime,
        detailsRaw: r.details,
      }))
      mapped.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
      setRecords(mapped)
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + (e.message || '未知错误'))
    }
  }

  const handleDeleteRecord = async (index) => {
    if (index == null || index < 0 || index >= records.length) {
      setIsModalOpen(false)
      return
    }
    const target = records[index]

    // 预览模式：本地删除
    if (!isInApp) {
      setRecords((prev) => prev.filter((_, i) => i !== index))
      setIsModalOpen(false)
      return
    }

    try {
      await showLoading('删除中...')
      if (target.id) {
        await callNative('bloodSugar.delete', { recordId: target.id })
      } else {
        await callNative('bloodSugar.delete', {
          date: formatDate(selectedDate),
        })
      }
      await hideLoading()
      await showToast('已删除')
      setIsModalOpen(false)

      const dateStr = formatDate(selectedDate)
      const res = await callNative('bloodSugar.getRecords', { date: dateStr })
      const list = Array.isArray(res?.records) ? res.records : []
      const mapped = list.map((r) => ({
        id: r.id || r.recordId || null,
        type: 'health',
        createTime: r.createTime,
        detailsRaw: r.details,
      }))
      mapped.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
      setRecords(mapped)
    } catch (e) {
      await hideLoading()
      await showToast('删除失败: ' + (e.message || '未知错误'))
    }
  }

  if (isInApp && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      {/* 头部状态区 */}
      <div className="relative overflow-hidden">
        <div
          className="px-6 pt-6 pb-8 relative z-10"
          style={{ background: 'linear-gradient(135deg, #FB7185 0%, #F97373 100%)' }}
        >
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{todaySummary.emoji}</span>
                <span className="text-4xl font-bold">{todaySummary.main}</span>
              </div>
              <p className="text-white/80 text-sm">{todaySummary.sub}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={deleteHabit}
                disabled={isDeleting}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-50"
                title="删除习惯"
              >
                🗑️
              </button>
              <span className="px-2 py-[2px] rounded-full bg-white/20 text-[10px]">
                {formatDate(selectedDate)}
              </span>
              <input
                type="date"
                value={formatDate(selectedDate)}
                onChange={(e) =>
                  setSelectedDate(e.target.value ? new Date(e.target.value) : new Date())
                }
                className="px-2 py-1 rounded-lg bg-white/15 text-white text-[11px] border border-white/40"
              />
            </div>
          </div>

          {/* 快捷操作按钮 */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: '🩸', label: '记录血糖', type: METRIC_TYPES.GLUCOSE },
              { icon: '💓', label: '记录血压', type: METRIC_TYPES.BLOOD_PRESSURE },
              { icon: '🧬', label: '记录血脂', type: METRIC_TYPES.LIPID },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleOpenNew(item.type)}
                className="py-3 rounded-2xl bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-sm text-white text-xs font-medium flex flex-col items-center justify-center active:scale-95 transition-transform shadow-sm border border-white/10"
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      {/* 当天记录 */}
      <div className="px-4 -mt-4 pb-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📅</span>
            当天记录
          </h3>
          {loadError && (
            <div className="mb-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {loadError}
            </div>
          )}
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              这一天还没有健康数据记录，点击上方按钮开始
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r, idx) => {
                const info = renderRecordSummary(r)
                return (
                  <div
                    key={r.id || idx}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-rose-50/30 border border-gray-100 hover:border-rose-200 hover:shadow-sm transition-all cursor-pointer active:scale-98"
                    onClick={() => {
                      const details = parseDetails(r.detailsRaw)
                      setDefaultMetricType(details.metricType || METRIC_TYPES.GLUCOSE)
                      setEditingIndex(idx)
                      setIsModalOpen(true)
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-2xl shadow-sm text-white flex-shrink-0">
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {info.title}
                        </p>
                        <span
                          className={`ml-2 px-2 py-[2px] rounded-full text-[10px] ${info.badgeColor}`}
                        >
                          {info.badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{info.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <HealthDataModal
          selectedDate={selectedDate}
          existingRecord={editingIndex != null ? records[editingIndex] : null}
          defaultMetricType={defaultMetricType}
          onClose={() => setIsModalOpen(false)}
          onSave={(details) =>
            handleSaveRecord(details, {
              index: editingIndex,
              recordId: editingIndex != null ? records[editingIndex]?.id : null,
            })
          }
          onDelete={
            editingIndex != null ? () => handleDeleteRecord(editingIndex) : null
          }
        />
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
