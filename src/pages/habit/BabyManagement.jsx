/**
 * 宝宝成长管理页面
 * 参考经期管理和睡眠管理的结构：
 * - 顶部宝宝信息 & 今日状态
 * - 快捷记录按钮（喂奶 / 睡眠 / 体温 / 疫苗 / 身高 / 体重）
 * - 今日时间线
 *
 * 注意：与原生的具体数据协议（baby.getRecords / baby.save 等）需要在 App 侧实现；
 * 这里约定一个较通用的结构，前端按约定读写 details JSON。
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const calcAgeLabel = (birthdayStr) => {
  if (!birthdayStr) return ''
  const birthday = new Date(birthdayStr.replace(/-/g, '/'))
  const today = new Date()
  let months =
    (today.getFullYear() - birthday.getFullYear()) * 12 +
    (today.getMonth() - birthday.getMonth())
  let days = today.getDate() - birthday.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) return ''
  if (months === 0) {
    return `${days} 天`
  }
  return days > 0 ? `${months} 个月 ${days} 天` : `${months} 个月`
}

// 记录类型映射
const RECORD_TYPES = {
  FEEDING: 'feeding',
  SLEEP: 'sleep',
  TEMPERATURE: 'temperature',
  VACCINE: 'vaccine',
  HEIGHT: 'height',
  WEIGHT: 'weight',
}

// 简单的记录卡片渲染
const renderRecordSummary = (record) => {
  const { type, createTime, detailsRaw } = record
  let details = {}
  try {
    details = detailsRaw ? JSON.parse(detailsRaw) : {}
  } catch (e) {
    details = {}
  }

  const timeLabel = formatTime(createTime)

  if (type === RECORD_TYPES.FEEDING) {
    const modeMap = {
      breast: '母乳',
      formula: '配方奶',
      mixed: '混合',
    }
    const sideMap = {
      left: '左侧',
      right: '右侧',
      both: '双侧',
    }
    const modeText = modeMap[details.mode] || '喂奶'
    const sideText = sideMap[details.side] || ''
    const duration =
      typeof details.durationMinutes === 'number' && details.durationMinutes > 0
        ? `${details.durationMinutes} 分钟`
        : ''
    const amount =
      typeof details.amountMl === 'number' && details.amountMl > 0
        ? `${details.amountMl} ml`
        : ''
    const extra = [sideText, duration || amount].filter(Boolean).join(' · ')
    return {
      icon: '🍼',
      title: `${timeLabel} ${modeText}`,
      desc: extra || '已记录一次喂奶',
      badgeColor: 'bg-orange-100 text-orange-600',
    }
  }

  if (type === RECORD_TYPES.SLEEP) {
    const sleepTypeMap = {
      nap: '白天小睡',
      night: '夜间睡眠',
    }
    const label = sleepTypeMap[details.sleepType] || '睡眠'
    const duration =
      typeof details.durationMinutes === 'number' && details.durationMinutes > 0
        ? `${(details.durationMinutes / 60).toFixed(1)} 小时`
        : ''
    return {
      icon: '😴',
      title: `${timeLabel} ${label}`,
      desc: duration ? `本次 ${duration}` : '已记录一次睡眠',
      badgeColor: 'bg-indigo-100 text-indigo-600',
    }
  }

  if (type === RECORD_TYPES.TEMPERATURE) {
    const value = details.value
    const methodMap = {
      armpit: '腋下',
      ear: '耳温',
      forehead: '额温',
    }
    const method = methodMap[details.method] || ''
    const main = typeof value === 'number' ? `${value.toFixed(1)} ℃` : '体温'
    const sub = method ? `${method}测量` : '已记录体温'
    return {
      icon: '🌡',
      title: `${timeLabel} ${main}`,
      desc: sub,
      badgeColor: 'bg-red-100 text-red-600',
    }
  }

  if (type === RECORD_TYPES.VACCINE) {
    const name = details.name || '疫苗接种'
    const dose = details.dose || ''
    const extra = [dose, details.hospital].filter(Boolean).join(' · ')
    return {
      icon: '💉',
      title: `${timeLabel} ${name}`,
      desc: extra || '已接种疫苗',
      badgeColor: 'bg-emerald-100 text-emerald-600',
    }
  }

  if (type === RECORD_TYPES.HEIGHT) {
    const v = typeof details.valueCm === 'number' ? `${details.valueCm} cm` : '身高'
    return {
      icon: '📏',
      title: `${timeLabel} 身高`,
      desc: v,
      badgeColor: 'bg-sky-100 text-sky-600',
    }
  }

  if (type === RECORD_TYPES.WEIGHT) {
    const v = typeof details.valueKg === 'number' ? `${details.valueKg} kg` : '体重'
    return {
      icon: '⚖️',
      title: `${timeLabel} 体重`,
      desc: v,
      badgeColor: 'bg-purple-100 text-purple-600',
    }
  }

  return {
    icon: '📌',
    title: timeLabel,
    desc: '已记录',
    badgeColor: 'bg-gray-100 text-gray-500',
  }
}

export default function BabyManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } =
    useNativeBridge()

  const [settings, setSettings] = useState(null)
  const [records, setRecords] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [activeType, setActiveType] = useState(null) // 当前在编辑的记录类型
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null) // 正在编辑的记录索引（null 表示新建）

  const pageTitle = '宝宝成长'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    // Web 端（非 App 内）使用模拟数据，方便本地预览 UI
    if (!isInApp) {
      const today = new Date()
      const mockNow = today.getTime()
      setSettings({
        name: '可乐',
        gender: 'female',
        birthday: '2025-01-01',
        birthHeight: 50,
        birthWeight: 3.2,
      })
      setRecords([
        {
          id: 'mock-feeding-1',
          type: RECORD_TYPES.FEEDING,
          createTime: mockNow - 1000 * 60 * 30,
          detailsRaw: JSON.stringify({
            mode: 'formula',
            amountMl: 120,
            brand: '默认品牌奶粉',
            pricePerKg: 200,
            totalCost: 24,
            time: formatTime(new Date(mockNow - 1000 * 60 * 30)),
          }),
        },
        {
          id: 'mock-sleep-1',
          type: RECORD_TYPES.SLEEP,
          createTime: mockNow - 1000 * 60 * 90,
          detailsRaw: JSON.stringify({
            sleepType: 'nap',
            durationMinutes: 60,
            startTime: '13:00',
            endTime: '14:00',
          }),
        },
        {
          id: 'mock-temperature-1',
          type: RECORD_TYPES.TEMPERATURE,
          createTime: mockNow - 1000 * 60 * 150,
          detailsRaw: JSON.stringify({
            value: 37.2,
            method: 'armpit',
            time: formatTime(new Date(mockNow - 1000 * 60 * 150)),
          }),
        },
        {
          id: 'mock-height-1',
          type: RECORD_TYPES.HEIGHT,
          createTime: mockNow - 1000 * 60 * 200,
          detailsRaw: JSON.stringify({
            valueCm: 65.2,
            method: 'lying',
          }),
        },
        {
          id: 'mock-weight-1',
          type: RECORD_TYPES.WEIGHT,
          createTime: mockNow - 1000 * 60 * 240,
          detailsRaw: JSON.stringify({
            valueKg: 7.3,
            method: 'naked',
          }),
        },
      ])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError(null)

    const init = async () => {
      try {
        const params = new URLSearchParams(location.search)
        const skipOnboarding = params.get('skipOnboarding') === '1'

        const s = await callNative('baby.getSettings')

        if (!s?.birthday && !skipOnboarding) {
          navigate('/habit/baby/onboarding', { replace: true })
          return
        }

        setSettings(s || {})

        const today = new Date()
        const startDate = formatDate(today)
        const endDate = formatDate(today)
        // 约定：baby.getRecords({ startDate, endDate }) 返回 { records: [{ type, createTime, details }] }
        const res = await callNative('baby.getRecords', { startDate, endDate })
        const list = Array.isArray(res?.records) ? res.records : []
        const mapped = list.map((r) => ({
          id: r.id || r.recordId || null,
          type: r.type,
          createTime: r.createTime,
          detailsRaw: r.details,
        }))
        // 按时间倒序
        mapped.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
        setRecords(mapped)
      } catch (e) {
        console.error('[BabyManagement] 加载失败:', e)
        setLoadError('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [isInApp, callNative, location.search, navigate])

  const ageLabel = useMemo(
    () => (settings?.birthday ? calcAgeLabel(settings.birthday) : ''),
    [settings],
  )

  const todaySummary = useMemo(() => {
    if (!records.length) {
      return {
        emoji: '👶',
        main: settings?.name ? `${settings.name} 今天的记录` : '宝宝成长',
        sub: '还没有记录，点击下方按钮开始吧',
      }
    }
    const feedingCount = records.filter((r) => r.type === RECORD_TYPES.FEEDING).length
    const sleepCount = records.filter((r) => r.type === RECORD_TYPES.SLEEP).length
    const parts = []
    if (feedingCount) parts.push(`喂奶 ${feedingCount} 次`)
    if (sleepCount) parts.push(`睡眠 ${sleepCount} 段`)
    return {
      emoji: '📈',
      main: settings?.name ? `${settings.name} 今天` : '今日记录',
      sub: parts.join(' · ') || '已记录多条成长数据',
    }
  }, [records, settings])

  const openOnboarding = () => {
    navigate('/habit/baby/onboarding', { replace: false })
  }

  const handleQuickRecord = (type) => {
    setActiveType(type)
    setEditingIndex(null)
    setIsModalOpen(true)
  }

  // 统一的保存逻辑：表单收集好的 details 由这里落盘或追加到本地
  const handleSaveRecord = async (details, options = {}) => {
    if (!activeType) {
      setIsModalOpen(false)
      return
    }

    // 浏览器预览：只在前端内存里追加一条记录
    if (!isInApp) {
      const now = Date.now()
      const mergedDetails = {
        ...details,
        createdFrom: 'web_preview',
      }
      const newRecord = {
        id: options.existingIndex != null ? records[options.existingIndex]?.id || null : `preview-${now}`,
        type: activeType,
        createTime: now,
        detailsRaw: JSON.stringify(mergedDetails),
      }
      setRecords((prev) => {
        if (options.existingIndex != null && options.existingIndex >= 0 && options.existingIndex < prev.length) {
          const copy = [...prev]
          copy[options.existingIndex] = newRecord
          return copy
        }
        return [newRecord, ...prev]
      })
      setIsModalOpen(false)
      return
    }

    // App 内：调用原生保存
    try {
      await showLoading('保存中...')
      const saveDetails = {
        ...details,
        createdFrom: 'baby_management',
      }
      await callNative('baby.save', {
        recordId: options.recordId || null,
        type: activeType,
        date: formatDate(selectedDate),
        details: JSON.stringify(saveDetails),
      })
      await hideLoading()
      await showToast('已记录')
      setIsModalOpen(false)

      // 重新加载当日记录
      const startDate = formatDate(selectedDate)
      const endDate = formatDate(selectedDate)
      const res = await callNative('baby.getRecords', { startDate, endDate })
      const list = Array.isArray(res?.records) ? res.records : []
      const mapped = list.map((r) => ({
        id: r.id || r.recordId || null,
        type: r.type,
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
        await callNative('baby.delete', { recordId: target.id })
      } else {
        // 兜底：如果后端暂时没有 id，可以用日期+类型删当日对应记录（需要原生实现兼容）
        await callNative('baby.delete', {
          date: formatDate(selectedDate),
          type: target.type,
        })
      }
      await hideLoading()
      await showToast('已删除')
      setIsModalOpen(false)

      const startDate = formatDate(selectedDate)
      const endDate = formatDate(selectedDate)
      const res = await callNative('baby.getRecords', { startDate, endDate })
      const list = Array.isArray(res?.records) ? res.records : []
      const mapped = list.map((r) => ({
        id: r.id || r.recordId || null,
        type: r.type,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* 错误提示 */}
      {loadError && (
        <div className="px-4 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-yellow-800 font-medium">{loadError}</p>
              <p className="text-xs text-yellow-600 mt-1">
                页面将显示基本功能，部分数据可能无法加载
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 顶部状态区 */}
      <div className="relative overflow-hidden">
        <div
          className="px-6 pt-6 pb-8 relative z-10"
          style={{ background: 'linear-gradient(135deg, #FDBA74 0%, #FB7185 100%)' }}
        >
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                  <span>👶</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">
                      {settings?.name || '小宝贝'}
                    </span>
                    {ageLabel && (
                      <span className="px-2 py-[2px] rounded-full bg-white/20 text-[10px]">
                        {ageLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    {settings?.birthday
                      ? `生日：${settings.birthday}`
                      : '建议先补充基本信息，统计会更准确'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-2xl">{todaySummary.emoji}</span>
                <div>
                  <div className="text-base font-semibold">{todaySummary.main}</div>
                  <div className="text-xs text-white/80">{todaySummary.sub}</div>
                </div>
              </div>
            </div>
            <button
              onClick={openOnboarding}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm text-lg"
            >
              ⚙️
            </button>
          </div>

          {/* 快捷操作 */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: '🍼', label: '喂奶', type: RECORD_TYPES.FEEDING },
              { icon: '😴', label: '睡眠', type: RECORD_TYPES.SLEEP },
              { icon: '🌡', label: '体温', type: RECORD_TYPES.TEMPERATURE },
              { icon: '💉', label: '疫苗', type: RECORD_TYPES.VACCINE },
              { icon: '📏', label: '身高', type: RECORD_TYPES.HEIGHT },
              { icon: '⚖️', label: '体重', type: RECORD_TYPES.WEIGHT },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleQuickRecord(item.type)}
                className="py-3 rounded-2xl bg-gradient-to-br from-white/30 to-white/20 text-white text-xs font-medium flex flex-col items-center justify-center active:scale-95 transition-transform backdrop-blur-sm shadow-sm border border-white/10"
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 装饰圆形 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      {/* 日期选择 + 时间线 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="font-semibold text-gray-800">当天记录</span>
            </div>
            <input
              type="date"
              value={formatDate(selectedDate)}
              onChange={async (e) => {
                const d = e.target.value ? new Date(e.target.value) : new Date()
                setSelectedDate(d)
                if (!isInApp) return
                try {
                  const startDate = formatDate(d)
                  const endDate = formatDate(d)
                  const res = await callNative('baby.getRecords', { startDate, endDate })
                  const list = Array.isArray(res?.records) ? res.records : []
                  const mapped = list.map((r) => ({
                    type: r.type,
                    createTime: r.createTime,
                    detailsRaw: r.details,
                  }))
                  mapped.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
                  setRecords(mapped)
                } catch (err) {
                  console.error('[BabyManagement] 切换日期加载失败:', err)
                  setRecords([])
                }
              }}
              className="px-3 py-1.5 bg-gray-50 rounded-xl text-xs border border-gray-200"
            />
          </div>

          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              这一天还没有记录，点击上方按钮开始吧
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r, idx) => {
                const info = renderRecordSummary(r)
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer active:scale-98"
                    onClick={() => {
                      setActiveType(r.type)
                      setEditingIndex(idx)
                      setIsModalOpen(true)
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-2xl shadow-sm text-white flex-shrink-0">
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
                          宝宝成长
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

      <div className="h-6" />

      {/* 记录编辑弹窗（根据 activeType 切换不同表单） */}
      {isModalOpen && (
        <RecordModal
          type={activeType}
          selectedDate={selectedDate}
          existingRecord={editingIndex != null ? records[editingIndex] : null}
          onClose={() => setIsModalOpen(false)}
          onSave={(details) =>
            handleSaveRecord(details, {
              existingIndex: editingIndex,
              recordId: editingIndex != null ? records[editingIndex]?.id : null,
            })
          }
          onDelete={
            editingIndex != null ? () => handleDeleteRecord(editingIndex) : null
          }
        />
      )}
    </div>
  )
}

// 具体记录表单弹窗组件
const RecordModal = ({ type, selectedDate, existingRecord, onClose, onSave, onDelete }) => {
  const [feedingBrand, setFeedingBrand] = useState('默认品牌奶粉')
  const [feedingTime, setFeedingTime] = useState('')
  const [feedingAmount, setFeedingAmount] = useState('')
  const [feedingMode, setFeedingMode] = useState('formula') // breast | formula | mixed
  const [feedingPrice, setFeedingPrice] = useState('0')
  const [feedingNote, setFeedingNote] = useState('')

  const [sleepStart, setSleepStart] = useState('')
  const [sleepEnd, setSleepEnd] = useState('')
  const [sleepType, setSleepType] = useState('nap')
  const [sleepNote, setSleepNote] = useState('')

  const [tempTime, setTempTime] = useState('')
  const [tempValue, setTempValue] = useState('')
  const [tempMethod, setTempMethod] = useState('armpit')
  const [tempMedication, setTempMedication] = useState('')
  const [tempNote, setTempNote] = useState('')

  const [vaccineName, setVaccineName] = useState('')
  const [vaccineDose, setVaccineDose] = useState('')
  const [vaccineHospital, setVaccineHospital] = useState('')
  const [vaccineCost, setVaccineCost] = useState('')
  const [vaccineReaction, setVaccineReaction] = useState('')

  const [heightValue, setHeightValue] = useState('')
  const [heightMethod, setHeightMethod] = useState('lying')
  const [heightNote, setHeightNote] = useState('')

  const [weightValue, setWeightValue] = useState('')
  const [weightMethod, setWeightMethod] = useState('naked')
  const [weightNote, setWeightNote] = useState('')

  const dateStr = formatDate(selectedDate)

  // 如果有已有记录，预填字段
  useEffect(() => {
    if (!existingRecord) {
      const now = new Date()
      const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`
      setFeedingTime(defaultTime)
      setTempTime(defaultTime)
      return
    }
    let details = {}
    try {
      details = existingRecord.detailsRaw
        ? JSON.parse(existingRecord.detailsRaw)
        : {}
    } catch {
      details = {}
    }
    if (existingRecord.type === RECORD_TYPES.FEEDING) {
      setFeedingTime(details.time || defaultTimeForEdit())
      setFeedingMode(details.mode || 'formula')
      setFeedingAmount(
        typeof details.amountMl === 'number' ? String(details.amountMl) : '',
      )
      setFeedingBrand(details.brand || '默认品牌奶粉')
      setFeedingPrice(
        typeof details.pricePerKg === 'number' ? String(details.pricePerKg) : '0',
      )
      setFeedingNote(details.note || '')
    }
    if (existingRecord.type === RECORD_TYPES.SLEEP) {
      setSleepStart(details.startTime || '')
      setSleepEnd(details.endTime || '')
      setSleepType(details.sleepType || 'nap')
      setSleepNote(details.note || '')
    }
    if (existingRecord.type === RECORD_TYPES.TEMPERATURE) {
      setTempTime(details.time || defaultTimeForEdit())
      setTempValue(
        typeof details.value === 'number' ? String(details.value) : '',
      )
      setTempMethod(details.method || 'armpit')
      setTempMedication(details.medicationName || '')
      setTempNote(details.note || '')
    }
    if (existingRecord.type === RECORD_TYPES.VACCINE) {
      setVaccineName(details.name || '')
      setVaccineDose(details.dose || '')
      setVaccineHospital(details.hospital || '')
      setVaccineCost(
        typeof details.cost === 'number' ? String(details.cost) : '',
      )
      setVaccineReaction(details.reaction || '')
    }
    if (existingRecord.type === RECORD_TYPES.HEIGHT) {
      setHeightValue(
        typeof details.valueCm === 'number' ? String(details.valueCm) : '',
      )
      setHeightMethod(details.method || 'lying')
      setHeightNote(details.note || '')
    }
    if (existingRecord.type === RECORD_TYPES.WEIGHT) {
      setWeightValue(
        typeof details.valueKg === 'number' ? String(details.valueKg) : '',
      )
      setWeightMethod(details.method || 'naked')
      setWeightNote(details.note || '')
    }
  }, [existingRecord])

  const defaultTimeForEdit = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`
  }

  const handleSave = () => {
    if (type === RECORD_TYPES.FEEDING) {
      const amount = Number(feedingAmount) || 0
      const price = Number(feedingPrice) || 0
      const totalCost = amount > 0 && price > 0 ? (amount / 1000) * price : 0
      onSave({
        mode: feedingMode,
        time: feedingTime,
        amountMl: amount || null,
        brand: feedingBrand || null,
        pricePerKg: price || null,
        totalCost: totalCost || null,
        note: feedingNote || null,
        date: dateStr,
      })
      return
    }

    if (type === RECORD_TYPES.SLEEP) {
      const durationMinutes =
        sleepStart && sleepEnd
          ? (() => {
              const [sh, sm] = sleepStart.split(':').map(Number)
              const [eh, em] = sleepEnd.split(':').map(Number)
              if (
                Number.isNaN(sh) ||
                Number.isNaN(sm) ||
                Number.isNaN(eh) ||
                Number.isNaN(em)
              ) {
                return null
              }
              const start = new Date()
              start.setHours(sh, sm, 0, 0)
              const end = new Date()
              end.setHours(eh, em, 0, 0)
              if (end <= start) end.setDate(end.getDate() + 1)
              return Math.round((end - start) / 60000)
            })()
          : null
      onSave({
        sleepType,
        startTime: sleepStart || null,
        endTime: sleepEnd || null,
        durationMinutes: durationMinutes || null,
        note: sleepNote || null,
        date: dateStr,
      })
      return
    }

    if (type === RECORD_TYPES.TEMPERATURE) {
      onSave({
        time: tempTime || null,
        value: tempValue ? Number(tempValue) : null,
        method: tempMethod || null,
        medicationName: tempMedication || null,
        note: tempNote || null,
        date: dateStr,
      })
      return
    }

    if (type === RECORD_TYPES.VACCINE) {
      onSave({
        name: vaccineName || null,
        dose: vaccineDose || null,
        hospital: vaccineHospital || null,
        cost: vaccineCost ? Number(vaccineCost) : null,
        reaction: vaccineReaction || null,
        date: dateStr,
      })
      return
    }

    if (type === RECORD_TYPES.HEIGHT) {
      onSave({
        valueCm: heightValue ? Number(heightValue) : null,
        method: heightMethod || null,
        note: heightNote || null,
        date: dateStr,
      })
      return
    }

    if (type === RECORD_TYPES.WEIGHT) {
      onSave({
        valueKg: weightValue ? Number(weightValue) : null,
        method: weightMethod || null,
        note: weightNote || null,
        date: dateStr,
      })
      return
    }

    onClose()
  }

  const titleMap = {
    [RECORD_TYPES.FEEDING]: '记录喂奶',
    [RECORD_TYPES.SLEEP]: '记录睡眠',
    [RECORD_TYPES.TEMPERATURE]: '记录体温',
    [RECORD_TYPES.VACCINE]: '记录疫苗',
    [RECORD_TYPES.HEIGHT]: '记录身高',
    [RECORD_TYPES.WEIGHT]: '记录体重',
  }

  const title = titleMap[type] || '记录'

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 text-sm">
            取消
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">{dateStr}</span>
            <span className="font-bold text-gray-800 text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button onClick={onDelete} className="text-red-500 font-medium text-sm">
                删除
              </button>
            )}
            <button
              onClick={handleSave}
              className="text-orange-500 font-medium text-sm"
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {type === RECORD_TYPES.FEEDING && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">时间</span>
                  <input
                    type="time"
                    value={feedingTime}
                    onChange={(e) => setFeedingTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    喂奶方式
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'breast', label: '母乳' },
                      { value: 'formula', label: '配方奶' },
                      { value: 'mixed', label: '混合' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFeedingMode(opt.value)}
                        className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                          feedingMode === opt.value
                            ? 'bg-orange-500 text-white border-transparent'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    奶量（ml）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={feedingAmount}
                    onChange={(e) => setFeedingAmount(e.target.value)}
                    placeholder="例如 120"
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    奶粉品牌（可选）
                  </label>
                  <input
                    type="text"
                    value={feedingBrand}
                    onChange={(e) => setFeedingBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    奶粉单价（元 / kg，可选）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={feedingPrice}
                    onChange={(e) => setFeedingPrice(e.target.value)}
                    placeholder="用于估算本次喂奶成本"
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注（可选）
                  </label>
                  <textarea
                    rows={2}
                    value={feedingNote}
                    onChange={(e) => setFeedingNote(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                    placeholder="例如：喝得很快，打嗝后吐了一点"
                  />
                </div>
              </div>
            </>
          )}

          {type === RECORD_TYPES.SLEEP && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">睡觉</span>
                <input
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">起床</span>
                <input
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'nap', label: '白天小睡' },
                    { value: 'night', label: '夜间睡眠' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSleepType(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        sleepType === opt.value
                          ? 'bg-orange-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  rows={2}
                  value={sleepNote}
                  onChange={(e) => setSleepNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="例如：入睡前哭闹，半夜醒了一次"
                />
              </div>
            </div>
          )}

          {type === RECORD_TYPES.TEMPERATURE && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">时间</span>
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体温（℃）
                </label>
                <input
                  type="number"
                  min="34"
                  max="42"
                  step="0.1"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测量方式
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'armpit', label: '腋下' },
                    { value: 'ear', label: '耳温' },
                    { value: 'forehead', label: '额温' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTempMethod(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        tempMethod === opt.value
                          ? 'bg-orange-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用药情况（可选）
                </label>
                <input
                  type="text"
                  value={tempMedication}
                  onChange={(e) => setTempMedication(e.target.value)}
                  placeholder="例如：已吃退烧药，5ml"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  rows={2}
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="例如：精神一般，有点食欲差"
                />
              </div>
            </div>
          )}

          {type === RECORD_TYPES.VACCINE && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  疫苗名称
                </label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="例如：五联疫苗"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  剂次（可选）
                </label>
                <input
                  type="text"
                  value={vaccineDose}
                  onChange={(e) => setVaccineDose(e.target.value)}
                  placeholder="例如：第 2 针"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  医疗机构（可选）
                </label>
                <input
                  type="text"
                  value={vaccineHospital}
                  onChange={(e) => setVaccineHospital(e.target.value)}
                  placeholder="例如：XX 社区医院"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  费用（元，可选）
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={vaccineCost}
                  onChange={(e) => setVaccineCost(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  不良反应（可选）
                </label>
                <textarea
                  rows={2}
                  value={vaccineReaction}
                  onChange={(e) => setVaccineReaction(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="例如：接种处红肿，低烧"
                />
              </div>
            </div>
          )}

          {type === RECORD_TYPES.HEIGHT && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  身高（cm）
                </label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  step="0.1"
                  value={heightValue}
                  onChange={(e) => setHeightValue(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测量方式
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'lying', label: '躺量' },
                    { value: 'standing', label: '站量' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeightMethod(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        heightMethod === opt.value
                          ? 'bg-orange-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  rows={2}
                  value={heightNote}
                  onChange={(e) => setHeightNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="例如：宝宝有点扭动，数据略有误差"
                />
              </div>
            </div>
          )}

          {type === RECORD_TYPES.WEIGHT && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体重（kg）
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="0.01"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测量方式
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'naked', label: '裸重' },
                    { value: 'clothes', label: '穿衣' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWeightMethod(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        weightMethod === opt.value
                          ? 'bg-orange-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  rows={2}
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                  placeholder="例如：饭后称重，比空腹略高"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

