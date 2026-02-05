/**
 * useNativeBridge - React Hook 封装
 * 
 * 使用方式：
 * const { isInApp, platform, callNative, showToast, ... } = useNativeBridge()
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import bridge from './NativeBridge'

/**
 * NativeBridge 的 React Hook 封装
 */
export function useNativeBridge() {
  const [isReady, setIsReady] = useState(bridge.isReady)
  const [platform, setPlatform] = useState(bridge.getPlatform())

  useEffect(() => {
    bridge.ready().then(() => {
      setIsReady(true)
      setPlatform(bridge.getPlatform())
    })
  }, [])

  // Memoize 常用方法
  const methods = useMemo(() => ({
    // 核心方法
    callNative: bridge.callNative.bind(bridge),
    isInApp: bridge.isInApp.bind(bridge),
    getPlatform: bridge.getPlatform.bind(bridge),
    
    // 事件
    on: bridge.on.bind(bridge),
    off: bridge.off.bind(bridge),
    once: bridge.once.bind(bridge),
    
    // 习惯相关
    createHabit: bridge.createHabit.bind(bridge),
    updateHabit: bridge.updateHabit.bind(bridge),
    deleteHabit: bridge.deleteHabit.bind(bridge),
    getHabitList: bridge.getHabitList.bind(bridge),
    getHabitDetail: bridge.getHabitDetail.bind(bridge),
    checkIn: bridge.checkIn.bind(bridge),
    cancelCheckIn: bridge.cancelCheckIn.bind(bridge),
    getCheckInRecords: bridge.getCheckInRecords.bind(bridge),
    
    // 经期管理
    savePeriodRecord: bridge.savePeriodRecord.bind(bridge),
    getPeriodRecords: bridge.getPeriodRecords.bind(bridge),
    predictNextPeriod: bridge.predictNextPeriod.bind(bridge),
    setPeriodReminder: bridge.setPeriodReminder.bind(bridge),
    getPeriodSettings: bridge.getPeriodSettings.bind(bridge),
    updatePeriodSettings: bridge.updatePeriodSettings.bind(bridge),
    
    // 用户相关
    getUserInfo: bridge.getUserInfo.bind(bridge),
    isVIP: bridge.isVIP.bind(bridge),
    getUserSettings: bridge.getUserSettings.bind(bridge),
    
    // UI 相关
    showToast: bridge.showToast.bind(bridge),
    showAlert: bridge.showAlert.bind(bridge),
    showConfirm: bridge.showConfirm.bind(bridge),
    showLoading: bridge.showLoading.bind(bridge),
    hideLoading: bridge.hideLoading.bind(bridge),
    closePage: bridge.closePage.bind(bridge),
    setTitle: bridge.setTitle.bind(bridge),
    setNavBarColor: bridge.setNavBarColor.bind(bridge),
    share: bridge.share.bind(bridge),
    navigateTo: bridge.navigateTo.bind(bridge),
    showActionSheet: bridge.showActionSheet.bind(bridge),
    showDatePicker: bridge.showDatePicker.bind(bridge),
    showTimePicker: bridge.showTimePicker.bind(bridge),
    
    // 设备相关
    getDeviceInfo: bridge.getDeviceInfo.bind(bridge),
    vibrate: bridge.vibrate.bind(bridge),
    copyToClipboard: bridge.copyToClipboard.bind(bridge),
    openSettings: bridge.openSettings.bind(bridge),
    
    // 存储相关
    getStorage: bridge.getStorage.bind(bridge),
    setStorage: bridge.setStorage.bind(bridge),
    removeStorage: bridge.removeStorage.bind(bridge),
  }), [])

  return {
    isReady,
    platform,
    isInApp: bridge.isInApp(),
    ...methods
  }
}

/**
 * 监听原生事件的 Hook
 * @param {string} event - 事件名称
 * @param {function} callback - 回调函数
 */
export function useNativeEvent(event, callback) {
  useEffect(() => {
    const unsubscribe = bridge.on(event, callback)
    return unsubscribe
  }, [event, callback])
}

/**
 * 异步调用原生方法的 Hook
 * @param {string} method - 方法名
 * @param {object} params - 参数
 * @param {object} options - 选项
 */
export function useNativeCall(method, params = {}, options = {}) {
  const { immediate = true, defaultValue = null } = options
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await bridge.callNative(method, overrideParams || params)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [method, JSON.stringify(params)])

  useEffect(() => {
    if (immediate && bridge.isInApp()) {
      execute()
    }
  }, [immediate, execute])

  return { data, loading, error, execute, refresh: execute }
}

/**
 * 获取用户信息的 Hook
 */
export function useUserInfo() {
  return useNativeCall('user.getInfo', {}, { immediate: true })
}

/**
 * 检查 VIP 状态的 Hook
 */
export function useVIPStatus() {
  const { data, loading, error, refresh } = useNativeCall('user.isVIP', {}, { 
    immediate: true,
    defaultValue: false 
  })
  return { isVIP: data, loading, error, refresh }
}

/**
 * 获取习惯列表的 Hook
 */
export function useHabitList(params = {}) {
  return useNativeCall('habit.getList', params, { immediate: true })
}

/**
 * 获取经期记录的 Hook
 */
export function usePeriodRecords(startDate, endDate) {
  return useNativeCall('period.getRecords', { startDate, endDate }, { 
    immediate: !!(startDate && endDate) 
  })
}

export default useNativeBridge
