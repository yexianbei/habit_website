/**
 * BridgeManager - Bridge 管理器
 * 统一管理所有功能模块的 Bridge
 * 
 * 使用方式：
 * import bridge from '@/utils/bridge'
 * 
 * await bridge.quit.setQuitDate('2024-01-01')
 * await bridge.period.saveRecord({ ... })
 */

import { BaseBridge } from './BaseBridge'
import { QuitBridge } from '../implementations/QuitBridge'
// 其他模块的 Bridge 在这里导入
// import { HabitBridge } from '../implementations/HabitBridge'
// import { PeriodBridge } from '../implementations/PeriodBridge'

export class BridgeManager extends BaseBridge {
  constructor() {
    super() // 初始化核心功能
    
    // 初始化各功能模块的 Bridge
    // 传入 this 作为 parentBridge，让子模块复用核心功能
    this.quit = new QuitBridge(this)
    // this.habit = new HabitBridge(this)
    // this.period = new PeriodBridge(this)
    
    // 等待就绪
    this.ready().then(() => {
      console.log('[BridgeManager] Bridge 已就绪')
    })
  }
}

// 创建单例
const bridgeManager = new BridgeManager()

export default bridgeManager
