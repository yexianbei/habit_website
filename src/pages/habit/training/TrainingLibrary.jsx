import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BODY_PARTS, TRAINING_EXERCISES } from './data'

export default function TrainingLibrary() {
  const navigate = useNavigate()
  const [activePartId, setActivePartId] = useState(
    BODY_PARTS[0]?.id || 'chest'
  )

  const grouped = useMemo(() => {
    const map = {}
    BODY_PARTS.forEach((p) => {
      map[p.id] = { part: p, exercises: [] }
    })
    TRAINING_EXERCISES.forEach((ex) => {
      if (!map[ex.bodyPart]) {
        map[ex.bodyPart] = { part: { id: ex.bodyPart, name: ex.bodyPart, desc: '' }, exercises: [] }
      }
      map[ex.bodyPart].exercises.push(ex)
    })
    // 保持 BODY_PARTS 排序
    return BODY_PARTS.map((p) => map[p.id]).filter(Boolean)
  }, [])

  const goDetail = (id) => {
    navigate(`/habit/training/exercise/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50">
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-2xl text-white shadow-md">
            🧠
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">力量训练动作库</h1>
            <p className="text-xs text-gray-500">
              先学动作，再自己组合计划；管理页只负责一组组完成和记录
            </p>
          </div>
        </div>
      </div>

      {/* 顶部部位 Tab */}
      <div className="px-4 pb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            选择身体部位，浏览对应动作
          </span>
          <span className="text-[11px] text-gray-400">
            当前：
            {BODY_PARTS.find((p) => p.id === activePartId)?.name || ''}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {BODY_PARTS.map((part) => {
            const isActive = part.id === activePartId
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => setActivePartId(part.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {part.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 当前部位的动作列表 */}
      <div className="px-4 pb-6">
        {grouped
          .filter(({ part }) => part.id === activePartId)
          .map(({ part, exercises }) => {
            if (!exercises || exercises.length === 0) return null
            return (
              <section
                key={part.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-violet-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-violet-500" />
                      {part.name}
                    </h2>
                    {part.desc && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {part.desc}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    共 {exercises.length} 个动作
                  </span>
                </div>

                <div className="space-y-2">
                  {exercises.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => goDetail(ex.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-gray-50 to-fuchsia-50/40 border border-gray-100 active:scale-[0.99] transition-transform"
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {ex.name}
                          </span>
                          {ex.difficulty && (
                            <span className="px-2 py-[1px] rounded-full bg-violet-100 text-[10px] text-violet-700">
                              {ex.difficulty === 'beginner'
                                ? '新手'
                                : ex.difficulty === 'intermediate'
                                ? '进阶'
                                : '高级'}
                            </span>
                          )}
                        </div>
                        {Array.isArray(ex.primaryMuscles) &&
                          ex.primaryMuscles.length > 0 && (
                            <p className="text-[11px] text-gray-500 truncate">
                              主要肌群：{ex.primaryMuscles.join('、')}
                            </p>
                          )}
                      </div>
                      <span className="ml-3 text-[11px] text-violet-500">
                        查看教学 →
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
      </div>
    </div>
  )
}

