/**
 * useHabitDelete
 *
 * 通用习惯删除 hook，供各习惯管理页调用。
 * 调用后会弹确认框，确认后删除习惯及全部打卡数据，并关闭当前页面。
 *
 * 用法：
 *   const { deleteHabit, isDeleting } = useHabitDelete({ type: 16, name: '经期管理' })
 *   <button onClick={deleteHabit}>删除习惯</button>
 */

import { useState, useCallback } from 'react'
import { useNativeBridge } from '../utils/useNativeBridge'

/**
 * @param {object} options
 * @param {number} [options.type]           习惯类型（与原生 HabitType 枚举对应）
 * @param {string} options.name             习惯名称（用于弹窗文案）
 * @param {string} [options.habitId]        优先使用：精确删除该习惯（多 H5 习惯共存时必传）
 * @param {() => Promise<string|null>} [options.resolveHabitId]  无 habitId 时异步解析 habitId
 * @param {() => Promise<void>} [options.beforeDelete]           本地删除前的前置动作（如先删云端数据）
 */
export function useHabitDelete({ type, name, habitId: habitIdProp, resolveHabitId, beforeDelete }) {
  const { isInApp, callNative, showToast, closePage } = useNativeBridge()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteHabit = useCallback(async () => {
    if (!isInApp || isDeleting) return

    // 弹二次确认框
    let confirmed = false
    try {
      const result = await callNative('ui.showConfirm', {
        title: `删除${name}`,
        message: `确定要删除「${name}」吗？\n删除后该习惯及全部打卡记录将被清除，且无法恢复。`,
      })
      confirmed = result?.confirmed === true
    } catch {
      return
    }

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await callNative('ui.showLoading', { message: '删除中...' })
      if (typeof beforeDelete === 'function') {
        await beforeDelete()
      }
      let habitId = habitIdProp
      if (!habitId && typeof resolveHabitId === 'function') {
        try {
          habitId = await resolveHabitId()
        } catch {
          habitId = null
        }
      }
      let result
      if (habitId) {
        result = await callNative('habit.deleteWithData', { habitId })
      } else if (type != null) {
        result = await callNative('habit.deleteWithData', { type })
      } else {
        await callNative('ui.hideLoading', {})
        await showToast('无法定位习惯，请从首页重新进入')
        setIsDeleting(false)
        return
      }
      await callNative('ui.hideLoading', {})

      if (result?.success) {
        await showToast(`「${name}」已删除`)
        // 短暂延迟后关闭页面，回到习惯库或首页
        setTimeout(() => closePage(), 800)
      } else {
        await showToast('删除失败，请重试')
      }
    } catch (e) {
      await callNative('ui.hideLoading', {})
      await showToast('删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }, [isInApp, isDeleting, callNative, showToast, closePage, type, name, habitIdProp, resolveHabitId, beforeDelete])

  return { deleteHabit, isDeleting }
}
