/**
 * QuitBridge - 戒烟模块 Bridge 实现
 * 提供戒烟相关的所有原生方法调用
 */

import { BaseBridge } from '../core/BaseBridge'
import { QUIT } from '../modules/quit'

export class QuitBridge extends BaseBridge {
  constructor(parentBridge) {
    super(parentBridge)
  }

  // ==================== 戒烟日期管理 ====================

  /**
   * 设置戒烟日期
   * @param {string} date - 戒烟日期 (YYYY-MM-DD)
   * @returns {Promise<object>}
   */
  setQuitDate(date) {
    return this.callNative(QUIT.SET_QUIT_DATE, { date })
  }

  /**
   * 获取戒烟日期
   * @returns {Promise<string|null>} 返回日期字符串或 null
   */
  getQuitDate() {
    return this.callNative(QUIT.GET_QUIT_DATE)
  }

  // ==================== 记录管理 ====================

  /**
   * 保存记录
   * @param {object} record - 记录数据
   * @param {string} record.date - 日期 (YYYY-MM-DD)
   * @param {object} record.details - 详情（心情、状态等）
   * @returns {Promise<object>}
   */
  saveRecord(record) {
    return this.callNative(QUIT.SAVE_RECORD, record)
  }

  /**
   * 获取记录列表
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {Promise<{records: Array}>}
   */
  getRecords(startDate, endDate) {
    return this.callNative(QUIT.GET_RECORDS, { startDate, endDate })
  }

  /**
   * 删除记录
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @returns {Promise<void>}
   */
  deleteRecord(date) {
    return this.callNative(QUIT.DELETE_RECORD, { date })
  }

  // ==================== 统计数据 ====================

  /**
   * 获取统计数据
   * @returns {Promise<object>}
   * @returns {Promise<{days: number, savedMoney: number, healthData: object}>}
   */
  getStats() {
    return this.callNative(QUIT.GET_STATS)
  }

  /**
   * 获取每日吸烟花费
   * @returns {Promise<number>}
   */
  getDailyCost() {
    return this.callNative(QUIT.GET_DAILY_COST)
  }

  /**
   * 设置每日吸烟花费
   * @param {number} cost - 每日花费（元）
   * @returns {Promise<void>}
   */
  setDailyCost(cost) {
    return this.callNative(QUIT.SET_DAILY_COST, { cost })
  }

  // ==================== 激励系统 ====================

  /**
   * 获取激励内容
   * @param {string} type - 激励类型（可选）
   * @returns {Promise<object>}
   */
  getMotivation(type) {
    return this.callNative(QUIT.GET_MOTIVATION, type ? { type } : {})
  }

  /**
   * 获取里程碑列表
   * @returns {Promise<Array>}
   */
  getMilestones() {
    return this.callNative(QUIT.GET_MILESTONES)
  }

  /**
   * 标记里程碑已读
   * @param {string} milestoneId - 里程碑ID
   * @returns {Promise<void>}
   */
  markMilestone(milestoneId) {
    return this.callNative(QUIT.MARK_MILESTONE, { milestoneId })
  }

  // ==================== 设置 ====================

  /**
   * 获取设置
   * @returns {Promise<object>}
   */
  getSettings() {
    return this.callNative(QUIT.GET_SETTINGS)
  }

  /**
   * 更新设置
   * @param {object} settings - 设置数据
   * @returns {Promise<void>}
   */
  updateSettings(settings) {
    return this.callNative(QUIT.UPDATE_SETTINGS, settings)
  }
}
