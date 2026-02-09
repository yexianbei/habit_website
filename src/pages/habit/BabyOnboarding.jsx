/**
 * 宝宝成长 - 首次使用引导页
 * 目标：收集最小必要信息（昵称、性别、出生日期，可选出生身高体重）
 * 写入：baby.updateSettings
 */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export default function BabyOnboarding() {
  const navigate = useNavigate()
  const { isInApp, setTitle, showToast, showLoading, hideLoading, callNative } =
    useNativeBridge()

  const [name, setName] = useState('')
  const [gender, setGender] = useState('unknown') // 'male' | 'female' | 'unknown'
  const [birthday, setBirthday] = useState(formatDate(new Date()))
  const [birthHeight, setBirthHeight] = useState('')
  const [birthWeight, setBirthWeight] = useState('')

  const canSubmit = useMemo(() => {
    if (!name || !birthday) return false
    // 出生日期不能晚于今天
    const today = new Date()
    const b = new Date(birthday.replace(/-/g, '/'))
    return b <= today
  }, [name, birthday])

  const pageTitle = '宝宝成长'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  useEffect(() => {
    // 尝试预填已有设置
    const load = async () => {
      if (!isInApp) return
      try {
        const s = await callNative('baby.getSettings')
        if (s) {
          if (s.name) setName(s.name)
          if (s.gender) setGender(s.gender)
          if (s.birthday) setBirthday(s.birthday)
          if (s.birthHeight) setBirthHeight(String(s.birthHeight))
          if (s.birthWeight) setBirthWeight(String(s.birthWeight))
        }
      } catch (e) {
        console.warn('[BabyOnboarding] 预填设置失败:', e)
      }
    }
    load()
  }, [isInApp, callNative])

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await showLoading('初始化中...')

      const payload = {
        name: name.trim(),
        gender,
        birthday,
      }

      if (birthHeight) {
        const h = Number(birthHeight)
        if (!Number.isNaN(h) && h > 0 && h < 100) {
          payload.birthHeight = h
        }
      }

      if (birthWeight) {
        const w = Number(birthWeight)
        if (!Number.isNaN(w) && w > 0 && w < 30) {
          payload.birthWeight = w
        }
      }

      await callNative('baby.updateSettings', payload)

      await hideLoading()
      await showToast('初始化完成')
      navigate('/habit/baby', { replace: true })
    } catch (e) {
      await hideLoading()
      await showToast('初始化失败: ' + (e?.message || '未知错误'))
    }
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
            <span className="text-5xl">👶</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">宝宝成长</h1>
          <p className="text-gray-500">请在小习惯 App 内使用</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">首次使用初始化</h2>
                <p className="text-sm text-gray-500">填完即可开始记录宝宝成长</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宝宝昵称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：可乐、小豆子"
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宝宝性别
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'male', label: '男宝宝', icon: '🧒' },
                    { value: 'female', label: '女宝宝', icon: '👧' },
                    { value: 'unknown', label: '保密', icon: '✨' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm font-medium border transition-all active:scale-95 ${
                        gender === opt.value
                          ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      <span className="mr-1">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出生日期
                </label>
                <input
                  type="date"
                  value={birthday}
                  max={formatDate(new Date())}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <p className="text-xs text-gray-400 mt-2">
                  出生日期会用于计算月龄，帮你看到不同月龄阶段的变化
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出生身高（cm）
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="70"
                    value={birthHeight}
                    onChange={(e) => setBirthHeight(e.target.value)}
                    placeholder="可选"
                    className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    出生体重（kg）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={birthWeight}
                    onChange={(e) => setBirthWeight(e.target.value)}
                    placeholder="可选"
                    className="w-full max-w-full min-w-0 box-border px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                开始记录
              </button>

              <button
                onClick={() =>
                  navigate('/habit/baby?skipOnboarding=1', { replace: true })
                }
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

