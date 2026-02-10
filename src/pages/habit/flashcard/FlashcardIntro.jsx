import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../../utils/useNativeBridge'

export default function FlashcardIntro() {
  const { 
    isInApp, 
    callNative,
    setTitle,
    showToast, 
    showLoading, 
    hideLoading,
    closePage,
    navigateTo,
  } = useNativeBridge()

  const [isAdding, setIsAdding] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)

  const pageTitle = '记忆闪卡介绍'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  useEffect(() => {
    if (isInApp) {
      checkIfAdded()
    }
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      const result = await callNative('habit.getList', { type: 21 })
      if (result && result.habits && Array.isArray(result.habits) && result.habits.length > 0) {
        setHasAdded(true)
      } else {
        setHasAdded(false)
      }
    } catch (error) {
      console.error('[FlashcardIntro] 检查习惯失败:', error)
      setHasAdded(false)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    if (hasAdded) return

    setIsAdding(true)
    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        type: 21,  // 闪卡记忆类型
        name: '记忆闪卡',
        icon: 'habit_35',
        bgColor: '#579d91',
        description: '使用闪卡法复习知识点，巩固记忆'
      })
      await hideLoading()

      const isSuccess = result && (
        result.success === true ||
        (result.habitId && result.habitId.length > 0)
      )

      if (isSuccess) {
        await showToast('已添加到首页')
        setHasAdded(true)
        setTimeout(async () => {
          await closePage()
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        await showToast(errorMsg)
      }
    } catch (e) {
      await hideLoading()
      console.error('[FlashcardIntro] 添加异常:', e)
      await showToast('添加失败: ' + (e?.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await navigateTo('https://tinyhabits.top/habit/flashcard')
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">记忆闪卡</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      <div className="px-6 pt-10 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">记忆闪卡</h2>
                <p className="text-sm text-gray-500">用闪卡法高效复习</p>
              </div>
            </div>

            <div className="space-y-4 mt-6 text-sm text-gray-700">
              <p>· 把知识点拆成「问题-答案」的小卡片，更容易坚持复习。</p>
              <p>· 支持导入题库 / 手动添加，自动记录学习进度。</p>
              <p>· 通过重复和间隔复习，帮助你长期记住重要内容。</p>
            </div>

            <div className="mt-6">
              {hasAdded ? (
                <button
                  onClick={handleEnter}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium shadow-lg shadow-indigo-200"
                >
                  进入记忆闪卡
                </button>
              ) : (
                <button
                  onClick={handleAddHabit}
                  disabled={isAdding}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium shadow-lg shadow-indigo-200 disabled:opacity-60"
                >
                  {isAdding ? '添加中...' : '添加到首页'}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              添加后可在首页快速进入闪卡复习
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 闪卡记忆介绍页
 * 参考经期 / 戒烟介绍页，用于在习惯库中添加「闪卡记忆」习惯
 */
import React, { useEffect, useState } from 'react'
import { useNativeBridge } from '../../../utils/useNativeBridge'

export default function FlashcardIntro() {
  const {
    isInApp,
    callNative,
    setTitle,
    showToast,
    showLoading,
    hideLoading,
    closePage,
    navigateTo,
  } = useNativeBridge()

  const [isAdding, setIsAdding] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)

  const pageTitle = '闪卡记忆介绍'

  useEffect(() => {
    document.title = pageTitle
  }, [])

  useEffect(() => {
    if (isInApp) {
      setTitle(pageTitle)
    }
  }, [isInApp, setTitle])

  // 检查是否已添加闪卡记忆习惯
  useEffect(() => {
    checkIfAdded()
  }, [isInApp])

  const checkIfAdded = async () => {
    if (!isInApp) return
    try {
      // 21 = HabitTypeFlashcard
      const result = await callNative('habit.getList', { type: 21 })
      if (result && Array.isArray(result.habits) && result.habits.length > 0) {
        setHasAdded(true)
      } else {
        setHasAdded(false)
      }
    } catch (error) {
      console.error('[FlashcardIntro] 检查习惯失败:', error)
      setHasAdded(false)
    }
  }

  const handleAddHabit = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }

    if (hasAdded) {
      await navigateTo('https://tinyhabits.top/habit/flashcard')
      return
    }

    setIsAdding(true)

    try {
      await showLoading('添加中...')
      const result = await callNative('habit.create', {
        // 对齐 iOS 端 HabitTypeFlashcard = 21
        type: 21,
        name: '闪卡记忆',
        icon: 'ic_habit_lib_flashcard',
        bgColor: '#FF8A3D',
        description: '用间隔重复法记单词、知识点',
      })
      await hideLoading()

      const isSuccess =
        result &&
        (result.success === true || (result.habitId && result.habitId.length > 0))

      if (isSuccess) {
        await showToast('添加成功，请在首页查看')
        setHasAdded(true)
        setTimeout(async () => {
          try {
            await closePage()
          } catch (error) {
            console.error('[FlashcardIntro] 关闭页面失败:', error)
          }
        }, 1200)
      } else {
        const errorMsg = result?.message || '添加失败，请重试'
        console.error('[FlashcardIntro] 添加失败:', errorMsg, result)
        await showToast(errorMsg)
      }
    } catch (error) {
      await hideLoading()
      console.error('[FlashcardIntro] 添加异常:', error)
      await showToast('添加失败: ' + (error.message || '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleEnter = async () => {
    if (!isInApp) {
      alert('请在 App 内使用此功能')
      return
    }
    await navigateTo('https://tinyhabits.top/habit/flashcard')
  }

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">闪卡记忆</h1>
          <p className="text-gray-500 text-sm mb-4">请在小习惯 App 内使用此功能</p>
          <a
            href="https://apps.apple.com/app/id1455083310"
            className="inline-block px-6 py-2 bg-indigo-500 text-white rounded-full text-sm"
          >
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      <div className="relative pt-8 pb-10 px-6">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-100/60 to-transparent" />

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl text-white shadow-md">
            🃏
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">闪卡记忆</h1>
            <p className="text-gray-500 text-sm">用间隔重复法记单词、知识点</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '📚', title: '多卡组管理', desc: '按单词书 / 知识主题分组管理' },
            { icon: '⏰', title: '间隔重复', desc: '结合记忆曲线安排复习节奏' },
            { icon: '📈', title: '掌握度统计', desc: '已掌握 / 待复习一目了然' },
            { icon: '⌛️', title: '碎片时间学习', desc: '地铁 / 排队时刷几张卡' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            使用说明
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>添加后，在首页点击即可进入闪卡记忆</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>在闪卡页面可以导入单词 / 知识点，或手动新建卡组</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>每日根据待复习数量，完成当天的复习任务</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-6 pb-6">
        <button
          disabled={isAdding}
          onClick={hasAdded ? handleEnter : handleAddHabit}
          className="w-full py-3 rounded-2xl text-white font-medium shadow-md shadow-indigo-200
                     bg-gradient-to-r from-indigo-500 to-purple-500 active:scale-98 disabled:opacity-70"
        >
          {hasAdded ? '进入闪卡记忆' : isAdding ? '添加中...' : '添加到习惯'}
        </button>
      </div>
    </div>
  )
}

