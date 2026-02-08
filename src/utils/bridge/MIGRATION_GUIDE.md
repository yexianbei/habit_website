# Bridge 架构迁移指南

## 📋 概述

新的 Bridge 架构采用模块化设计，每个功能模块独立封装，方便扩展和维护。

## 🎯 架构优势

1. **低耦合**：每个模块独立，互不影响
2. **易扩展**：添加新功能只需添加新模块
3. **易维护**：代码组织清晰，职责分明
4. **向后兼容**：保留原有 Bridge 代码，逐步迁移

## 📁 目录结构

```
src/utils/bridge/
├── core/                    # 核心 Bridge 实现
│   ├── BaseBridge.js       # 基础 Bridge 类
│   └── BridgeManager.js    # Bridge 管理器
├── modules/                # 各功能模块的方法定义
│   └── quit.js            # 戒烟模块方法定义
├── implementations/        # 各功能模块的 Bridge 实现类
│   └── QuitBridge.js      # 戒烟模块 Bridge
├── hooks/                  # React Hooks
│   └── useQuitBridge.js   # 戒烟模块 Hook
├── README.md               # 架构文档
├── MIGRATION_GUIDE.md      # 本文件
└── index.js               # 统一导出
```

## 🚀 使用方式

### 方式 1: 使用统一的 Bridge 管理器（推荐）

```javascript
import bridge from '@/utils/bridge'

// 调用戒烟模块方法
await bridge.quit.setQuitDate('2024-01-01')
const stats = await bridge.quit.getStats()
```

### 方式 2: 使用 React Hook

```javascript
import { useQuitBridge } from '@/utils/bridge'

function MyComponent() {
  const { setQuitDate, getQuitDate, getStats } = useQuitBridge()
  
  const handleSetDate = async () => {
    await setQuitDate('2024-01-01')
    const date = await getQuitDate()
    const stats = await getStats()
  }
}
```

## 📝 添加新模块的步骤

### 步骤 1: 定义方法常量

创建 `modules/新模块名.js`：

```javascript
export const NEW_MODULE = {
  ACTION_1: 'newModule.action1',
  ACTION_2: 'newModule.action2',
}
```

### 步骤 2: 实现 Bridge 类

创建 `implementations/新模块名Bridge.js`：

```javascript
import { BaseBridge } from '../core/BaseBridge'
import { NEW_MODULE } from '../modules/新模块名'

export class NewModuleBridge extends BaseBridge {
  constructor(parentBridge) {
    super(parentBridge)
  }

  action1(params) {
    return this.callNative(NEW_MODULE.ACTION_1, params)
  }
}
```

### 步骤 3: 注册到 BridgeManager

修改 `core/BridgeManager.js`：

```javascript
import { NewModuleBridge } from '../implementations/NewModuleBridge'

export class BridgeManager extends BaseBridge {
  constructor() {
    super()
    this.quit = new QuitBridge(this)
    this.newModule = new NewModuleBridge(this) // 添加这行
  }
}
```

### 步骤 4: 创建 Hook（可选）

创建 `hooks/use新模块名Bridge.js`：

```javascript
import { useCallback } from 'react'
import bridge from '../core/BridgeManager'

export function useNewModuleBridge() {
  const action1 = useCallback((params) => {
    return bridge.newModule.action1(params)
  }, [])

  return {
    action1,
    isInApp: bridge.isInApp(),
    platform: bridge.getPlatform(),
  }
}
```

### 步骤 5: 导出

修改 `index.js`：

```javascript
export { NEW_MODULE } from './modules/新模块名'
export { NewModuleBridge } from './implementations/NewModuleBridge'
export { useNewModuleBridge } from './hooks/use新模块名Bridge'
```

## 🔄 从旧架构迁移

### 旧代码（NativeBridge.js）

```javascript
import bridge from '@/utils/NativeBridge'
await bridge.savePeriodRecord({ ... })
```

### 新代码（推荐）

```javascript
import bridge from '@/utils/bridge'
await bridge.period.saveRecord({ ... })
```

### 或者使用 Hook

```javascript
import { usePeriodBridge } from '@/utils/bridge'
const { saveRecord } = usePeriodBridge()
await saveRecord({ ... })
```

## ⚠️ 注意事项

1. **向后兼容**：旧的 `NativeBridge.js` 仍然可用，不会影响现有代码
2. **逐步迁移**：可以逐步将现有模块迁移到新架构
3. **命名规范**：方法名使用驼峰命名，常量使用大写+下划线
4. **错误处理**：所有方法都返回 Promise，需要处理错误

## 📚 示例：完整的戒烟模块使用

```javascript
import { useQuitBridge } from '@/utils/bridge'

function QuitManagement() {
  const {
    setQuitDate,
    getQuitDate,
    getStats,
    saveRecord,
    getRecords,
    isInApp,
  } = useQuitBridge()

  useEffect(() => {
    if (!isInApp) return

    const loadData = async () => {
      try {
        // 获取戒烟日期
        const quitDate = await getQuitDate()
        
        // 获取统计数据
        const stats = await getStats()
        console.log('戒烟天数:', stats.days)
        console.log('节省金额:', stats.savedMoney)
        
        // 获取记录
        const records = await getRecords('2024-01-01', '2024-12-31')
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }

    loadData()
  }, [getQuitDate, getStats, getRecords, isInApp])

  const handleSetDate = async () => {
    try {
      await setQuitDate('2024-01-01')
      console.log('设置成功')
    } catch (error) {
      console.error('设置失败:', error)
    }
  }

  return (
    <div>
      <button onClick={handleSetDate}>设置戒烟日期</button>
    </div>
  )
}
```

## ✅ 检查清单

添加新模块时，确保：

- [ ] 方法常量已定义（`modules/`）
- [ ] Bridge 类已实现（`implementations/`）
- [ ] 已注册到 BridgeManager
- [ ] Hook 已创建（可选）
- [ ] 已导出（`index.js`）
- [ ] 已测试基本功能
- [ ] 已更新文档
