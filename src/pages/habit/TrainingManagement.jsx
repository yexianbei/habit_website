import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { useNativeBridge } from '../../utils/useNativeBridge'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TRAINING_EXERCISES } from './training/data'

const HABIT_TYPE_TRAINING = 25

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`
}

const uuid = () => Math.random().toString(36).slice(2)

const STORAGE_KEY_PLANS = 'training:plans'

const defaultPlans = [
  {
    id: uuid(),
    name: '推（胸肩三头）',
    exercises: ['卧推', '上斜卧推', '肩推', '双杠臂屈伸'],
  },
  {
    id: uuid(),
    name: '拉（背二头）',
    exercises: ['高位下拉', '划船', '硬拉（轻量）', '弯举'],
  },
  {
    id: uuid(),
    name: '腿（深蹲为主）',
    exercises: ['深蹲', '腿举', '罗马尼亚硬拉', '小腿提踵'],
  },
]

export default function TrainingManagement() {
  const {
    isInApp,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
    getHabitList,
    checkIn,
    getCheckInRecords,
    getStorage,
    setStorage,
  } = useNativeBridge()
  const { deleteHabit, isDeleting } = useHabitDelete({ type: 25, name: '力量训练' })

  const [habitId, setHabitId] = useState(null)
  const [loadingHabit, setLoadingHabit] = useState(true)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [daySets, setDaySets] = useState([])
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [inputExercise, setInputExercise] = useState('')
  const [inputWeight, setInputWeight] = useState('')
  const [inputReps, setInputReps] = useState('')
  const [inputRpe, setInputRpe] = useState('')

  const [plans, setPlans] = useState([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planName, setPlanName] = useState('')
  const [planExercisesText, setPlanExercisesText] = useState('')

  const [statsRangeDays] = useState(14)
  const [statsData, setStatsData] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)

  const [exerciseSuggestions, setExerciseSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null)

  const pageTitle = '力量训练'

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
        const result = await getHabitList({ type: HABIT_TYPE_TRAINING })
        const id =
          result?.habits?.[0]?.habitId ||
          result?.habits?.[0]?.id ||
          null
        setHabitId(id)
      } catch (e) {
        console.error('[TrainingManagement] 获取习惯失败:', e)
      } finally {
        setLoadingHabit(false)
      }
    }
    init()
  }, [isInApp, getHabitList])

  const loadPlans = useCallback(async () => {
    try {
      const stored = await getStorage(STORAGE_KEY_PLANS)
      if (Array.isArray(stored) && stored.length > 0) {
        setPlans(stored)
      } else {
        setPlans(defaultPlans)
        await setStorage(STORAGE_KEY_PLANS, defaultPlans)
      }
    } catch (e) {
      console.error('[TrainingManagement] 加载训练计划失败:', e)
      setPlans(defaultPlans)
    }
  }, [getStorage, setStorage])

  const loadDayRecord = useCallback(async () => {
    if (!isInApp || !habitId) return
    const day = formatDate(selectedDate)
    try {
      const res = await getCheckInRecords(habitId, day, day)
      const records = Array.isArray(res?.records) ? res.records : []
      const r =
        records.find(
          (x) =>
            formatDate(new Date(x.createTime)) === day &&
            x.signUpId
        ) || null
      if (r?.signUpId) {
        try {
          const d = JSON.parse(r.signUpId)
          const sets = Array.isArray(d.sets) ? d.sets : []
          setDaySets(
            sets.map((s) => ({
              id: s.id || uuid(),
              exercise: s.exercise || '',
              weight: Number(s.weight) || 0,
              reps: Number(s.reps) || 0,
              rpe: s.rpe != null ? Number(s.rpe) : null,
            }))
          )
          setNote(d.note || '')
        } catch (_) {
          setDaySets([])
          setNote('')
        }
      } else {
        setDaySets([])
        setNote('')
      }
    } catch (e) {
      console.error('[TrainingManagement] 加载当天记录失败:', e)
      setDaySets([])
      setNote('')
    }
  }, [isInApp, habitId, selectedDate, getCheckInRecords])

  const loadStats = useCallback(async () => {
    if (!isInApp || !habitId) return
    setLoadingStats(true)
    try {
      const end = new Date()
      const start = new Date(
        end.getTime() - (statsRangeDays - 1) * 24 * 60 * 60 * 1000
      )
      const startDate = formatDate(start)
      const endDate = formatDate(end)
      const res = await getCheckInRecords(
        habitId,
        startDate,
        endDate
      )
      const records = Array.isArray(res?.records) ? res.records : []
      const map = {}
      records.forEach((r) => {
        const dStr = formatDate(new Date(r.createTime))
        if (!map[dStr]) {
          map[dStr] = { volume: 0, sets: 0 }
        }
        if (!r.signUpId) return
        try {
          const detail = JSON.parse(r.signUpId)
          const sets = Array.isArray(detail.sets) ? detail.sets : []
          sets.forEach((s) => {
            const w = Number(s.weight) || 0
            const reps = Number(s.reps) || 0
            if (w > 0 && reps > 0) {
              map[dStr].volume += w * reps
              map[dStr].sets += 1
            }
          })
        } catch (_) {}
      })
      const data = []
      for (let i = statsRangeDays - 1; i >= 0; i -= 1) {
        const d = new Date(
          end.getTime() - i * 24 * 60 * 60 * 1000
        )
        const key = formatDate(d)
        const obj = map[key] || { volume: 0, sets: 0 }
        data.push({
          date: key.slice(5),
          训练量: obj.volume,
          组数: obj.sets,
        })
      }
      setStatsData(data)
    } catch (e) {
      console.error('[TrainingManagement] 加载训练统计失败:', e)
      setStatsData([])
    } finally {
      setLoadingStats(false)
    }
  }, [isInApp, habitId, statsRangeDays, getCheckInRecords])

  useEffect(() => {
    if (isInApp) {
      loadPlans()
    }
  }, [isInApp, loadPlans])

  useEffect(() => {
    if (habitId) {
      loadDayRecord()
      loadStats()
    }
  }, [habitId, loadDayRecord, loadStats])

  const addSet = async () => {
    if (!inputExercise.trim()) {
      await showToast('请输入动作名称')
      return
    }
    const weight = Number(inputWeight)
    const reps = Number(inputReps)
    if (!weight || !reps || weight <= 0 || reps <= 0) {
      await showToast('请输入有效的重量和次数')
      return
    }
    const rpe =
      inputRpe.trim() === '' ? null : Number(inputRpe) || null

    // 尝试根据输入名称匹配标准动作库，方便后续做更细的统计
    const matched = TRAINING_EXERCISES.find((ex) => {
      const q = inputExercise.trim()
      if (!q) return false
      return (
        ex.name === q ||
        (Array.isArray(ex.aliases) && ex.aliases.includes(q))
      )
    })

    setDaySets((prev) => [
      ...prev,
      {
        id: uuid(),
        exercise: inputExercise.trim(),
        exerciseId: matched ? matched.id : null,
        weight,
        reps,
        rpe,
      },
    ])
    setInputWeight('')
    setInputReps('')
    setInputRpe('')
    setShowSuggestions(false)
  }

  const removeSet = (id) => {
    setDaySets((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSave = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (!habitId) {
      await showToast('请先在习惯库中添加力量训练习惯')
      return
    }
    if (daySets.length === 0 && !note.trim()) {
      await showToast('请先添加至少一组训练或填写备注')
      return
    }
    setIsSaving(true)
    try {
      await showLoading('保存中...')
      const details = {
        note: note.trim(),
        sets: daySets.map((s) => ({
          id: s.id,
          exercise: s.exercise,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
        })),
      }
      await checkIn(habitId, {
        date: formatDate(selectedDate),
        signUpId: JSON.stringify(details),
      })
      await hideLoading()
      await showToast('保存成功')
      await loadDayRecord()
      await loadStats()
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + (e.message || '未知错误'))
    } finally {
      setIsSaving(false)
    }
  }

  const todaySummary = useMemo(() => {
    if (!daySets || daySets.length === 0) {
      return {
        emoji: '🏋️',
        main: '力量训练',
        sub: '记录每一组训练，追踪训练量',
      }
    }
    const totalVolume = daySets.reduce(
      (sum, s) => sum + (s.weight || 0) * (s.reps || 0),
      0
    )
    const uniqueExercises = new Set(
      daySets.map((s) => s.exercise || '')
    )
    return {
      emoji: '🔥',
      main: `${totalVolume.toFixed(0)} kg`,
      sub: `${uniqueExercises.size} 个动作 · ${daySets.length} 组`,
    }
  }, [daySets])

  const applyPlanToToday = async (plan) => {
    if (!plan || !Array.isArray(plan.exercises)) return
    if (daySets.length > 0) {
      const confirmed = window.confirm(
        '今天已经有训练记录，应用计划会在现有记录后追加动作，是否继续？'
      )
      if (!confirmed) return
    }
    const newSets = plan.exercises.map((name) => {
      const matched = TRAINING_EXERCISES.find((ex) => {
        if (!name) return false
        return (
          ex.name === name ||
          (Array.isArray(ex.aliases) && ex.aliases.includes(name))
        )
      })
      return {
        id: uuid(),
        exercise: name,
        exerciseId: matched ? matched.id : null,
        weight: 0,
        reps: 0,
        rpe: null,
      }
    })
    setDaySets((prev) => [...prev, ...newSets])
    setInputExercise(plan.exercises[0] || '')
    await showToast('已将训练计划应用到今天，请填写重量和次数')
  }

  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanName('')
    setPlanExercisesText('')
    setShowPlanModal(true)
  }

  const openEditPlan = (plan) => {
    setEditingPlan(plan)
    setPlanName(plan.name || '')
    setPlanExercisesText((plan.exercises || []).join('\n'))
    setShowPlanModal(true)
  }

  const savePlan = async () => {
    if (!planName.trim()) {
      await showToast('请输入计划名称')
      return
    }
    const list = planExercisesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (list.length === 0) {
      await showToast('请至少填写一个动作，一行一个')
      return
    }
    let next
    if (editingPlan) {
      next = plans.map((p) =>
        p.id === editingPlan.id
          ? { ...p, name: planName.trim(), exercises: list }
          : p
      )
    } else {
      next = [
        ...plans,
        {
          id: uuid(),
          name: planName.trim(),
          exercises: list,
        },
      ]
    }
    setPlans(next)
    try {
      await setStorage(STORAGE_KEY_PLANS, next)
    } catch (e) {
      console.error('[TrainingManagement] 保存训练计划失败:', e)
    }
    setShowPlanModal(false)
  }

  const deletePlan = async () => {
    if (!editingPlan) {
      setShowPlanModal(false)
      return
    }
    const confirmed = window.confirm('确定要删除该训练计划吗？')
    if (!confirmed) return
    const next = plans.filter((p) => p.id !== editingPlan.id)
    setPlans(next)
    try {
      await setStorage(STORAGE_KEY_PLANS, next)
    } catch (e) {
      console.error('[TrainingManagement] 删除训练计划失败:', e)
    }
    setShowPlanModal(false)
  }

  const allExercisesById = useMemo(() => {
    const map = {}
    TRAINING_EXERCISES.forEach((ex) => {
      map[ex.id] = ex
    })
    return map
  }, [])

  const searchExercises = useCallback((keyword) => {
    const q = keyword.trim().toLowerCase()
    if (!q) return []
    const limit = 8
    const res = TRAINING_EXERCISES.filter((ex) => {
      const nameMatch = ex.name.toLowerCase().includes(q)
      const aliasMatch =
        Array.isArray(ex.aliases) &&
        ex.aliases.some((a) => a.toLowerCase().includes(q))
      const bodyPartMatch =
        ex.bodyPart &&
        ex.bodyPart.toLowerCase().includes(q)
      return nameMatch || aliasMatch || bodyPartMatch
    })
    return res.slice(0, limit)
  }, [])

  const handleExerciseInputChange = (value) => {
    setInputExercise(value)
    const list = searchExercises(value)
    setExerciseSuggestions(list)
    setShowSuggestions(list.length > 0)
  }

  const handleSelectSuggestion = (exercise) => {
    setInputExercise(exercise.name)
    setExerciseSuggestions([])
    setShowSuggestions(false)
  }

  const openExerciseDetail = (setItem) => {
    if (!setItem) return
    let exercise = null
    if (setItem.exerciseId && allExercisesById[setItem.exerciseId]) {
      exercise = allExercisesById[setItem.exerciseId]
    } else if (setItem.exercise) {
      exercise =
        TRAINING_EXERCISES.find(
          (ex) =>
            ex.name === setItem.exercise ||
            (Array.isArray(ex.aliases) &&
              ex.aliases.includes(setItem.exercise))
        ) || null
    }
    if (exercise) {
      setSelectedExerciseDetail(exercise)
    }
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-200">
            <span className="text-5xl">🏋️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">力量训练</h1>
          <p className="text-gray-500 mb-6">请在小习惯 App 内使用</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-medium shadow-lg shadow-violet-200"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  if (loadingHabit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50">
      {/* 头部状态 */}
      <div className="relative overflow-hidden">
        <div
          className="px-6 pt-6 pb-8 relative z-10"
          style={{
            background:
              'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-4xl">{todaySummary.emoji}</span>
                <span className="text-4xl font-bold">
                  {todaySummary.main}
                </span>
              </div>
              <p className="text-white/80 text-sm">
                {todaySummary.sub}
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/habit/training/library'
                }}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/80 underline-offset-2 hover:underline"
              >
                📚 查看动作库
              </button>
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
                  href="/habit/training/intro"
                  className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm backdrop-blur-sm"
                >
                  添加习惯
                </a>
              )}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                const el = document.getElementById(
                  'training-record-card'
                )
                if (el)
                  el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                setSelectedDate(new Date())
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-sm text-white font-medium active:scale-95 transition-transform"
            >
              记一组
            </button>
            <button
              onClick={openCreatePlan}
              className="px-4 py-3 rounded-2xl bg-white/20 text-white text-sm backdrop-blur-sm active:scale-95 transition-transform"
            >
              管理计划
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/habit/training/library'
              }}
              className="px-4 py-3 rounded-2xl bg-white/20 text-white text-xs backdrop-blur-sm active:scale-95 transition-transform"
            >
              查看动作库
            </button>
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      {/* 训练计划列表 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📅</span>
            训练计划
          </h3>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-sm">
              暂无训练计划，点击右上角「管理计划」新建
            </p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-start justify-between p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50/40 border border-violet-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {plan.name}
                      </span>
                      <span className="px-2 py-[2px] rounded-full bg-white/70 text-[10px] text-violet-600">
                        {plan.exercises?.length || 0} 个动作
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {(plan.exercises || []).join(' · ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <button
                      onClick={() => applyPlanToToday(plan)}
                      className="px-3 py-1.5 rounded-xl bg-violet-500 text-white text-xs active:scale-95 transition-transform"
                    >
                      应用到今天
                    </button>
                    <button
                      onClick={() => openEditPlan(plan)}
                      className="text-[11px] text-violet-500"
                    >
                      编辑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 今日训练记录 */}
      <div className="px-4 mt-4" id="training-record-card">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📝</span>
            今日训练记录
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">日期</span>
              <input
                type="date"
                value={formatDate(selectedDate)}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                      ? new Date(e.target.value)
                      : new Date()
                  )
                }
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 relative">
                  <span className="text-sm text-gray-500 w-16">
                    动作
                  </span>
                  <input
                    type="text"
                    value={inputExercise}
                    onChange={(e) =>
                      handleExerciseInputChange(e.target.value)
                    }
                    placeholder="例如 卧推 / 深蹲"
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                  {showSuggestions && exerciseSuggestions.length > 0 && (
                    <div className="absolute left-16 right-0 top-11 z-20 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                      {exerciseSuggestions.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(ex)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-violet-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">
                              {ex.name}
                            </span>
                            <span className="ml-2 px-2 py-[1px] rounded-full bg-gray-100 text-[10px] text-gray-500">
                              {ex.bodyPart === 'chest' && '胸'}
                              {ex.bodyPart === 'back' && '背'}
                              {ex.bodyPart === 'shoulders' && '肩'}
                              {ex.bodyPart === 'legs' && '腿'}
                              {ex.bodyPart === 'glutes' && '臀'}
                              {ex.bodyPart === 'arms' && '手臂'}
                              {ex.bodyPart === 'core' && '核心'}
                              {!ex.bodyPart && '动作'}
                            </span>
                          </div>
                          {Array.isArray(ex.aliases) && ex.aliases.length > 0 && (
                            <div className="mt-0.5 text-[10px] text-gray-400 truncate">
                              别名：{ex.aliases.join(' / ')}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">
                    重量(kg)
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputWeight}
                    onChange={(e) =>
                      setInputWeight(e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">
                    次数
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inputReps}
                    onChange={(e) =>
                      setInputReps(e.target.value)
                    }
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">
                    RPE
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputRpe}
                    onChange={(e) =>
                      setInputRpe(e.target.value)
                    }
                    placeholder="可选，如 8.5"
                    className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">
                备注
              </span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：今天状态不错，最后一组接近力竭"
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-violet-100">
              <div className="text-xs text-gray-500">
                已添加{' '}
                <span className="font-semibold text-violet-600">
                  {daySets.length}
                </span>{' '}
                组
              </div>
              <button
                type="button"
                onClick={addSet}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium active:scale-95 transition-transform"
              >
                添加一组
              </button>
            </div>

            {daySets.length > 0 && (
              <div className="space-y-3">
                {daySets.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-fuchsia-50/40 border border-gray-100"
                    >
                    <div>
                      <button
                        type="button"
                        onClick={() => openExerciseDetail(s)}
                        className="text-sm font-medium text-gray-800 underline-offset-2 hover:underline"
                      >
                        {s.exercise}
                      </button>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {s.weight} kg × {s.reps} 次
                        {s.rpe != null
                          ? ` · RPE ${s.rpe}`
                          : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSet(s.id)}
                      className="text-xs text-gray-400"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-medium active:scale-95 transition-transform disabled:opacity-60"
              >
                {isSaving ? '保存中...' : '保存今日训练'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 训练统计 */}
      <div className="px-4 mt-4 pb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span>
            最近训练量统计（{statsRangeDays} 天）
          </h3>
          {loadingStats ? (
            <div className="w-full h-48 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : statsData.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">
              暂无训练数据，先记录一次训练吧
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="训练量" fill="#8B5CF6" />
                  <Bar dataKey="组数" fill="#F472B6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 训练计划弹窗 */}
      {showPlanModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowPlanModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-gray-400 text-sm"
              >
                取消
              </button>
              <span className="font-bold text-gray-800">
                {editingPlan ? '编辑训练计划' : '新建训练计划'}
              </span>
              <div className="flex items-center gap-3">
                {editingPlan && (
                  <button
                    onClick={deletePlan}
                    className="text-red-500 text-sm"
                  >
                    删除
                  </button>
                )}
                <button
                  onClick={savePlan}
                  className="text-violet-600 font-medium text-sm"
                >
                  保存
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-20">
                  计划名称
                </span>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) =>
                    setPlanName(e.target.value)
                  }
                  placeholder="例如 推、拉、腿 或 全身 A"
                  className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    动作列表（一行一个）
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={planExercisesText}
                  onChange={(e) =>
                    setPlanExercisesText(e.target.value)
                  }
                  placeholder={
                    '例如：\n卧推\n上斜卧推\n肩推\n双杠臂屈伸'
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedExerciseDetail && (
        <ExerciseDetailModal
          exercise={selectedExerciseDetail}
          onClose={() => setSelectedExerciseDetail(null)}
        />
      )}
    </div>
  )
}

function ExerciseDetailModal({ exercise, onClose }) {
  if (!exercise) return null
  const {
    name,
    difficulty,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    setup,
    execution,
    cues,
    breathing,
    tempo,
    rangeOfMotion,
    commonMistakes,
    safetyTips,
    recommendedRepRange,
    recommendedSets,
    weeklyFrequency,
    notesForWho,
  } = exercise

  const difficultyLabel =
    difficulty === 'beginner'
      ? '新手'
      : difficulty === 'intermediate'
      ? '进阶'
      : '高级'

  const equipmentLabel = Array.isArray(equipment)
    ? equipment
        .map((e) => {
          if (e === 'barbell') return '杠铃'
          if (e === 'dumbbell') return '哑铃'
          if (e === 'machine') return '器械'
          if (e === 'cable') return '拉力器'
          if (e === 'bodyweight') return '自重'
          if (e === 'kettlebell') return '壶铃'
          if (e === 'band') return '弹力带'
          return '其他'
        })
        .join(' / ')
    : ''

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-400 text-sm"
          >
            关闭
          </button>
          <span className="font-bold text-gray-800">{name}</span>
          <span className="text-xs px-2 py-[2px] rounded-full bg-violet-50 text-violet-600">
            {difficultyLabel}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap gap-2 text-[11px]">
            {equipmentLabel && (
              <span className="px2 py-[3px] rounded-full bg-gray-100 text-gray-600 px-2">
                器械：{equipmentLabel}
              </span>
            )}
            {Array.isArray(primaryMuscles) && primaryMuscles.length > 0 && (
              <span className="px-2 py-[3px] rounded-full bg-emerald-50 text-emerald-700">
                主要肌群：{primaryMuscles.join('、')}
              </span>
            )}
            {Array.isArray(secondaryMuscles) && secondaryMuscles.length > 0 && (
              <span className="px-2 py-[3px] rounded-full bg-sky-50 text-sky-700">
                次要肌群：{secondaryMuscles.join('、')}
              </span>
            )}
          </div>

          <Section title="准备动作">
            <List items={setup} />
          </Section>

          <Section title="动作过程">
            <List items={execution} />
          </Section>

          {Array.isArray(cues) && cues.length > 0 && (
            <Section title="关键提示词">
              <List items={cues} bullet="·" />
            </Section>
          )}

          {(breathing || tempo || rangeOfMotion) && (
            <Section title="呼吸与节奏">
              {breathing && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium text-gray-700">
                    呼吸：
                  </span>{' '}
                  {breathing}
                </p>
              )}
              {tempo && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium text-gray-700">
                    建议节奏：
                  </span>{' '}
                  {tempo}
                </p>
              )}
              {rangeOfMotion && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">
                    活动范围：
                  </span>{' '}
                  {rangeOfMotion}
                </p>
              )}
            </Section>
          )}

          {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
            <Section title="常见错误与避坑">
              <List items={commonMistakes} />
            </Section>
          )}

          {Array.isArray(safetyTips) && safetyTips.length > 0 && (
            <Section title="安全提示">
              <List items={safetyTips} />
            </Section>
          )}

          {(recommendedRepRange || recommendedSets || weeklyFrequency) && (
            <Section title="训练编程建议">
              {Array.isArray(recommendedRepRange) &&
                recommendedRepRange.length > 0 && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-gray-700">
                      次数区间：
                    </span>{' '}
                    {recommendedRepRange
                      .map(
                        (r) =>
                          `${r.reps[0]}~${r.reps[1]} 次`
                      )
                      .join('； ')}
                  </p>
                )}
              {Array.isArray(recommendedSets) &&
                recommendedSets.length > 0 && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-gray-700">
                      组数建议：
                    </span>{' '}
                    {recommendedSets
                      .map(
                        (s) =>
                          `${s.level === 'beginner'
                            ? '新手'
                            : s.level === 'intermediate'
                            ? '进阶'
                            : '高级'
                          } ${s.sets[0]}~${s.sets[1]} 组`
                      )
                      .join('； ')}
                  </p>
                )}
              {weeklyFrequency && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">
                    每周频率：
                  </span>{' '}
                  {weeklyFrequency}
                </p>
              )}
            </Section>
          )}

          {notesForWho && (
            <Section title="适合 / 不适合人群">
              {Array.isArray(notesForWho.recommendedFor) &&
                notesForWho.recommendedFor.length > 0 && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-emerald-700">
                      建议：
                    </span>{' '}
                    {notesForWho.recommendedFor.join('； ')}
                  </p>
                )}
              {Array.isArray(notesForWho.avoidIf) &&
                notesForWho.avoidIf.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-red-600">
                      谨慎 / 避免：
                    </span>{' '}
                    {notesForWho.avoidIf.join('； ')}
                  </p>
                )}
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
        <span className="w-1 h-3 rounded-full bg-violet-500" />
        {title}
      </h4>
      {children}
    </div>
  )
}

function List({ items, bullet = '•' }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-1.5 text-xs text-gray-600"
        >
          <span className="mt-[2px] text-[10px] text-violet-500">
            {bullet}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

