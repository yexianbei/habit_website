import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { useNativeBridge } from '../../utils/useNativeBridge'

const BODY_TYPE = 19

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const parseNumber = (v) => {
  const n = typeof v === 'string' ? v.trim() : v
  if (n === '' || n === null || n === undefined) return null
  const num = Number(n)
  return Number.isFinite(num) ? num : null
}

export default function BodyManagement() {
  const { isInApp, setTitle, showToast, showLoading, hideLoading, getHabitList, checkIn, getCheckInRecords } = useNativeBridge()
  const [habitId, setHabitId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loadingHabit, setLoadingHabit] = useState(true)
  const [measure, setMeasure] = useState({
    neck: '', shoulder: '', chest: '',
    armLeft: '', armRight: '', forearmLeft: '', forearmRight: '',
    waist: '', hip: '',
    thighLeft: '', thighRight: '', calfLeft: '', calfRight: '',
    weight: '', targetWeight: '', bodyFat: ''
  })
  const [latestForDay, setLatestForDay] = useState(null)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const pageTitle = '身体数据'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    if (!isInApp) {
      setLoadingHabit(false)
      return
    }
    const init = async () => {
      try {
        setLoadingHabit(true)
        const result = await getHabitList({ type: BODY_TYPE })
        const id = result?.habits?.[0]?.habitId || result?.habits?.[0]?.id || null
        setHabitId(id)
      } catch (e) {
        console.error('[BodyManagement] 获取习惯失败:', e)
      } finally {
        setLoadingHabit(false)
      }
    }
    init()
  }, [isInApp])

  const loadDayRecord = useCallback(async () => {
    if (!isInApp || !habitId) return
    const day = formatDate(selectedDate)
    try {
      const res = await getCheckInRecords(habitId, day, day)
      const records = Array.isArray(res?.records) ? res.records : []
      const r = records.find(x => formatDate(new Date(x.createTime)) === day) || null
      if (r?.signUpId) {
        try {
          const d = JSON.parse(r.signUpId)
          setLatestForDay(d)
        } catch (_) {
          setLatestForDay(null)
        }
      } else {
        setLatestForDay(null)
      }
    } catch (e) {
      console.error('[BodyManagement] 加载当天记录失败:', e)
      setLatestForDay(null)
    }
  }, [isInApp, habitId, selectedDate])

  useEffect(() => {
    if (habitId) loadDayRecord()
  }, [habitId, selectedDate, loadDayRecord])

  useEffect(() => {
    if (latestForDay) {
      setMeasure(m => {
        const next = { ...m }
        Object.keys(next).forEach(k => {
          const v = latestForDay[k]
          next[k] = v === null || v === undefined ? '' : String(v)
        })
        return next
      })
    }
  }, [latestForDay])

  const handleSave = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (!habitId) {
      await showToast('请先添加身体数据习惯')
      return
    }
    const details = {
      neck: parseNumber(measure.neck),
      shoulder: parseNumber(measure.shoulder),
      chest: parseNumber(measure.chest),
      armLeft: parseNumber(measure.armLeft),
      armRight: parseNumber(measure.armRight),
      forearmLeft: parseNumber(measure.forearmLeft),
      forearmRight: parseNumber(measure.forearmRight),
      waist: parseNumber(measure.waist),
      hip: parseNumber(measure.hip),
      thighLeft: parseNumber(measure.thighLeft),
      thighRight: parseNumber(measure.thighRight),
      calfLeft: parseNumber(measure.calfLeft),
      calfRight: parseNumber(measure.calfRight),
      weight: parseNumber(measure.weight),
      targetWeight: parseNumber(measure.targetWeight),
      bodyFat: parseNumber(measure.bodyFat),
    }
    try {
      await showLoading('保存中...')
      await checkIn(habitId, {
        date: formatDate(selectedDate),
        signUpId: JSON.stringify(details),
      })
      await hideLoading()
      await showToast('保存成功')
      await loadDayRecord()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }

  const statusCard = useMemo(() => {
    const w = latestForDay?.weight
    const bf = latestForDay?.bodyFat
    if (w && bf) return { emoji: '💪', main: `${w} kg`, sub: `体脂率 ${bf}%` }
    if (w) return { emoji: '🧍', main: `${w} kg`, sub: '今日体重' }
    if (bf) return { emoji: '🧪', main: `${bf}%`, sub: '今日体脂率' }
    return { emoji: '🧍', main: '身体数据', sub: '记录尺寸与体重' }
  }, [latestForDay])

  const scrollToRecord = () => {
    const el = document.getElementById('body-record-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSelectedDate(new Date())
  }

  const val = (k, unit = 'cm') => {
    const v = latestForDay?.[k]
    if (v === null || v === undefined || v === '') return '--'
    if (k === 'weight' || k === 'targetWeight') return `${v} kg`
    if (k === 'bodyFat') return `${v}%`
    return `${v} ${unit}`
  }
  const nameMap = {
    neck: '脖围', shoulder: '肩宽', chest: '胸围',
    armLeft: '左臂围', armRight: '右臂围', forearmLeft: '左小臂', forearmRight: '右小臂',
    waist: '腰围', hip: '臀围',
    thighLeft: '左腿围', thighRight: '右腿围', calfLeft: '左小腿', calfRight: '右小腿',
    weight: '体重', targetWeight: '目标体重', bodyFat: '体脂率'
  }
  const unitOf = (k) => {
    if (k === 'weight' || k === 'targetWeight') return 'kg'
    if (k === 'bodyFat') return '%'
    return 'cm'
  }
  const openEdit = (field) => {
    setEditField(field)
    const v = latestForDay?.[field]
    const current = v === null || v === undefined ? measure[field] : v
    setEditValue(current === null || current === undefined ? '' : String(current))
  }
  const closeEdit = () => {
    setEditField(null)
    setEditValue('')
  }
  const saveEdit = async () => {
    setMeasure(m => ({ ...m, [editField]: editValue }))
    await handleSave()
    closeEdit()
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-sky-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400 to-sky-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-200">
            <span className="text-5xl">🧍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">身体数据</h1>
          <p className="text-gray-500 mb-6">请在小习惯 App 内使用</p>
          <a href="https://apps.apple.com/app/id1455083310" 
             className="inline-block px-8 py-3 bg-gradient-to-r from-teal-400 to-sky-400 text-white rounded-xl font-medium shadow-lg shadow-teal-200">
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  if (loadingHabit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-sky-50">
      <div 
        className="px-6 pt-6 pb-8 relative z-10"
        style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #38BDF8 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{statusCard.emoji}</span>
              <span className="text-4xl font-bold">{statusCard.main}</span>
            </div>
            <p className="text-white/80 text-sm">{statusCard.sub}</p>
          </div>
          <div className="flex items-center gap-2">
            {habitId && (
              <button
                onClick={deleteHabit}
                disabled={isDeleting}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-50"
                title="删除习惯"
              >
                🗑️
              </button>
            )}
            {!habitId && (
              <a 
                href="/habit/body/intro"
                className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm backdrop-blur-sm"
              >
                添加习惯
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => scrollToRecord()}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-sm text-white font-medium active:scale-95 transition-transform"
          >
            记数据
          </button>
        </div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">🧍</span>
            人体模型标注
          </h3>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-100">
            <svg viewBox="0 0 300 520" className="w-full h-[420px]">
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E0F2FE" />
                  <stop offset="100%" stopColor="#D1FAE5" />
                </linearGradient>
              </defs>
              <circle cx="150" cy="70" r="34" fill="url(#bodyGrad)" stroke="#93C5FD" strokeWidth="2" />
              <path d="M130,100 C120,110 115,125 115,140 L115,205 C115,225 125,245 150,245 C175,245 185,225 185,205 L185,140 C185,125 180,110 170,100 Z" fill="url(#bodyGrad)" stroke="#34D399" strokeWidth="2" />
              <path d="M115,145 C100,155 90,175 85,195 L82,220 C81,228 86,235 93,236 C100,237 106,231 108,224 L115,200 Z" fill="#A7F3D0" stroke="#10B981" strokeWidth="1.5" />
              <path d="M185,145 C200,155 210,175 215,195 L218,220 C219,228 214,235 207,236 C200,237 194,231 192,224 L185,200 Z" fill="#A7F3D0" stroke="#10B981" strokeWidth="1.5" />
              <path d="M120,260 C120,270 125,280 135,290 L140,300 C145,308 145,318 140,325 L128,345 C122,354 122,366 128,375 L138,392 C143,400 143,410 138,418 L128,435 C123,442 123,452 128,459 L136,470" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
              <path d="M180,260 C180,270 175,280 165,290 L160,300 C155,308 155,318 160,325 L172,345 C178,354 178,366 172,375 L162,392 C157,400 157,410 162,418 L172,435 C177,442 177,452 172,459 L164,470" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
              <g onClick={() => openEdit('neck')} className="cursor-pointer">
                <circle cx="150" cy="40" r="4" fill="#14B8A6" />
                <text x="150" y="36" textAnchor="middle" className="fill-teal-700 text-[12px]">{nameMap.neck} {val('neck')}</text>
              </g>
              <g onClick={() => openEdit('shoulder')} className="cursor-pointer">
                <circle cx="150" cy="100" r="4" fill="#14B8A6" />
                <text x="150" y="96" textAnchor="middle" className="fill-teal-700 text-[12px]">{nameMap.shoulder} {val('shoulder')}</text>
              </g>
              <g onClick={() => openEdit('chest')} className="cursor-pointer">
                <circle cx="150" cy="150" r="4" fill="#14B8A6" />
                <text x="150" y="146" textAnchor="middle" className="fill-teal-700 text-[12px]">{nameMap.chest} {val('chest')}</text>
              </g>
              <g onClick={() => openEdit('armLeft')} className="cursor-pointer">
                <circle cx="78" cy="150" r="4" fill="#14B8A6" />
                <text x="74" y="146" textAnchor="end" className="fill-teal-700 text-[12px]">{nameMap.armLeft} {val('armLeft')}</text>
              </g>
              <g onClick={() => openEdit('armRight')} className="cursor-pointer">
                <circle cx="222" cy="150" r="4" fill="#14B8A6" />
                <text x="226" y="146" textAnchor="start" className="fill-teal-700 text-[12px]">{nameMap.armRight} {val('armRight')}</text>
              </g>
              <g onClick={() => openEdit('forearmLeft')} className="cursor-pointer">
                <circle cx="78" cy="185" r="4" fill="#14B8A6" />
                <text x="74" y="181" textAnchor="end" className="fill-teal-700 text-[12px]">{nameMap.forearmLeft} {val('forearmLeft')}</text>
              </g>
              <g onClick={() => openEdit('forearmRight')} className="cursor-pointer">
                <circle cx="222" cy="185" r="4" fill="#14B8A6" />
                <text x="226" y="181" textAnchor="start" className="fill-teal-700 text-[12px]">{nameMap.forearmRight} {val('forearmRight')}</text>
              </g>
              <g onClick={() => openEdit('waist')} className="cursor-pointer">
                <circle cx="150" cy="240" r="4" fill="#14B8A6" />
                <text x="150" y="236" textAnchor="middle" className="fill-teal-700 text-[12px]">{nameMap.waist} {val('waist')}</text>
              </g>
              <g onClick={() => openEdit('hip')} className="cursor-pointer">
                <circle cx="150" cy="270" r="4" fill="#14B8A6" />
                <text x="150" y="266" textAnchor="middle" className="fill-teal-700 text-[12px]">{nameMap.hip} {val('hip')}</text>
              </g>
              <g onClick={() => openEdit('thighLeft')} className="cursor-pointer">
                <circle cx="120" cy="360" r="4" fill="#14B8A6" />
                <text x="116" y="356" textAnchor="end" className="fill-teal-700 text-[12px]">{nameMap.thighLeft} {val('thighLeft')}</text>
              </g>
              <g onClick={() => openEdit('thighRight')} className="cursor-pointer">
                <circle cx="180" cy="360" r="4" fill="#14B8A6" />
                <text x="184" y="356" textAnchor="start" className="fill-teal-700 text-[12px]">{nameMap.thighRight} {val('thighRight')}</text>
              </g>
              <g onClick={() => openEdit('calfLeft')} className="cursor-pointer">
                <circle cx="120" cy="440" r="4" fill="#14B8A6" />
                <text x="116" y="436" textAnchor="end" className="fill-teal-700 text-[12px]">{nameMap.calfLeft} {val('calfLeft')}</text>
              </g>
              <g onClick={() => openEdit('calfRight')} className="cursor-pointer">
                <circle cx="180" cy="440" r="4" fill="#14B8A6" />
                <text x="184" y="436" textAnchor="start" className="fill-teal-700 text-[12px]">{nameMap.calfRight} {val('calfRight')}</text>
              </g>
              <text x="150" y="505" textAnchor="middle" className="fill-teal-700 text-[12px]">{val('weight', 'kg')} / {val('targetWeight', 'kg')} · {val('bodyFat', '%')}</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 pb-8" id="body-record-card">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📝</span>
            今日数据记录
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">日期</span>
              <input 
                type="date" 
                value={formatDate(selectedDate)} 
                onChange={e => setSelectedDate(new Date(e.target.value))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <InputRow label="脖围" value={measure.neck} onChange={v => setMeasure(m => ({ ...m, neck: v }))} />
                <InputRow label="肩宽" value={measure.shoulder} onChange={v => setMeasure(m => ({ ...m, shoulder: v }))} />
                <InputRow label="胸围" value={measure.chest} onChange={v => setMeasure(m => ({ ...m, chest: v }))} />
                <InputRow label="左臂围" value={measure.armLeft} onChange={v => setMeasure(m => ({ ...m, armLeft: v }))} />
                <InputRow label="右臂围" value={measure.armRight} onChange={v => setMeasure(m => ({ ...m, armRight: v }))} />
                <InputRow label="左小臂" value={measure.forearmLeft} onChange={v => setMeasure(m => ({ ...m, forearmLeft: v }))} />
                <InputRow label="右小臂" value={measure.forearmRight} onChange={v => setMeasure(m => ({ ...m, forearmRight: v }))} />
              </div>
              <div className="space-y-3">
                <InputRow label="腰围" value={measure.waist} onChange={v => setMeasure(m => ({ ...m, waist: v }))} />
                <InputRow label="臀围" value={measure.hip} onChange={v => setMeasure(m => ({ ...m, hip: v }))} />
                <InputRow label="左腿围" value={measure.thighLeft} onChange={v => setMeasure(m => ({ ...m, thighLeft: v }))} />
                <InputRow label="右腿围" value={measure.thighRight} onChange={v => setMeasure(m => ({ ...m, thighRight: v }))} />
                <InputRow label="左小腿" value={measure.calfLeft} onChange={v => setMeasure(m => ({ ...m, calfLeft: v }))} />
                <InputRow label="右小腿" value={measure.calfRight} onChange={v => setMeasure(m => ({ ...m, calfRight: v }))} />
                <InputRow label="体脂率(%)" value={measure.bodyFat} onChange={v => setMeasure(m => ({ ...m, bodyFat: v }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputRow label="体重(kg)" value={measure.weight} onChange={v => setMeasure(m => ({ ...m, weight: v }))} />
              <InputRow label="目标体重(kg)" value={measure.targetWeight} onChange={v => setMeasure(m => ({ ...m, targetWeight: v }))} />
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSave}
                className="w-full py-3 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 text-white font-medium active:scale-95 transition-transform"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
      {editField && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={closeEdit}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <button onClick={closeEdit} className="text-gray-400 text-sm">取消</button>
              <span className="font-bold text-gray-800">{nameMap[editField]}</span>
              <button onClick={saveEdit} className="text-teal-600 font-medium text-sm">保存</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">数值</span>
                <input 
                  type="number"
                  inputMode="decimal"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                />
                <span className="text-xs text-gray-400">{unitOf(editField)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InputRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-28">{label}</span>
      <input 
        type="number" 
        inputMode="decimal"
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder="数值"
        className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
      />
      <span className="text-xs text-gray-400">{label.includes('kg') || label.includes('体重') ? 'kg' : label.includes('%') ? '%' : 'cm'}</span>
    </div>
  )
}
