/**
 * 新建事件 - 自定义打卡事件添加页面
 * 包含：事件名称与图标、基本设置、属性（含属性类型选择弹窗）、提醒设置
 */
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNativeBridge } from '../../../utils/useNativeBridge'
import {
  Coffee,
  ChevronRight,
  Plus,
  Info,
  X,
  Hash,
  Check,
  List,
  AlignLeft,
  ToggleLeft,
  Star,
  Clock,
} from 'lucide-react'

const uuid = () => Math.random().toString(36).slice(2)

const ATTRIBUTE_TYPES = [
  {
    key: 'numeric',
    title: '数值类型',
    desc: '可以用来追踪价格、重量等数值',
    icon: Hash,
  },
  {
    key: 'single',
    title: '单选类型',
    desc: '从预设的选项中单选',
    icon: Check,
  },
  {
    key: 'multiple',
    title: '多选类型',
    desc: '从预设的选项中多选',
    icon: List,
  },
  {
    key: 'text',
    title: '文本类型',
    desc: '文本内容，可以是地点、人名',
    icon: AlignLeft,
  },
  {
    key: 'switch',
    title: '开关类型',
    desc: '轻松设置为是或否',
    icon: ToggleLeft,
  },
  {
    key: 'rating',
    title: '评分类型',
    desc: '用于给美食、电影评分',
    icon: Star,
  },
  {
    key: 'time',
    title: '时间类型',
    desc: '可以用来记录一个时间点并提醒',
    icon: Clock,
  },
]

export default function NewEvent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isInApp, setTitle, showToast, closePage } = useNativeBridge()

  const [eventName, setEventName] = useState('')
  const [groupId, setGroupId] = useState(null)
  const [groupName, setGroupName] = useState('未选择')
  const [eventType, setEventType] = useState('默认')
  const [quickRecord, setQuickRecord] = useState(false)
  const [attributes, setAttributes] = useState([])
  const [periodicReminder, setPeriodicReminder] = useState(false)
  const [intervalReminder, setIntervalReminder] = useState(false)
  const [showAttributeTypeModal, setShowAttributeTypeModal] = useState(false)

  const pageTitle = '新建事件'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  // 从新建属性页返回时带回新加的属性
  useEffect(() => {
    const state = location.state
    if (state?.newAttribute) {
      setAttributes((prev) => [...prev, { ...state.newAttribute, id: state.newAttribute.id || uuid() }])
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const handleCancel = () => {
    if (isInApp && closePage) {
      closePage()
    } else {
      navigate(-1)
    }
  }

  const handleAddAttribute = (type) => {
    setShowAttributeTypeModal(false)
    navigate('/habit/event/attribute/new', { state: { attributeType: type, fromEvent: true } })
  }

  const handleSubmit = async () => {
    if (!eventName.trim()) {
      await showToast('请输入事件名称')
      return
    }
    const payload = {
      id: uuid(),
      name: eventName.trim(),
      icon: 'coffee',
      groupId,
      groupName,
      eventType,
      quickRecord,
      attributes,
      periodicReminder,
      intervalReminder,
    }
    await showToast('事件已创建（演示）')
    if (isInApp && closePage) closePage()
    else navigate(-1)
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">新建事件</h1>
          <p className="text-gray-500 text-sm mb-6">请在小习惯 App 内使用</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm"
          >
            下载小习惯 App
          </a>
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
          <span className="font-semibold text-gray-900">新建事件</span>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-blue-500 font-medium text-base"
          >
            新建
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* 事件名称 + 图标 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="事件名称"
              className="flex-1 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* 基本 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 px-1">基本</h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              <Row
                label="所属分组"
                value={groupName}
                onClick={() => {}}
              />
              <Row
                label="事件类型"
                value={eventType}
                info
                onClick={() => {}}
              />
              <Row
                label="快速记录"
                value=""
                info
                right={
                  <Toggle
                    checked={quickRecord}
                    onChange={setQuickRecord}
                  />
                }
              />
            </div>
          </div>
        </div>

        {/* 属性 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 px-1 flex items-center gap-1">
            属性
            <Info className="w-4 h-4 text-gray-400" />
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAttributeTypeModal(true)}
              className="w-full flex items-center justify-center gap-2 py-4 text-blue-500 text-base"
            >
              <Plus className="w-5 h-5" />
              新增
            </button>
            {attributes.length > 0 && (
              <div className="px-4 pb-3 space-y-2">
                {attributes.map((a) => (
                  <div
                    key={a.id}
                    className="text-sm text-gray-600 py-1"
                  >
                    {a.name || a.title || a.type}
                    {a.unit && `（${a.unit}）`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 定期提醒 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 px-1 flex items-center gap-1">
            定期提醒
            <Info className="w-4 h-4 text-gray-400" />
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-gray-900">定期提醒</span>
              <Toggle
                checked={periodicReminder}
                onChange={setPeriodicReminder}
              />
            </div>
          </div>
        </div>

        {/* 间隔提醒 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 px-1 flex items-center gap-1">
            间隔提醒
            <Info className="w-4 h-4 text-gray-400" />
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-gray-900">间隔提醒</span>
              <Toggle
                checked={intervalReminder}
                onChange={setIntervalReminder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 属性类型选择弹窗 */}
      {showAttributeTypeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowAttributeTypeModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setShowAttributeTypeModal(false)}
                className="p-2 -m-2 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-900">请您选择属性类型</span>
              <div className="w-9" />
            </div>
            <div className="overflow-y-auto py-2">
              {ATTRIBUTE_TYPES.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAddAttribute(item.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 truncate">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, info, right, onClick }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3"
    >
      <div className="flex items-center gap-1">
        <span className="text-gray-900">{label}</span>
        {info && <Info className="w-4 h-4 text-gray-400" />}
      </div>
      {right !== undefined ? (
        right
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-blue-500">{value}</span>
          {onClick && <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      )}
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
