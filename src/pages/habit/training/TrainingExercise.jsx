import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TRAINING_EXERCISES } from './data'

export default function TrainingExercise() {
  const { id } = useParams()
  const navigate = useNavigate()

  const exercise = TRAINING_EXERCISES.find((ex) => ex.id === id)

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">暂未找到对应动作</p>
          <button
            type="button"
            onClick={() => navigate('/habit/training/library')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium"
          >
            返回动作库
          </button>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-fuchsia-50">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-full text-xs text-gray-500 bg-white/60 border border-gray-200"
        >
          ← 返回
        </button>
        <button
          type="button"
          onClick={() => navigate('/habit/training')}
          className="px-3 py-1.5 rounded-full text-xs text-violet-600 bg-violet-50 border border-violet-100"
        >
          去记录训练
        </button>
      </div>

      <div className="px-6 pb-2">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-3xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold mb-1">{name}</h1>
              <p className="text-xs text-white/80">
                器械：{equipmentLabel || '—'}
              </p>
            </div>
            <span className="px-2 py-[2px] rounded-full bg-white/15 text-[11px]">
              难度：{difficultyLabel}
            </span>
          </div>
          {Array.isArray(primaryMuscles) && primaryMuscles.length > 0 && (
            <p className="text-[11px] text-white/80">
              主要肌群：{primaryMuscles.join('、')}
            </p>
          )}
          {Array.isArray(secondaryMuscles) && secondaryMuscles.length > 0 && (
            <p className="mt-1 text-[11px] text-white/70">
              次要肌群：{secondaryMuscles.join('、')}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-8 space-y-5">
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
                <span className="font-medium text-gray-700">呼吸：</span>{' '}
                {breathing}
              </p>
            )}
            {tempo && (
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium text-gray-700">建议节奏：</span>{' '}
                {tempo}
              </p>
            )}
            {rangeOfMotion && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-gray-700">活动范围：</span>{' '}
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
                      (r) => `${r.reps[0]}~${r.reps[1]} 次`
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
                    .map((s) => {
                      const level =
                        s.level === 'beginner'
                          ? '新手'
                          : s.level === 'intermediate'
                          ? '进阶'
                          : '高级'
                      return `${level} ${s.sets[0]}~${s.sets[1]} 组`
                    })
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
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
        <span className="w-1 h-3 rounded-full bg-violet-500" />
        {title}
      </h2>
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

