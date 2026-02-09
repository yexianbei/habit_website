/**
 * 健康数据记录弹窗组件
 * 支持血糖、血压、血脂三种类型的记录
 */
import React, { useEffect, useState } from 'react'
import { formatDate, METRIC_TYPES, parseDetails } from '../utils'

export default function HealthDataModal({
  selectedDate,
  existingRecord,
  defaultMetricType = METRIC_TYPES.GLUCOSE,
  onClose,
  onSave,
  onDelete,
}) {
  const [metricType, setMetricType] = useState(defaultMetricType)
  const [time, setTime] = useState('')

  // 血糖字段
  const [glucoseValue, setGlucoseValue] = useState('')
  const [glucoseScene, setGlucoseScene] = useState('fasting')
  const [glucoseMeal, setGlucoseMeal] = useState('breakfast')
  const [glucoseMeds, setGlucoseMeds] = useState('')

  // 血压字段
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [bpHeartRate, setBpHeartRate] = useState('')
  const [bpScene, setBpScene] = useState('rest')

  // 血脂字段
  const [lipidTc, setLipidTc] = useState('')
  const [lipidTg, setLipidTg] = useState('')
  const [lipidHdl, setLipidHdl] = useState('')
  const [lipidLdl, setLipidLdl] = useState('')
  const [lipidScene, setLipidScene] = useState('fasting')

  // 通用字段
  const [note, setNote] = useState('')

  const dateStr = formatDate(selectedDate)

  useEffect(() => {
    const now = new Date()
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`

    if (!existingRecord) {
      setTime(defaultTime)
      setMetricType(defaultMetricType)
      return
    }

    const details = parseDetails(existingRecord.detailsRaw)
    const type = details.metricType || defaultMetricType
    setMetricType(type)
    setTime(details.time || defaultTime)
    setNote(details.note || '')

    if (type === METRIC_TYPES.GLUCOSE) {
      setGlucoseValue(typeof details.value === 'number' ? String(details.value) : '')
      setGlucoseScene(details.scene || 'fasting')
      setGlucoseMeal(details.meal || 'breakfast')
      setGlucoseMeds(details.meds || '')
    } else if (type === METRIC_TYPES.BLOOD_PRESSURE) {
      setBpSystolic(typeof details.systolic === 'number' ? String(details.systolic) : '')
      setBpDiastolic(typeof details.diastolic === 'number' ? String(details.diastolic) : '')
      setBpHeartRate(typeof details.heartRate === 'number' ? String(details.heartRate) : '')
      setBpScene(details.bpScene || 'rest')
    } else if (type === METRIC_TYPES.LIPID) {
      setLipidTc(typeof details.tc === 'number' ? String(details.tc) : '')
      setLipidTg(typeof details.tg === 'number' ? String(details.tg) : '')
      setLipidHdl(typeof details.hdl === 'number' ? String(details.hdl) : '')
      setLipidLdl(typeof details.ldl === 'number' ? String(details.ldl) : '')
      setLipidScene(details.lipidScene || 'fasting')
    }
  }, [existingRecord, defaultMetricType])

  const handleSave = () => {
    const baseData = {
      metricType,
      time,
      date: dateStr,
      note: note || null,
    }

    if (metricType === METRIC_TYPES.GLUCOSE) {
      onSave({
        ...baseData,
        value: glucoseValue ? Number(glucoseValue) : null,
        scene: glucoseScene,
        meal: glucoseMeal,
        meds: glucoseMeds || null,
      })
    } else if (metricType === METRIC_TYPES.BLOOD_PRESSURE) {
      onSave({
        ...baseData,
        systolic: bpSystolic ? Number(bpSystolic) : null,
        diastolic: bpDiastolic ? Number(bpDiastolic) : null,
        heartRate: bpHeartRate ? Number(bpHeartRate) : null,
        bpScene,
      })
    } else if (metricType === METRIC_TYPES.LIPID) {
      onSave({
        ...baseData,
        tc: lipidTc ? Number(lipidTc) : null,
        tg: lipidTg ? Number(lipidTg) : null,
        hdl: lipidHdl ? Number(lipidHdl) : null,
        ldl: lipidLdl ? Number(lipidLdl) : null,
        lipidScene,
      })
    }
  }

  const getTitle = () => {
    if (metricType === METRIC_TYPES.GLUCOSE) return '记录血糖'
    if (metricType === METRIC_TYPES.BLOOD_PRESSURE) return '记录血压'
    if (metricType === METRIC_TYPES.LIPID) return '记录血脂'
    return '记录健康数据'
  }

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
            <span className="font-bold text-gray-800 text-sm">{getTitle()}</span>
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button onClick={onDelete} className="text-red-500 font-medium text-sm">
                删除
              </button>
            )}
            <button onClick={handleSave} className="text-rose-500 font-medium text-sm">
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 记录类型选择（仅新建时显示） */}
          {!existingRecord && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                记录类型
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: METRIC_TYPES.GLUCOSE, label: '🩸 血糖', icon: '🩸' },
                  { value: METRIC_TYPES.BLOOD_PRESSURE, label: '💓 血压', icon: '💓' },
                  { value: METRIC_TYPES.LIPID, label: '🧬 血脂', icon: '🧬' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMetricType(opt.value)}
                    className={`px-3 py-2 rounded-2xl text-sm border ${
                      metricType === opt.value
                        ? 'bg-rose-500 text-white border-transparent'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 时间 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16">时间</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          {/* 血糖表单 */}
          {metricType === METRIC_TYPES.GLUCOSE && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  血糖值（mmol/L）
                </label>
                <input
                  type="number"
                  min="1"
                  max="33"
                  step="0.1"
                  value={glucoseValue}
                  onChange={(e) => setGlucoseValue(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  placeholder="例如：6.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  场景
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'fasting', label: '空腹' },
                    { value: 'before_meal', label: '餐前' },
                    { value: 'after_meal', label: '餐后' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGlucoseScene(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        glucoseScene === opt.value
                          ? 'bg-rose-500 text-white border-transparent'
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
                  与哪一餐关联
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'breakfast', label: '早餐' },
                    { value: 'lunch', label: '午餐' },
                    { value: 'dinner', label: '晚餐' },
                    { value: 'snack', label: '加餐' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGlucoseMeal(opt.value)}
                      className={`px-2 py-1.5 rounded-2xl text-xs border ${
                        glucoseMeal === opt.value
                          ? 'bg-rose-500 text-white border-transparent'
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
                  value={glucoseMeds}
                  onChange={(e) => setGlucoseMeds(e.target.value)}
                  placeholder="例如：饭前打 6u 胰岛素，或：未用药"
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </>
          )}

          {/* 血压表单 */}
          {metricType === METRIC_TYPES.BLOOD_PRESSURE && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收缩压（高压，mmHg）
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="250"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    舒张压（低压，mmHg）
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  心率（bpm，可选）
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={bpHeartRate}
                  onChange={(e) => setBpHeartRate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                  placeholder="例如：72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  场景
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'rest', label: '静息' },
                    { value: 'morning', label: '晨起' },
                    { value: 'evening', label: '睡前' },
                    { value: 'after_exercise', label: '运动后' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBpScene(opt.value)}
                      className={`px-3 py-2 rounded-2xl text-sm border ${
                        bpScene === opt.value
                          ? 'bg-rose-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 血脂表单 */}
          {metricType === METRIC_TYPES.LIPID && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    总胆固醇 TC（mmol/L）
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={lipidTc}
                    onChange={(e) => setLipidTc(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    甘油三酯 TG（mmol/L）
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={lipidTg}
                    onChange={(e) => setLipidTg(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：1.3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高密度脂蛋白 HDL（mmol/L）
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={lipidHdl}
                    onChange={(e) => setLipidHdl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：1.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    低密度脂蛋白 LDL（mmol/L）
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={lipidLdl}
                    onChange={(e) => setLipidLdl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                    placeholder="例如：2.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  是否空腹
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'fasting', label: '空腹' },
                    { value: 'random', label: '随机' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLipidScene(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm border ${
                        lipidScene === opt.value
                          ? 'bg-rose-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 备注（通用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注（可选）
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
              placeholder="例如：今天运动偏多，饭量比平时少"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
