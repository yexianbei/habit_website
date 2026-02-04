/**
 * Bridge 方法名常量定义
 * 保持 iOS / Android / H5 三端一致
 * 
 * 命名规范：模块.操作
 * 例如：habit.create, user.getInfo
 */

// ============ 习惯模块 ============
export const HABIT = {
  CREATE: 'habit.create',           // 创建习惯
  UPDATE: 'habit.update',           // 更新习惯
  DELETE: 'habit.delete',           // 删除习惯
  GET_LIST: 'habit.getList',        // 获取习惯列表
  GET_DETAIL: 'habit.getDetail',    // 获取习惯详情
  CHECK_IN: 'habit.checkIn',        // 打卡
  CANCEL_CHECK_IN: 'habit.cancelCheckIn', // 取消打卡
  GET_RECORDS: 'habit.getRecords',  // 获取打卡记录
  GET_STATISTICS: 'habit.getStatistics', // 获取统计数据
}

// ============ 经期管理模块 ============
export const PERIOD = {
  SAVE: 'period.save',              // 保存经期记录
  GET_RECORDS: 'period.getRecords', // 获取经期记录
  DELETE_RECORD: 'period.deleteRecord', // 删除经期记录
  PREDICT: 'period.predict',        // 预测下次经期
  SET_REMINDER: 'period.setReminder', // 设置提醒
  GET_SETTINGS: 'period.getSettings', // 获取设置
  UPDATE_SETTINGS: 'period.updateSettings', // 更新设置
  GET_ANALYSIS: 'period.getAnalysis', // 获取经期分析
}

// ============ 用户模块 ============
export const USER = {
  GET_INFO: 'user.getInfo',         // 获取用户信息
  IS_VIP: 'user.isVIP',             // 是否 VIP
  GET_SETTINGS: 'user.getSettings', // 获取用户设置
  UPDATE_SETTINGS: 'user.updateSettings', // 更新用户设置
  LOGIN: 'user.login',              // 登录
  LOGOUT: 'user.logout',            // 登出
}

// ============ UI 模块 ============
export const UI = {
  SHOW_TOAST: 'ui.showToast',       // 显示 Toast
  SHOW_ALERT: 'ui.showAlert',       // 显示 Alert
  SHOW_CONFIRM: 'ui.showConfirm',   // 显示确认框
  SHOW_LOADING: 'ui.showLoading',   // 显示 Loading
  HIDE_LOADING: 'ui.hideLoading',   // 隐藏 Loading
  CLOSE_PAGE: 'ui.closePage',       // 关闭页面
  SET_TITLE: 'ui.setTitle',         // 设置标题
  SET_NAV_BAR_COLOR: 'ui.setNavBarColor', // 设置导航栏颜色
  SHARE: 'ui.share',                // 分享
  OPEN_URL: 'ui.openUrl',           // 打开链接
  SHOW_ACTION_SHEET: 'ui.showActionSheet', // 显示操作菜单
  SHOW_DATE_PICKER: 'ui.showDatePicker', // 显示日期选择器
  SHOW_TIME_PICKER: 'ui.showTimePicker', // 显示时间选择器
}

// ============ 设备模块 ============
export const DEVICE = {
  GET_INFO: 'device.getInfo',       // 获取设备信息
  VIBRATE: 'device.vibrate',        // 震动
  COPY_TO_CLIPBOARD: 'device.copyToClipboard', // 复制到剪贴板
  OPEN_SETTINGS: 'device.openSettings', // 打开系统设置
  GET_NETWORK_STATUS: 'device.getNetworkStatus', // 获取网络状态
  SCAN_QR_CODE: 'device.scanQRCode', // 扫描二维码
  TAKE_PHOTO: 'device.takePhoto',   // 拍照
  CHOOSE_IMAGE: 'device.chooseImage', // 选择图片
}

// ============ 存储模块 ============
export const STORAGE = {
  GET: 'storage.get',               // 获取存储
  SET: 'storage.set',               // 设置存储
  REMOVE: 'storage.remove',         // 删除存储
  CLEAR: 'storage.clear',           // 清空存储
}

// ============ 通知模块 ============
export const NOTIFICATION = {
  REQUEST_PERMISSION: 'notification.requestPermission', // 请求权限
  SCHEDULE: 'notification.schedule', // 设置定时通知
  CANCEL: 'notification.cancel',    // 取消通知
  CANCEL_ALL: 'notification.cancelAll', // 取消所有通知
}

// ============ 调试模块 ============
export const DEBUG = {
  LOG: 'debug.log',                 // 打印日志
  ERROR: 'debug.error',             // 打印错误
}

// ============ 事件名称（原生 -> H5）============
export const EVENTS = {
  // 习惯相关
  HABIT_CREATED: 'habitCreated',     // 习惯创建完成
  HABIT_UPDATED: 'habitUpdated',     // 习惯更新完成
  HABIT_DELETED: 'habitDeleted',     // 习惯删除完成
  HABIT_CHECKED_IN: 'habitCheckedIn', // 打卡完成
  
  // 经期相关
  PERIOD_UPDATED: 'periodUpdated',   // 经期数据更新
  
  // 用户相关
  USER_LOGIN: 'userLogin',           // 用户登录
  USER_LOGOUT: 'userLogout',         // 用户登出
  VIP_STATUS_CHANGED: 'vipStatusChanged', // VIP 状态变化
  
  // 系统相关
  APP_ENTER_FOREGROUND: 'appEnterForeground', // App 进入前台
  APP_ENTER_BACKGROUND: 'appEnterBackground', // App 进入后台
  NETWORK_STATUS_CHANGED: 'networkStatusChanged', // 网络状态变化
  
  // 页面相关
  PAGE_WILL_DISAPPEAR: 'pageWillDisappear', // 页面即将消失
  PAGE_DID_APPEAR: 'pageDidAppear',  // 页面已显示
}

// 导出所有
export default {
  HABIT,
  PERIOD,
  USER,
  UI,
  DEVICE,
  STORAGE,
  NOTIFICATION,
  DEBUG,
  EVENTS,
}
