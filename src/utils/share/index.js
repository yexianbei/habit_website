/**
 * 分享能力统一封装
 * - 微信：在微信内置浏览器内通过 JSSDK 设置分享卡片（需配置公众平台 + 后端签名）
 * - App 内：调原生 ui.share
 * - 其他：Web Share API 或复制链接
 * 扩展：后续可在此增加 shareToDouyin、shareToWeibo 等
 */

import { SHARE_BASE_URL, DEFAULT_SHARE_IMAGE } from './constants'
import { isWechat } from './detect'
import { initWechatJssdk } from './wechat'

/**
 * 分享配置（与 OG / 微信 JSSDK 一致）
 * @typedef {Object} ShareConfig
 * @property {string} [title] - 标题
 * @property {string} [description] - 描述
 * @property {string} [link] - 链接（默认当前页）
 * @property {string} [imgUrl] - 分享图（默认站点的默认图）
 */

/**
 * 从当前页面的 og meta 读取分享配置（与微信爬虫一致，便于分享卡片与预览一致）
 */
export function getShareConfigFromPage() {
  if (typeof document === 'undefined' || !document.head) {
    return {
      title: document?.title || 'Tiny Habits',
      description: '',
      link: typeof window !== 'undefined' ? window.location.href : SHARE_BASE_URL,
      imgUrl: DEFAULT_SHARE_IMAGE,
    }
  }
  const getMeta = (attr, value) => {
    const el = document.querySelector(`meta[${attr}="${value}"]`)
    return el ? el.getAttribute('content') : ''
  }
  const link = getMeta('property', 'og:url') || (typeof window !== 'undefined' ? window.location.href : SHARE_BASE_URL)
  let imgUrl = getMeta('property', 'og:image')
  if (imgUrl && imgUrl.startsWith('/')) imgUrl = SHARE_BASE_URL + imgUrl
  return {
    title: getMeta('property', 'og:title') || document.title || 'Tiny Habits',
    description: getMeta('property', 'og:description') || getMeta('name', 'description') || '',
    link,
    imgUrl: imgUrl || DEFAULT_SHARE_IMAGE,
  }
}

/**
 * 合并传入配置与页面 meta，生成最终分享配置（链接始终为绝对地址）
 */
export function normalizeShareConfig(override = {}) {
  const fromPage = getShareConfigFromPage()
  const link = override.link || fromPage.link
  const linkAbs = link.startsWith('http') ? link : new URL(link, SHARE_BASE_URL).href
  let imgUrl = override.imgUrl || override.image || fromPage.imgUrl
  if (imgUrl && imgUrl.startsWith('/')) imgUrl = SHARE_BASE_URL + imgUrl
  return {
    title: override.title ?? fromPage.title,
    description: override.description ?? fromPage.description,
    link: linkAbs,
    imgUrl: imgUrl || DEFAULT_SHARE_IMAGE,
  }
}

/**
 * 在微信内置浏览器中设置分享卡片（分享给朋友 / 分享到朋友圈）
 * 若配置了 VITE_WECHAT_JS_SDK_API，会请求该接口获取签名并初始化 JSSDK；否则仅依赖页面 og 标签（微信爬虫结果）
 * @param {ShareConfig} [config] - 不传则使用当前页 og
 * @param {Function} [getSignature] - 可选，签名获取函数 (url: string) => Promise<{ appId, timestamp, nonceStr, signature }>
 */
export function setWechatShareConfig(config, getSignature) {
  if (!isWechat()) return Promise.resolve()
  const shareConfig = normalizeShareConfig(config)
  const wxSharePayload = {
    title: shareConfig.title,
    desc: shareConfig.description,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
  }
  const apiUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WECHAT_JS_SDK_API
  const fetchSignature = getSignature || (apiUrl ? (url) => fetch(`${apiUrl}?url=${encodeURIComponent(url)}`).then((r) => r.json()) : null)
  if (fetchSignature) {
    return fetchSignature(shareConfig.link)
      .then((res) => initWechatJssdk(res, wxSharePayload))
      .catch((err) => {
        if (typeof console !== 'undefined') console.warn('[share] WeChat JSSDK init failed, fallback to og:', err)
      })
  }
  return Promise.resolve()
}

/**
 * 触发分享动作
 * - App 内：调原生 ui.share
 * - 非 App：优先 navigator.share，不支持则复制链接
 * @param {ShareConfig} [config] - 不传则使用当前页 og
 * @param {Object} [options] - { nativeShare: (payload) => Promise } 传入则优先用原生分享（如从 useNativeBridge 来的 share）
 */
export function triggerShare(config, options = {}) {
  const payload = normalizeShareConfig(config)
  const { nativeShare } = options
  if (nativeShare && typeof nativeShare === 'function') {
    return Promise.resolve(
      nativeShare({
        title: payload.title,
        text: payload.description,
        url: payload.link,
        imageUrl: payload.imgUrl,
      })
    ).catch((err) => {
      if (typeof console !== 'undefined') console.warn('[share] native share failed:', err)
      return fallbackCopyOrWebShare(payload)
    })
  }
  return fallbackCopyOrWebShare(payload)
}

function fallbackCopyOrWebShare(payload) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    return navigator
      .share({
        title: payload.title,
        text: payload.description,
        url: payload.link,
      })
      .catch(() => copyLinkAndToast(payload.link))
  }
  return Promise.resolve(copyLinkAndToast(payload.link))
}

function copyLinkAndToast(link) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return fallbackCopy(link)
  }
  return navigator.clipboard.writeText(link).then(
    () => {
      if (typeof window !== 'undefined' && window.alert) window.alert('链接已复制，可粘贴到微信、抖音等分享')
    },
    () => fallbackCopy(link)
  )
}

function fallbackCopy(link) {
  try {
    const ta = document.createElement('textarea')
    ta.value = link
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    if (typeof window !== 'undefined' && window.alert) window.alert('链接已复制，可粘贴到微信、抖音等分享')
  } catch (e) {
    if (typeof window !== 'undefined' && window.alert) window.alert('请手动复制链接：' + link)
  }
}

export { isWechat } from './detect'
export { initWechatJssdk, setWechatShareContent } from './wechat'
export { SHARE_BASE_URL, DEFAULT_SHARE_IMAGE } from './constants'
