/**
 * Bridge 统一导出入口
 * 
 * 使用方式：
 * import bridge from '@/utils/bridge'
 * await bridge.quit.setQuitDate('2024-01-01')
 */

// 导出 Bridge 管理器（主要使用方式）
export { default } from './core/BridgeManager'

// 导出各模块的方法定义（供其他地方引用）
export { QUIT } from './modules/quit'
// export { HABIT } from './modules/habit'
// export { PERIOD } from './modules/period'

// 导出各模块的 Bridge 实现（高级用法）
export { QuitBridge } from './implementations/QuitBridge'
// export { HabitBridge } from './implementations/HabitBridge'
// export { PeriodBridge } from './implementations/PeriodBridge'

// 导出 Hooks
export { useQuitBridge } from './hooks/useQuitBridge'
// export { useHabitBridge } from './hooks/useHabitBridge'
// export { usePeriodBridge } from './hooks/usePeriodBridge'
