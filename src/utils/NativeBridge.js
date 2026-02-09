/**
 * NativeBridge - 多端通用的原生桥接工具
 * 支持 iOS (WKWebView)、Android (WebView)、浏览器降级
 * 
 * 使用方式：
 * import bridge from '@/utils/NativeBridge'
 * 
 * // 调用原生方法
 * const result = await bridge.callNative('habit.create', { name: '跑步' })
 * 
 * // 监听原生事件
 * bridge.on('habitUpdated', (data) => { ... })
 */

class NativeBridge {
  constructor() {
    this.callbackId = 0
    this.callbacks = {}
    this.eventListeners = {}
    this.isReady = false
    this.readyCallbacks = []
    
    this._init()
  }

  /**
   * 初始化 Bridge
   */
  _init() {
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
    // 延迟检测，等待原生注入
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
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve()
      } else {
        this.readyCallbacks.push(resolve)
      }
    })
  }

  // ==================== 平台检测 ====================

  /**
   * 获取当前平台
   * @returns {'ios' | 'android' | 'browser'}
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
   * 安卓端注入的是 JSBridge（invoke 同步返回），与 iOS 的 HabitBridge 不同
   */
  _isAndroid() {
    return !!(
      window.HabitBridge ||
      window.AndroidBridge ||
      (window.JSBridge && typeof window.JSBridge.invoke === 'function')
    )
  }

  /**
   * 获取 Android Bridge 对象
   */
  _getAndroidBridge() {
    return window.HabitBridge || window.AndroidBridge || window.JSBridge
  }

  /**
   * 是否使用 JSBridge 同步 invoke（当前安卓端仅注入 JSBridge.invoke）
   */
  _isAndroidJSBridgeSync() {
    return !!(window.JSBridge && typeof window.JSBridge.invoke === 'function')
  }

  // ==================== 核心调用方法 ====================

  /**
   * 调用原生方法
   * @param {string} method - 方法名，如 'habit.create'
   * @param {object} params - 参数对象
   * @param {number} timeout - 超时时间(ms)，默认 30 秒
   * @returns {Promise<any>}
   */
  callNative(method, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const callbackId = ++this.callbackId
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        delete this.callbacks[callbackId]
        reject(new Error(`Bridge call timeout: ${method}`))
      }, timeout)

      // 存储回调
      this.callbacks[callbackId] = {
        resolve: (data) => {
          clearTimeout(timeoutId)
          resolve(data)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        }
      }

      const message = {
        method,
        params,
        callbackId
      }

      try {
        if (this._isIOS()) {
          // iOS: WKWebView
          if (window.webkit?.messageHandlers?.HabitBridge?.postMessage) {
            window.webkit.messageHandlers.HabitBridge.postMessage(message)
          } else {
            // 检测到 iOS 环境但桥接未注入，降级处理
            clearTimeout(timeoutId)
            delete this.callbacks[callbackId]
            this._handleBrowserFallback(method, params, resolve, reject)
            return
          }
        } else if (this._isAndroid()) {
          // Android: 优先使用 JSBridge.invoke（同步返回 JSON 字符串，与 HabitWebViewActivity 一致）
          if (this._isAndroidJSBridgeSync()) {
            try {
              const paramsStr = typeof params === 'string' ? params : JSON.stringify(params || {})
              const resultStr = window.JSBridge.invoke(method, paramsStr)
              clearTimeout(timeoutId)
              delete this.callbacks[callbackId]
              let data = null
              if (resultStr && resultStr.trim() !== '') {
                try {
                  data = JSON.parse(resultStr)
                } catch (_) {
                  data = resultStr
                }
              }
              resolve(data)
            } catch (e) {
              clearTimeout(timeoutId)
              delete this.callbacks[callbackId]
              reject(e)
            }
          } else {
            const androidBridge = this._getAndroidBridge()
            if (androidBridge.postMessage) {
              androidBridge.postMessage(JSON.stringify(message))
            } else if (androidBridge.callNative) {
              androidBridge.callNative(method, JSON.stringify(params), callbackId)
            }
          }
        } else {
          // 浏览器环境：模拟响应或降级处理
          clearTimeout(timeoutId)
          delete this.callbacks[callbackId]
          this._handleBrowserFallback(method, params, resolve, reject)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        delete this.callbacks[callbackId]
        reject(error)
      }
    })
  }

  /**
   * 浏览器环境的降级处理
   */
  _handleBrowserFallback(method, params, resolve, reject) {
    console.warn(`[NativeBridge] 浏览器环境，方法 ${method} 降级处理`)
    
    // 根据方法类型进行不同的降级处理
    switch (method) {
      case 'device.getInfo':
        resolve({
          platform: 'browser',
          version: navigator.userAgent,
          language: navigator.language
        })
        break
      
      case 'user.getInfo':
        // 浏览器环境返回空用户
        resolve(null)
        break
      
      case 'user.isVIP':
        resolve(false)
        break
      
      case 'ui.showToast':
        // 使用 alert 降级
        if (params.message) {
          alert(params.message)
        }
        resolve(true)
        break
      
      case 'ui.closePage':
        // 尝试关闭窗口或返回
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.close()
        }
        resolve(true)
        break
      
      case 'period.getSettings':
        // 经期设置降级：返回默认值
        resolve({ cycleLength: 28, periodLength: 5 })
        break
      
      case 'period.getRecords':
        // 经期记录降级：返回空记录
        resolve({ records: [], lastPeriodStart: null })
        break
      
      case 'period.predict':
        // 经期预测降级：返回无数据
        resolve({ hasData: false })
        break
      
      default:
        // 默认返回 null，不报错
        console.warn(`[NativeBridge] 方法 ${method} 在浏览器环境不可用`)
        resolve(null)
    }
  }

  /**
   * 处理原生回调
   * @param {number} callbackId - 回调ID
   * @param {boolean} success - 是否成功
   * @param {any} data - 返回数据
   */
  _handleCallback(callbackId, success, data) {
    const callback = this.callbacks[callbackId]
    if (callback) {
      // 处理字符串格式的数据（Android 可能传递 JSON 字符串）
      let parsedData = data
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data)
        } catch (e) {
          // 保持原始字符串
        }
      }

      if (success) {
        callback.resolve(parsedData)
      } else {
        const error = new Error(parsedData?.message || parsedData || 'Unknown error')
        error.code = parsedData?.code
        callback.reject(error)
      }
      delete this.callbacks[callbackId]
    }
  }

  // ==================== 事件监听 ====================

  /**
   * 监听原生事件
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   * @returns {function} 取消监听的函数
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)

    // 返回取消监听的函数
    return () => this.off(event, callback)
  }

  /**
   * 取消监听
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   */
  off(event, callback) {
    const listeners = this.eventListeners[event]
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 只监听一次
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   */
  once(event, callback) {
    const onceCallback = (data) => {
      this.off(event, onceCallback)
      callback(data)
    }
    this.on(event, onceCallback)
  }

  /**
   * 处理原生事件
   * @param {string} event - 事件名称
   * @param {any} data - 事件数据
   */
  _handleEvent(event, data) {
    // 处理字符串格式的数据
    let parsedData = data
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        // 保持原始字符串
      }
    }

    const listeners = this.eventListeners[event] || []
    listeners.forEach(callback => {
      try {
        callback(parsedData)
      } catch (error) {
        console.error(`[NativeBridge] Event handler error for ${event}:`, error)
      }
    })
  }

  // ==================== 习惯相关便捷方法 ====================

  /**
   * 创建习惯
   * @param {object} habitData - 习惯数据
   */
  createHabit(habitData) {
    return this.callNative('habit.create', habitData)
  }

  /**
   * 更新习惯
   * @param {string} habitId - 习惯ID
   * @param {object} habitData - 更新数据
   */
  updateHabit(habitId, habitData) {
    return this.callNative('habit.update', { habitId, ...habitData })
  }

  /**
   * 删除习惯
   * @param {string} habitId - 习惯ID
   */
  deleteHabit(habitId) {
    return this.callNative('habit.delete', { habitId })
  }

  /**
   * 获取习惯列表
   * @param {object} params - 查询参数
   */
  getHabitList(params = {}) {
    return this.callNative('habit.getList', params)
  }

  /**
   * 获取习惯详情
   * @param {string} habitId - 习惯ID
   */
  getHabitDetail(habitId) {
    return this.callNative('habit.getDetail', { habitId })
  }

  /**
   * 习惯打卡
   * @param {string} habitId - 习惯ID
   * @param {object} data - 打卡数据
   */
  checkIn(habitId, data = {}) {
    return this.callNative('habit.checkIn', { habitId, ...data })
  }

  /**
   * 取消打卡
   * @param {string} habitId - 习惯ID
   * @param {string} date - 日期
   */
  cancelCheckIn(habitId, date) {
    return this.callNative('habit.cancelCheckIn', { habitId, date })
  }

  /**
   * 获取打卡记录
   * @param {string} habitId - 习惯ID
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   */
  getCheckInRecords(habitId, startDate, endDate) {
    return this.callNative('habit.getRecords', { habitId, startDate, endDate })
  }

  // ==================== 经期管理便捷方法 ====================

  /**
   * 保存经期记录
   * @param {object} record - 经期记录
   */
  savePeriodRecord(record) {
    return this.callNative('period.save', record)
  }

  /**
   * 获取经期记录
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   */
  getPeriodRecords(startDate, endDate) {
    return this.callNative('period.getRecords', { startDate, endDate })
  }

  /**
   * 预测下次经期
   */
  predictNextPeriod() {
    return this.callNative('period.predict')
  }

  /**
   * 设置经期提醒
   * @param {object} settings - 提醒设置
   */
  setPeriodReminder(settings) {
    return this.callNative('period.setReminder', settings)
  }

  /**
   * 获取经期设置
   */
  getPeriodSettings() {
    return this.callNative('period.getSettings')
  }

  /**
   * 更新经期设置
   * @param {object} settings - 设置数据
   */
  updatePeriodSettings(settings) {
    return this.callNative('period.updateSettings', settings)
  }

  // ==================== 用户相关便捷方法 ====================

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.callNative('user.getInfo')
  }

  /**
   * 是否 VIP 用户
   */
  isVIP() {
    return this.callNative('user.isVIP')
  }

  /**
   * 获取用户设置
   */
  getUserSettings() {
    return this.callNative('user.getSettings')
  }

  // ==================== UI 相关便捷方法 ====================

  /**
   * 显示 Toast
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时长(ms)
   */
  showToast(message, duration = 2000) {
    return this.callNative('ui.showToast', { message, duration })
  }

  /**
   * 显示 Alert
   * @param {string} title - 标题
   * @param {string} message - 消息
   * @param {Array} buttons - 按钮配置
   */
  showAlert(title, message, buttons = []) {
    return this.callNative('ui.showAlert', { title, message, buttons })
  }

  /**
   * 显示确认框
   * @param {string} title - 标题
   * @param {string} message - 消息
   */
  showConfirm(title, message) {
    return this.callNative('ui.showConfirm', { title, message })
  }

  /**
   * 显示 Loading
   * @param {string} message - 提示文字
   */
  showLoading(message = '') {
    return this.callNative('ui.showLoading', { message })
  }

  /**
   * 隐藏 Loading
   */
  hideLoading() {
    return this.callNative('ui.hideLoading')
  }

  /**
   * 关闭当前页面
   */
  closePage() {
    return this.callNative('ui.closePage')
  }

  /**
   * 设置页面标题
   * @param {string} title - 标题
   */
  setTitle(title) {
    return this.callNative('ui.setTitle', { title })
  }

  /**
   * 设置导航栏颜色
   * @param {string} color - 颜色值
   */
  setNavBarColor(color) {
    return this.callNative('ui.setNavBarColor', { color })
  }

  /**
   * 分享
   * @param {object} data - 分享数据
   */
  share(data) {
    return this.callNative('ui.share', data)
  }

  /**
   * 页面跳转（在 App 内打开新的 WebView 页面）
   * @param {string} url - 目标 URL
   * @param {object} options - 可选参数
   */
  navigateTo(url, options = {}) {
    return this.callNative('ui.navigateTo', { url, ...options })
  }

  /**
   * 显示操作菜单
   * @param {string} title - 标题
   * @param {Array} options - 选项数组
   */
  showActionSheet(title, options = []) {
    return this.callNative('ui.showActionSheet', { title, options })
  }

  /**
   * 显示日期选择器
   * @param {object} params - 参数
   */
  showDatePicker(params = {}) {
    return this.callNative('ui.showDatePicker', params)
  }

  /**
   * 显示时间选择器
   * @param {object} params - 参数
   */
  showTimePicker(params = {}) {
    return this.callNative('ui.showTimePicker', params)
  }

  // ==================== 设备相关便捷方法 ====================

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return this.callNative('device.getInfo')
  }

  /**
   * 震动反馈
   * @param {string} type - 震动类型: 'light' | 'medium' | 'heavy'
   */
  vibrate(type = 'medium') {
    return this.callNative('device.vibrate', { type })
  }

  /**
   * 复制到剪贴板
   * @param {string} text - 要复制的文本
   */
  copyToClipboard(text) {
    return this.callNative('device.copyToClipboard', { text })
  }

  /**
   * 打开系统设置
   */
  openSettings() {
    return this.callNative('device.openSettings')
  }

  // ==================== 存储相关便捷方法 ====================

  /**
   * 获取存储数据
   * @param {string} key - 键名
   */
  getStorage(key) {
    return this.callNative('storage.get', { key })
  }

  /**
   * 设置存储数据
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  setStorage(key, value) {
    return this.callNative('storage.set', { key, value })
  }

  /**
   * 删除存储数据
   * @param {string} key - 键名
   */
  removeStorage(key) {
    return this.callNative('storage.remove', { key })
  }

  // ==================== 调试方法 ====================

  /**
   * 打印日志到原生控制台
   * @param {string} level - 日志级别: 'debug' | 'info' | 'warn' | 'error'
   * @param {string} message - 日志内容
   */
  log(level, message) {
    if (this.isInApp()) {
      return this.callNative('debug.log', { level, message })
    } else {
      console[level] || console.log(`[${level}]`, message)
      return Promise.resolve()
    }
  }
}

// 创建单例并导出
const bridge = new NativeBridge()

export default bridge

// 同时导出类，方便某些场景需要创建新实例
export { NativeBridge }
