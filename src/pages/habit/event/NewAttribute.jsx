/**
 * 新建属性 - 按属性类型填写表单项
 * 数值类型：名称*、描述、单位*、默认值、必填
 * 单选/多选类型：名称*、描述、默认值、必填、选项(+ 新增)；多选选项行带删除、眼睛、拖拽图标
 * 文本类型：名称*、类型*(短文本/长文本/链接/统计文本)、描述、默认值、必填
 * 开关类型：名称*、描述、默认值(开关)
 * 评分类型：名称*、描述、默认值(范围1-5)、必填
 * 时间类型：名称*、描述、默认值(日期时间选择)、必填；其他-类型(默认/年月日/正计时倒计时)、到期提醒
 */
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNativeBridge } from '../../../utils/useNativeBridge'
import { ChevronRight, ChevronLeft, Check, Minus, Eye, GripVertical, ChevronUp, ChevronDown, Info } from 'lucide-react'

const uuid = () => Math.random().toString(36).slice(2)

const TYPE_LABELS = {
  numeric: '数值类型',
  single: '单选类型',
  multiple: '多选类型',
  text: '文本类型',
  switch: '开关类型',
  rating: '评分类型',
  time: '时间类型',
}

// 文本类型子类型
const TEXT_SUB_TYPES = [
  { key: 'short', label: '短文本' },
  { key: 'long', label: '长文本' },
  { key: 'link', label: '链接' },
  { key: 'stat', label: '统计文本' },
]

// 时间类型子类型
const TIME_SUB_TYPES = [
  { key: 'default', label: '默认' },
  { key: 'date', label: '年月日' },
  { key: 'countdown', label: '正计时/倒计时' },
]

// 新建选项弹窗用的 24 色色板（约 3 行 8 列）
const OPTION_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#78716c', '#57534e', '#44403c', '#1f2937', '#0f172a', '#000000',
  'linear-gradient(135deg,#ef4444,#eab308,#22c55e,#3b82f6,#8b5cf6,#ec4899)', // 彩虹
]

