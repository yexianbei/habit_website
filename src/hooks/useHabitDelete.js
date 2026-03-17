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
 * @param {number} options.type     习惯类型（与原生 HabitType 枚举对应）
 * @param {string} options.name     习惯名称（用于弹窗文案）
 */
export function useHabitDelete({ type, name }) {
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
      const result = await callNative('habit.deleteWithData', { type })
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
  }, [isInApp, isDeleting, callNative, showToast, closePage, type, name])

  return { deleteHabit, isDeleting }
}
