# Bridge 架构设计说明

## 🎯 设计目标

1. **模块化**：每个功能模块独立封装，互不干扰
2. **可扩展**：添加新功能只需添加新模块，无需修改现有代码
3. **低耦合**：模块之间通过统一的 Bridge 管理器通信
4. **易维护**：代码组织清晰，职责分明

## 📐 架构设计

### 核心思想

```
┌─────────────────────────────────────────┐
│         BridgeManager (单例)              │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Quit    │  │  Period  │  │  Habit  ││
│  │  Bridge  │  │  Bridge  │  │  Bridge ││
│  └──────────┘  └──────────┘  └─────────┘│
│       ↓              ↓              ↓     │
│  ┌─────────────────────────────────────┐ │
│  │      BaseBridge (核心功能)          │ │
│  │  - 平台检测                         │ │
│  │  - 通信机制                         │ │
│  │  - 事件管理                         │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 模块结构

每个功能模块包含三个部分：

1. **方法定义** (`modules/`)：定义 Bridge 方法名常量
2. **Bridge 实现** (`implementations/`)：实现具体的 Bridge 类
3. **React Hook** (`hooks/`)：提供 React Hook 封装（可选）

## 🔧 实现细节

### 1. BaseBridge - 核心基础类

**职责**：
- 平台检测（iOS/Android/浏览器）
- 原生方法调用
- 事件监听管理
- 回调处理

**特点**：
- 可以被其他模块继承
- 支持作为父 Bridge 被复用（避免重复初始化）

### 2. BridgeManager - 统一管理器

**职责**：
- 管理所有功能模块
- 提供统一的访问入口
- 单例模式

**使用方式**：
```javascript
import bridge from '@/utils/bridge'
bridge.quit.setQuitDate('2024-01-01')
bridge.period.saveRecord({ ... })
```

### 3. 模块 Bridge - 功能实现

**职责**：
- 封装该模块的所有原生方法调用
- 提供语义化的方法名
- 参数验证和转换

**示例**：
```javascript
class QuitBridge extends BaseBridge {
  setQuitDate(date) {
    return this.callNative(QUIT.SET_QUIT_DATE, { date })
  }
}
```

### 4. React Hook - 便捷封装

**职责**：
- 提供 React 组件中使用的 Hook
- 自动绑定方法
- 提供平台信息

**示例**：
```javascript
const { setQuitDate, getQuitDate, isInApp } = useQuitBridge()
```

## 📦 模块示例：戒烟模块

### 文件结构

```
bridge/
├── modules/
│   └── quit.js                    # 方法定义
├── implementations/
│   └── QuitBridge.js             # Bridge 实现
└── hooks/
    └── useQuitBridge.js          # React Hook
```

### 方法定义 (modules/quit.js)

```javascript
export const QUIT = {
  SET_QUIT_DATE: 'quit.setQuitDate',
  GET_QUIT_DATE: 'quit.getQuitDate',
  GET_STATS: 'quit.getStats',
  // ...
}
```

### Bridge 实现 (implementations/QuitBridge.js)

```javascript
export class QuitBridge extends BaseBridge {
  setQuitDate(date) {
    return this.callNative(QUIT.SET_QUIT_DATE, { date })
  }
}
```

### Hook 封装 (hooks/useQuitBridge.js)

```javascript
export function useQuitBridge() {
  const setQuitDate = useCallback((date) => {
    return bridge.quit.setQuitDate(date)
  }, [])
  return { setQuitDate, ... }
}
```

## 🚀 添加新模块的流程

1. **定义方法常量** → `modules/新模块.js`
2. **实现 Bridge 类** → `implementations/新模块Bridge.js`
3. **注册到管理器** → `core/BridgeManager.js`
4. **创建 Hook**（可选）→ `hooks/use新模块Bridge.js`
5. **导出** → `index.js`

## ✅ 优势对比

### 旧架构（NativeBridge.js）

```javascript
// 所有方法都在一个文件中
class NativeBridge {
  savePeriodRecord() { ... }
  getPeriodRecords() { ... }
  saveQuitRecord() { ... }  // 新功能混在一起
  getQuitStats() { ... }     // 难以维护
}
```

**问题**：
- 所有功能混在一起
- 添加新功能需要修改大文件
- 难以维护和测试

### 新架构（模块化）

```javascript
// 每个模块独立
class QuitBridge extends BaseBridge {
  saveRecord() { ... }
  getStats() { ... }
}

class PeriodBridge extends BaseBridge {
  saveRecord() { ... }
  getRecords() { ... }
}
```

**优势**：
- 模块独立，互不干扰
- 添加新功能只需添加新模块
- 易于维护和测试
- 代码组织清晰

## 🔄 向后兼容

新的架构不会影响现有代码：

1. **旧的 NativeBridge.js 仍然可用**
2. **可以逐步迁移现有模块**
3. **新功能使用新架构**
4. **旧功能保持原样**

## 📝 最佳实践

1. **命名规范**：
   - 方法常量：`模块名.操作`（如：`quit.setQuitDate`）
   - Bridge 类：`模块名Bridge`（如：`QuitBridge`）
   - Hook：`use模块名Bridge`（如：`useQuitBridge`）

2. **错误处理**：
   - 所有方法返回 Promise
   - 使用 try-catch 处理错误

3. **平台检测**：
   - 使用 `isInApp()` 判断是否在 App 内
   - 使用 `getPlatform()` 获取平台信息

4. **文档**：
   - 每个模块添加 JSDoc 注释
   - 更新 README 和迁移指南

## 🎓 总结

新的 Bridge 架构通过模块化设计，实现了：

- ✅ **低耦合**：模块之间独立
- ✅ **高内聚**：每个模块功能完整
- ✅ **易扩展**：添加新功能简单
- ✅ **易维护**：代码组织清晰
- ✅ **向后兼容**：不影响现有代码

这样的架构设计，可以很好地支持未来添加更多功能模块，同时保持代码的可维护性。