export default function NewAttribute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInApp, setTitle, showToast, closePage } = useNativeBridge()

  const attributeType = location.state?.attributeType || 'numeric'
  const typeLabel = TYPE_LABELS[attributeType] || '数值类型'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('')
  const [defaultValue, setDefaultValue] = useState('')
  const [required, setRequired] = useState(false)
  // 单选/多选：选项列表 { id, name, color, visible? }
  const [options, setOptions] = useState([])
  // 单选：默认选中的选项 id；多选：默认选中的选项 id 数组
  const [defaultOptionId, setDefaultOptionId] = useState(null)
  const [defaultOptionIds, setDefaultOptionIds] = useState([])
  const [showNewOptionModal, setShowNewOptionModal] = useState(false)
  const [showDefaultPicker, setShowDefaultPicker] = useState(false)
  // 文本类型：子类型 short | long | link | stat
  const [textSubType, setTextSubType] = useState('short')
  const [showTextTypePicker, setShowTextTypePicker] = useState(false)
  // 开关类型：默认值 on/off
  const [defaultSwitchValue, setDefaultSwitchValue] = useState(false)
  // 时间类型：子类型、默认日期时间、到期提醒
  const [timeTypeSubType, setTimeTypeSubType] = useState('default')
  const [defaultTimeValue, setDefaultTimeValue] = useState(null) // { date: 'YYYY-MM-DD', time: 'HH:mm' }
  const [expireReminder, setExpireReminder] = useState(false)
  const [showTimeTypePicker, setShowTimeTypePicker] = useState(false)
  const [showDefaultTimePicker, setShowDefaultTimePicker] = useState(false)

  const pageTitle = '新建属性'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  const handleCancel = () => {
    if (location.state?.fromEvent) {
      navigate(-1)
    } else if (isInApp && closePage) {
      closePage()
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      showToast('请输入名称')
      return
    }
    if (attributeType === 'numeric' && !unit.trim()) {
      showToast('请输入单位')
      return
    }
    if (attributeType === 'text' && !textSubType) {
      showToast('请选择类型')
      return
    }
    if (attributeType === 'rating' && defaultValue.trim()) {
      const n = Number(defaultValue.trim())
      if (Number.isNaN(n) || n < 1 || n > 5) {
        showToast('默认值请在 1-5 范围内')
        return
      }
    }
    const payload = {
      id: uuid(),
      type: attributeType,
      name: name.trim(),
      description: description.trim(),
      unit: unit.trim(),
      defaultValue:
        attributeType === 'single'
          ? defaultOptionId
          : attributeType === 'multiple'
            ? defaultOptionIds
            : attributeType === 'switch'
              ? defaultSwitchValue
              : defaultValue.trim(),
      required,
    }
    if (attributeType === 'single' || attributeType === 'multiple') {
      payload.options = options
    }
    if (attributeType === 'text') {
      payload.textSubType = textSubType
    }
    if (attributeType === 'time') {
      payload.timeSubType = timeTypeSubType
      payload.defaultTimeValue = defaultTimeValue
      payload.expireReminder = expireReminder
    }
    if (location.state?.fromEvent) {
      navigate('/habit/event/new', { state: { newAttribute: payload }, replace: false })
    } else {
      showToast('属性已创建（演示）')
      navigate(-1)
    }
  }

  const defaultOption = options.find((o) => o.id === defaultOptionId)
  const defaultOptionLabel = defaultOption ? defaultOption.name : '未选择'
  const defaultOptionsMultiple = options.filter((o) => defaultOptionIds.includes(o.id))
  const defaultTimeLabel =
    defaultTimeValue == null
      ? '未选择'
      : `${defaultTimeValue.date} ${defaultTimeValue.time}`
  const defaultOptionLabelMultiple =
    defaultOptionsMultiple.length === 0
      ? '未选择'
      : defaultOptionsMultiple.length === 1
        ? defaultOptionsMultiple[0].name
        : `已选 ${defaultOptionsMultiple.length} 项`

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">新建属性</h1>
          <p className="text-gray-500 text-sm">请在小习惯 App 内使用</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 safe-area-inset-top">
        <div className="flex items-center justify-between h-12 px-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 text-base"
          >
            取消
          </button>
          <span className="font-semibold text-gray-900">新建属性</span>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-blue-500 font-medium text-base"
          >
            新建
          </button>
        </div>
      </header>

      <div className="px-4 pt-4">
        {attributeType === 'time' ? (
          <>
            <h3 className="font-bold text-gray-900 mb-2 px-1">时间类型</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              <Field
                label="名称"
                required
                value={name}
                onChange={setName}
                placeholder="名称"
              />
              <Field
                label="描述"
                value={description}
                onChange={setDescription}
                placeholder="链接或者文本,可为空"
              />
              <div
                role="button"
                onClick={() => setShowDefaultTimePicker(true)}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-gray-900">默认值</span>
                <div className="flex items-center gap-1">
                  <span className="text-blue-500">{defaultTimeLabel}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-900">必填</span>
                <Toggle checked={required} onChange={setRequired} />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 px-1 mt-4">其他</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              <div
                role="button"
                onClick={() => setShowTimeTypePicker(true)}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-gray-900">类型</span>
                <div className="flex items-center gap-1">
                  <span className="text-blue-500">
                    {TIME_SUB_TYPES.find((t) => t.key === timeTypeSubType)?.label ?? '默认'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-900">到期提醒</span>
                <Toggle checked={expireReminder} onChange={setExpireReminder} />
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-gray-900 mb-2 px-1">{typeLabel}</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {(attributeType === 'single' || attributeType === 'multiple') ? (
              <>
                <Field
                  label="名称"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="名称,例如心情"
                />
                <Field
                  label="描述"
                  value={description}
                  onChange={setDescription}
                  placeholder="链接或者文本,可为空"
                />
                <div
                  role="button"
                  onClick={() => options.length > 0 && setShowDefaultPicker(true)}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-gray-900">默认值</span>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">
                      {attributeType === 'multiple' ? defaultOptionLabelMultiple : defaultOptionLabel}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-900">必填</span>
                  <Toggle checked={required} onChange={setRequired} />
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm text-gray-900 mb-2">选项</div>
                  {attributeType === 'multiple' ? (
                    <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/50">
                      {options.map((opt, index) => (
                        <OptionRowMultiple
                          key={opt.id}
                          opt={opt}
                          onRemove={() => {
                            setOptions((prev) => prev.filter((o) => o.id !== opt.id))
                            setDefaultOptionIds((prev) => prev.filter((id) => id !== opt.id))
                          }}
                          onToggleVisible={() =>
                            setOptions((prev) =>
                              prev.map((o) =>
                                o.id === opt.id ? { ...o, visible: o.visible !== false } : o
                              )
                            )
                          }
                          onMoveUp={
                            index > 0
                              ? () =>
                                  setOptions((prev) => {
                                    const next = [...prev]
                                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                                    return next
                                  })
                              : undefined
                          }
                          onMoveDown={
                            index < options.length - 1
                              ? () =>
                                  setOptions((prev) => {
                                    const next = [...prev]
                                    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                                    return next
                                  })
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowNewOptionModal(true)}
                    className={`w-full flex items-center justify-center gap-2 py-3 text-blue-500 text-base rounded-xl border border-dashed border-gray-200 mt-2`}
                  >
                    + 新增
                  </button>
                  {attributeType === 'single' && options.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {options.map((opt) => (
                        <li key={opt.id} className="flex items-center gap-2 py-2">
                          <span
                            className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                            style={{
                              background: opt.color.startsWith('linear') ? opt.color : opt.color,
                            }}
                          />
                          <span className="text-gray-900 flex-1">{opt.name || '未命名'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : attributeType === 'switch' ? (
              <>
                <Field
                  label="名称"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="名称"
                />
                <Field
                  label="描述"
                  value={description}
                  onChange={setDescription}
                  placeholder="链接或者文本,可为空"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-900">默认值</span>
                  <Toggle checked={defaultSwitchValue} onChange={setDefaultSwitchValue} />
                </div>
              </>
            ) : attributeType === 'rating' ? (
              <>
                <Field
                  label="名称"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="名字,比如评价"
                />
                <Field
                  label="描述"
                  value={description}
                  onChange={setDescription}
                  placeholder="链接或者文本,可为空"
                />
                <Field
                  label="默认值"
                  value={defaultValue}
                  onChange={setDefaultValue}
                  placeholder="默认值,范围1-5"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-900">必填</span>
                  <Toggle checked={required} onChange={setRequired} />
                </div>
              </>
            ) : attributeType === 'text' ? (
              <>
                <Field
                  label="名称"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="名称"
                />
                <div
                  role="button"
                  onClick={() => setShowTextTypePicker(true)}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-gray-900">类型</span>
                    <span className="text-red-500">*</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">
                      {TEXT_SUB_TYPES.find((t) => t.key === textSubType)?.label ?? '短文本'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <Field
                  label="描述"
                  value={description}
                  onChange={setDescription}
                  placeholder="链接或者文本,可为空"
                />
                <Field
                  label="默认值"
                  value={defaultValue}
                  onChange={setDefaultValue}
                  placeholder="默认值"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-900">必填</span>
                  <Toggle checked={required} onChange={setRequired} />
                </div>
              </>
            ) : (
              <>
                <Field
                  label="名称"
                  required
                  value={name}
                  onChange={setName}
                  placeholder="名称,例如价格"
                />
                <Field
                  label="描述"
                  value={description}
                  onChange={setDescription}
                  placeholder="链接或者文本,可为空"
                />
                <Field
                  label="单位"
                  required
                  value={unit}
                  onChange={setUnit}
                  placeholder="单位,例如元"
                />
                <Field
                  label="默认值"
                  value={defaultValue}
                  onChange={setDefaultValue}
                  placeholder="默认值,例如100"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-gray-900">必填</span>
                  <Toggle checked={required} onChange={setRequired} />
                </div>
              </>
            )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 时间类型 - 类型选择弹窗 */}
      {showTimeTypePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowTimeTypePicker(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2 pb-1">
              <span className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-4 pb-6">
              {TIME_SUB_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTimeTypeSubType(t.key)
                    setShowTimeTypePicker(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-left"
                >
                  <span className="text-gray-900">{t.label}</span>
                  {timeTypeSubType === t.key && <Check className="w-5 h-5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 时间类型 - 默认值日期时间选择弹窗 */}
      {showDefaultTimePicker && (
        <DefaultTimePickerModal
          value={defaultTimeValue}
          onClose={() => setShowDefaultTimePicker(false)}
          onClear={() => setDefaultTimeValue(null)}
          onConfirm={(v) => {
            setDefaultTimeValue(v)
            setShowDefaultTimePicker(false)
          }}
        />
      )}

      {/* 文本类型 - 类型选择弹窗 */}
      {showTextTypePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowTextTypePicker(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2 pb-1">
              <span className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-4 pb-6">
              {TEXT_SUB_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTextSubType(t.key)
                    setShowTextTypePicker(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-left"
                >
                  <span className="text-gray-900">{t.label}</span>
                  {textSubType === t.key && <Check className="w-5 h-5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新建选项弹窗 */}
      {showNewOptionModal && (
        <NewOptionModal
          colors={OPTION_COLORS}
          onClose={() => setShowNewOptionModal(false)}
          onConfirm={(opt) => {
            setOptions((prev) => [...prev, { ...opt, id: opt.id || uuid() }])
            setShowNewOptionModal(false)
          }}
        />
      )}

      {/* 默认值选择（单选 / 多选） */}
      {showDefaultPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowDefaultPicker(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[50vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-medium text-gray-900">选择默认值</span>
              {attributeType === 'multiple' ? (
                <button
                  type="button"
                  onClick={() => setShowDefaultPicker(false)}
                  className="text-blue-500 text-base"
                >
                  确定
                </button>
              ) : null}
            </div>
            {attributeType === 'multiple' ? (
              <>
                <button
                  type="button"
                  onClick={() => setDefaultOptionIds([])}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span>未选择</span>
                  {defaultOptionIds.length === 0 && <Check className="w-5 h-5 text-blue-500" />}
                </button>
                {options.map((opt) => {
                  const isSelected = defaultOptionIds.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setDefaultOptionIds((prev) =>
                          isSelected ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                        )
                      }
                      className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                        style={{
                          background: opt.color.startsWith('linear') ? opt.color : opt.color,
                        }}
                      />
                      <span className="flex-1">{opt.name || '未命名'}</span>
                      {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                  )
                })}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDefaultOptionId(null)
                    setShowDefaultPicker(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span>未选择</span>
                  {!defaultOptionId && <Check className="w-5 h-5 text-blue-500" />}
                </button>
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDefaultOptionId(opt.id)
                      setShowDefaultPicker(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                      style={{
                        background: opt.color.startsWith('linear') ? opt.color : opt.color,
                      }}
                    />
                    <span className="flex-1">{opt.name || '未命名'}</span>
                    {defaultOptionId === opt.id && <Check className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** 多选类型下的选项行：删除、颜色、名称、眼睛、排序 */
function OptionRowMultiple({ opt, onRemove, onToggleVisible, onMoveUp, onMoveDown }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 last:border-b-0 bg-white">
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500 active:bg-red-500/20"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span
        className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-200"
        style={{
          background: opt.color.startsWith('linear') ? opt.color : opt.color,
        }}
      />
      <span className="flex-1 text-gray-900 truncate">{opt.name || '未命名'}</span>
      <button
        type="button"
        onClick={onToggleVisible}
        className="p-2 text-gray-400 active:text-gray-600"
        title="可见"
      >
        <Eye className="w-5 h-5" />
      </button>
      <div className="flex items-center text-gray-400">
        {onMoveUp && (
          <button type="button" onClick={onMoveUp} className="p-1 active:text-gray-600">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
        {onMoveDown && (
          <button type="button" onClick={onMoveDown} className="p-1 active:text-gray-600">
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
        <span className="text-gray-300" title="排序">
          <GripVertical className="w-5 h-5" />
        </span>
      </div>
    </div>
  )
}

function Field({ label, required, value, onChange, placeholder }) {
  return (
    <div className="px-4 py-3">
      <label className="block text-sm text-gray-900 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
      />
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
    >
      <span
        className={`block w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

/** 新建选项弹窗：名称 + 颜色选择（24 色网格，选中显示对勾） */
function NewOptionModal({ colors, onClose, onConfirm }) {
  const [optionName, setOptionName] = useState('')
  const [selectedColor, setSelectedColor] = useState(colors[0])

  const handleConfirm = () => {
    onConfirm({
      id: uuid(),
      name: optionName.trim() || '未命名',
      color: selectedColor,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between h-12 px-4 border-b border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="text-gray-500 text-base">
            取消
          </button>
          <span className="font-semibold text-gray-900">新建选项</span>
          <button
            type="button"
            onClick={handleConfirm}
            className="text-blue-500 font-medium text-base"
          >
            新建
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm text-gray-900 mb-1">名称</label>
            <input
              type="text"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              placeholder="名称,例如开心"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-900 mb-2">颜色</label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color, i) => {
                const isSelected = selectedColor === color
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-full aspect-square rounded-full border-2 border-transparent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{
                      borderColor: isSelected ? '#3b82f6' : 'transparent',
                      background: color.startsWith('linear') ? color : color,
                      boxShadow: '0 0 0 2px white, 0 0 0 3px #e5e7eb',
                    }}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 时间类型 - 默认值日期时间选择弹窗：清空 | 默认值 | 确认，日历 + 时分 */
function DefaultTimePickerModal({ value, onClose, onClear, onConfirm }) {
  const now = new Date()
  const initialDate = value?.date ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const initialTime = value?.time ?? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const [viewYear, setViewYear] = useState(() => (value ? parseInt(value.date.slice(0, 4), 10) : now.getFullYear()))
  const [viewMonth, setViewMonth] = useState(() => (value ? parseInt(value.date.slice(5, 7), 10) : now.getMonth() + 1))
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedTime, setSelectedTime] = useState(initialTime)

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
  const leadingEmpty = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1)
      setViewMonth(12)
    } else {
      setViewMonth((m) => m - 1)
    }
  }
  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1)
      setViewMonth(1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${viewYear}-${pad(viewMonth)}-${pad(d)}`

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const [hour, minute] = selectedTime.split(':').map(Number)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1">
          <span className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              onClear()
              onClose()
            }}
            className="text-gray-500 text-sm"
          >
            清空
          </button>
          <span className="font-semibold text-gray-900">默认值</span>
          <button
            type="button"
            onClick={() => onConfirm({ date: selectedDate, time: selectedTime })}
            className="text-blue-500 font-medium text-sm"
          >
            确认
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">
              {viewYear}年{viewMonth}月
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs text-gray-500 py-1">
                {w}
              </div>
            ))}
            {leadingEmpty.map((i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((d) => {
              const dStr = dateStr(d)
              const isSelected = selectedDate === dStr
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(dStr)}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm ${isSelected ? 'bg-blue-500 text-white' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">时</div>
              <select
                value={hour}
                onChange={(e) => setSelectedTime(`${pad(Number(e.target.value))}:${pad(minute)}`)}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 text-gray-900"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">分</div>
              <select
                value={minute}
                onChange={(e) => setSelectedTime(`${pad(hour)}:${pad(Number(e.target.value))}`)}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 text-gray-900"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {pad(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
