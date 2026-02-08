/**
 * useQuitBridge - 戒烟模块的 React Hook
 * 
 * 使用方式：
 * const { setQuitDate, getQuitDate, getStats } = useQuitBridge()
 */

import { useCallback } from 'react'
import bridge from '../core/BridgeManager'

/**
 * 戒烟模块 Hook
 * @returns {object} 戒烟相关的所有方法
 */
export function useQuitBridge() {
  // 戒烟日期管理
  const setQuitDate = useCallback((date) => {
    return bridge.quit.setQuitDate(date)
  }, [])

  const getQuitDate = useCallback(() => {
    return bridge.quit.getQuitDate()
  }, [])

  // 记录管理
  const saveRecord = useCallback((record) => {
    return bridge.quit.saveRecord(record)
  }, [])

  const getRecords = useCallback((startDate, endDate) => {
    return bridge.quit.getRecords(startDate, endDate)
  }, [])

  const deleteRecord = useCallback((date) => {
    return bridge.quit.deleteRecord(date)
  }, [])

  // 统计数据
  const getStats = useCallback(() => {
    return bridge.quit.getStats()
  }, [])

  const getDailyCost = useCallback(() => {
    return bridge.quit.getDailyCost()
  }, [])

  const setDailyCost = useCallback((cost) => {
    return bridge.quit.setDailyCost(cost)
  }, [])

  // 激励系统
  const getMotivation = useCallback((type) => {
    return bridge.quit.getMotivation(type)
  }, [])

  const getMilestones = useCallback(() => {
    return bridge.quit.getMilestones()
  }, [])

  const markMilestone = useCallback((milestoneId) => {
    return bridge.quit.markMilestone(milestoneId)
  }, [])

  // 设置
  const getSettings = useCallback(() => {
    return bridge.quit.getSettings()
  }, [])

  const updateSettings = useCallback((settings) => {
    return bridge.quit.updateSettings(settings)
  }, [])

  return {
    // 戒烟日期管理
    setQuitDate,
    getQuitDate,
    
    // 记录管理
    saveRecord,
    getRecords,
    deleteRecord,
    
    // 统计数据
    getStats,
    getDailyCost,
    setDailyCost,
    
    // 激励系统
    getMotivation,
    getMilestones,
    markMilestone,
    
    // 设置
    getSettings,
    updateSettings,
    
    // 平台信息
    isInApp: bridge.isInApp(),
    platform: bridge.getPlatform(),
  }
}
