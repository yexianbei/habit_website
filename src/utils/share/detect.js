/**
 * 分享环境检测
 * 用于选择分享方式：微信内 / App 内 / 普通浏览器
 */

const WECHAT_UA = /MicroMessenger/i

/**
 * 是否在微信内置浏览器内
 */
export function isWechat() {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false
  return WECHAT_UA.test(navigator.userAgent)
}

/**
 * 是否在小习惯 App 内 WebView（通过 URL 或全局标记判断，与 NativeBridge 一致）
 */
export function isInAppFromUA() {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false
  const ua = navigator.userAgent
  return /TinyHabits|XiaoGuanXi|habit.*app/i.test(ua)
}
