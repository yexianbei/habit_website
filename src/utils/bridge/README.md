# Bridge 架构设计文档

## 📐 架构设计原则

### 1. 模块化设计
- 每个功能模块独立封装
- 模块之间低耦合，高内聚
- 新功能只需添加新模块，不影响现有代码

### 2. 目录结构
```
src/utils/bridge/
├── core/                    # 核心 Bridge 实现
│   ├── BaseBridge.js       # 基础 Bridge 类（平台检测、通信等）
│   └── BridgeManager.js    # Bridge 管理器（组合所有模块）
├── modules/                # 各功能模块的方法定义
│   ├── habit.js           # 习惯模块方法定义
│   ├── period.js          # 经期管理模块方法定义
│   ├── quit.js            # 戒烟模块方法定义
│   └── index.js           # 统一导出
├── implementations/        # 各功能模块的 Bridge 实现类
│   ├── HabitBridge.js     # 习惯模块 Bridge
│   ├── PeriodBridge.js    # 经期管理模块 Bridge
│   ├── QuitBridge.js      # 戒烟模块 Bridge
│   └── index.js           # 统一导出
└── hooks/                  # React Hooks
    ├── useHabitBridge.js   # 习惯模块 Hook
    ├── usePeriodBridge.js  # 经期管理模块 Hook
    ├── useQuitBridge.js    # 戒烟模块 Hook
    └── index.js            # 统一导出
```

## 🔧 使用方式

### 方式 1: 使用统一的 Bridge 管理器（推荐）
```javascript
import bridge from '@/utils/bridge'

// 调用习惯模块方法
await bridge.habit.createHabit({ name: '跑步' })

// 调用经期管理模块方法
await bridge.period.saveRecord({ ... })

// 调用戒烟模块方法
await bridge.quit.setQuitDate('2024-01-01')
```

### 方式 2: 使用独立的模块 Bridge
```javascript
import { quitBridge } from '@/utils/bridge/implementations'

await quitBridge.setQuitDate('2024-01-01')
```

### 方式 3: 使用 React Hook
```javascript
import { useQuitBridge } from '@/utils/bridge/hooks'

function MyComponent() {
  const { setQuitDate, getQuitDate, getStats } = useQuitBridge()
  
  const handleSetDate = async () => {
    await setQuitDate('2024-01-01')
  }
}
```

## 📝 添加新模块的步骤

### 1. 定义方法常量
在 `modules/新模块名.js` 中定义：
```javascript
export const QUIT = {
  SET_QUIT_DATE: 'quit.setQuitDate',
  GET_QUIT_DATE: 'quit.getQuitDate',
  // ...
}
```

### 2. 实现 Bridge 类
在 `implementations/新模块名Bridge.js` 中实现：
```javascript
import { BaseBridge } from '../core/BaseBridge'
import { QUIT } from '../modules/quit'

export class QuitBridge extends BaseBridge {
  setQuitDate(date) {
    return this.callNative(QUIT.SET_QUIT_DATE, { date })
  }
  // ...
}
```

### 3. 注册到 BridgeManager
在 `core/BridgeManager.js` 中注册：
```javascript
import { QuitBridge } from '../implementations/QuitBridge'

class BridgeManager extends BaseBridge {
  constructor() {
    super()
    this.quit = new QuitBridge(this)
  }
}
```

### 4. 创建 Hook（可选）
在 `hooks/use新模块名Bridge.js` 中创建：
```javascript
import { useBridge } from './useBridge'

export function useQuitBridge() {
  const bridge = useBridge()
  return {
    setQuitDate: bridge.quit.setQuitDate.bind(bridge.quit),
    // ...
  }
}
```

## ✅ 优势

1. **低耦合**：每个模块独立，互不影响
2. **易扩展**：添加新功能只需添加新模块
3. **易维护**：代码组织清晰，职责分明
4. **易测试**：每个模块可以独立测试
5. **类型安全**：每个模块的方法定义清晰
