/**
 * 戒烟模块 - Bridge 方法名常量定义
 * 保持 iOS / Android / H5 三端一致
 * 
 * 命名规范：模块.操作
 * 例如：quit.setQuitDate, quit.getStats
 */

export const QUIT = {
  // 戒烟日期管理
  SET_QUIT_DATE: 'quit.setQuitDate',        // 设置戒烟日期
  GET_QUIT_DATE: 'quit.getQuitDate',        // 获取戒烟日期
  
  // 记录管理
  SAVE_RECORD: 'quit.saveRecord',           // 保存记录（心情、状态等）
  GET_RECORDS: 'quit.getRecords',           // 获取记录列表
  DELETE_RECORD: 'quit.deleteRecord',       // 删除记录
  
  // 统计数据
  GET_STATS: 'quit.getStats',               // 获取统计数据（天数、金额、健康等）
  GET_DAILY_COST: 'quit.getDailyCost',      // 获取每日吸烟花费
  SET_DAILY_COST: 'quit.setDailyCost',      // 设置每日吸烟花费
  
  // 激励系统
  GET_MOTIVATION: 'quit.getMotivation',     // 获取激励内容
  GET_MILESTONES: 'quit.getMilestones',      // 获取里程碑列表
  MARK_MILESTONE: 'quit.markMilestone',     // 标记里程碑已读
  
  // 设置
  GET_SETTINGS: 'quit.getSettings',         // 获取设置
  UPDATE_SETTINGS: 'quit.updateSettings',   // 更新设置
  
  // 渐进式戒烟
  SET_GRADUAL_PLAN: 'quit.setGradualPlan',           // 设置渐进式戒烟计划
  GET_GRADUAL_PLAN: 'quit.getGradualPlan',           // 获取渐进式戒烟计划
  SAVE_DAILY_COUNT: 'quit.saveDailyCount',           // 保存每日吸烟根数
  GET_DAILY_COUNT: 'quit.getDailyCount',             // 获取指定日期的吸烟根数
  GET_COUNT_RECORDS: 'quit.getCountRecords',         // 获取吸烟根数记录列表
  GET_GRADUAL_STATS: 'quit.getGradualStats',         // 获取渐进式戒烟统计数据
  GET_LAST_SMOKE_TIME: 'quit.getLastSmokeTime',      // 获取上次吸烟时间
}

// 导出默认对象（兼容性）
export default QUIT
