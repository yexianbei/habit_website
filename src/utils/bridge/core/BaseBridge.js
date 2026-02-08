/**
 * BaseBridge - Bridge 基础类
 * 提供平台检测、通信等核心功能
 * 所有模块 Bridge 都继承此类
 */

export class BaseBridge {
  constructor(parentBridge = null) {
    // 如果传入 parentBridge，复用其核心功能
    // 否则自己实现核心功能
    if (parentBridge) {
      this._parent = parentBridge
    } else {
      this.callbackId = 0
      this.callbacks = {}
      this.eventListeners = {}
      this.isReady = false
      this.readyCallbacks = []
      this._init()
    }
  }

  /**
   * 获取父 Bridge 实例（用于复用核心功能）
   */
  get _bridge() {
    return this._parent || this
  }

  /**
   * 初始化 Bridge
   */
  _init() {
    if (this._parent) return // 如果有父 Bridge，不需要初始化

    // 注册全局回调函数供原生调用
    window.HabitBridgeCallback = this._handleCallback.bind(this)
    window.HabitBridgeEvent = this._handleEvent.bind(this)
    
    // 兼容 Android 的回调方式
    window.onNativeCallback = this._handleCallback.bind(this)
    window.onNativeEvent = this._handleEvent.bind(this)

    // 检测环境并标记就绪
    this._checkReady()
  }

  /**
   * 检测 Bridge 是否就绪
   */
  _checkReady() {
    if (this._parent) return // 如果有父 Bridge，不需要检测

    setTimeout(() => {
      this.isReady = true
      this.readyCallbacks.forEach(cb => cb())
      this.readyCallbacks = []
    }, 100)
  }

  /**
   * 等待 Bridge 就绪
   */
  ready() {
    const bridge = this._bridge
    return new Promise((resolve) => {
      if (bridge.isReady) {
        resolve()
      } else {
        bridge.readyCallbacks.push(resolve)
      }
    })
  }

  /**
   * 调用原生方法（核心方法）
   * @param {string} method - 方法名
   * @param {object} params - 参数
   */
  callNative(method, params = {}) {
    const bridge = this._bridge
    return new Promise((resolve, reject) => {
      const callbackId = `cb_${Date.now()}_${++bridge.callbackId}`
      
      bridge.callbacks[callbackId] = { resolve, reject }
      
      const message = {
        method,
        params,
        callbackId,
      }

      try {
        if (this._isIOS()) {
          // iOS: 通过 WKWebView messageHandlers 调用
          window.webkit.messageHandlers.HabitBridge.postMessage(message)
        } else if (this._isAndroid()) {
          // Android: 通过 JSBridge 调用
          if (window.HabitBridge && typeof window.HabitBridge.invoke === 'function') {
            const result = window.HabitBridge.invoke(JSON.stringify(message))
            if (result) {
              try {
                const parsed = JSON.parse(result)
                if (parsed.success) {
                  resolve(parsed.data)
                } else {
                  reject(new Error(parsed.error || '调用失败'))
                }
              } catch (e) {
                reject(new Error('解析返回结果失败'))
              }
            } else {
              // 异步回调
              // Android 端会在适当时机调用 window.onNativeCallback
            }
          } else if (window.AndroidBridge) {
            window.AndroidBridge.invoke(JSON.stringify(message))
          } else {
            reject(new Error('Android Bridge 未找到'))
          }
        } else {
          // 浏览器环境：模拟返回
          console.warn('[Bridge] 浏览器环境，模拟调用:', method, params)
          setTimeout(() => {
            resolve({ mock: true, method, params })
          }, 100)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 处理原生回调
   */
  _handleCallback(callbackId, success, data, error) {
    const bridge = this._bridge
    const callback = bridge.callbacks[callbackId]
    if (callback) {
      if (success) {
        callback.resolve(data)
      } else {
        callback.reject(new Error(error || '调用失败'))
      }
      delete bridge.callbacks[callbackId]
    }
  }

  /**
   * 处理原生事件
   */
  _handleEvent(eventName, data) {
    const bridge = this._bridge
    const listeners = bridge.eventListeners[eventName] || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`[Bridge] 事件监听器错误 [${eventName}]:`, error)
      }
    })
  }

  /**
   * 监听原生事件
   */
  on(eventName, callback) {
    const bridge = this._bridge
    if (!bridge.eventListeners[eventName]) {
      bridge.eventListeners[eventName] = []
    }
    bridge.eventListeners[eventName].push(callback)
    
    // 返回取消监听的函数
    return () => {
      const listeners = bridge.eventListeners[eventName]
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  /**
   * 取消监听原生事件
   */
  off(eventName, callback) {
    const bridge = this._bridge
    const listeners = bridge.eventListeners[eventName]
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 监听一次原生事件
   */
  once(eventName, callback) {
    const bridge = this._bridge
    const wrapper = (data) => {
      callback(data)
      bridge.off(eventName, wrapper)
    }
    bridge.on(eventName, wrapper)
  }

  // ==================== 平台检测 ====================

  /**
   * 获取当前平台
   */
  getPlatform() {
    if (this._isIOS()) return 'ios'
    if (this._isAndroid()) return 'android'
    return 'browser'
  }

  /**
   * 是否在 App 内
   */
  isInApp() {
    return this._isIOS() || this._isAndroid()
  }

  /**
   * 检测 iOS 环境
   */
  _isIOS() {
    return !!(window.webkit?.messageHandlers?.HabitBridge)
  }

  /**
   * 检测 Android 环境
   */
  _isAndroid() {
    return !!(
      window.HabitBridge ||
      window.AndroidBridge ||
      (window.navigator?.userAgent?.includes('Android') && window.prompt)
    )
  }
}
