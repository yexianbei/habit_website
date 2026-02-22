/**
 * 微信分享（JSSDK）封装
 * 在微信内置浏览器中，通过 JS-SDK 设置「分享给朋友」「分享到朋友圈」的卡片内容。
 * 依赖：微信公众平台配置 + 后端签名接口。详见 WECHAT_SHARE_SETUP.md
 */

const WX_SCRIPT_URL = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'

/**
 * 动态加载微信 JSSDK
 * @returns {Promise<typeof wx>}
 */
function loadWxScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('window undefined'))
  if (window.wx) return Promise.resolve(window.wx)
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = WX_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.wx)
    script.onerror = () => reject(new Error('WeChat JSSDK load failed'))
    document.head.appendChild(script)
  })
}

/**
 * 微信 JSSDK 配置项（由后端签名接口返回）
 * @typedef {Object} WxConfig
 * @property {string} appId - 公众号 appId
 * @property {number} timestamp - 时间戳
 * @property {string} nonceStr - 随机串
 * @property {string} signature - 签名
 */

/**
 * 分享卡片内容（与微信 JSSDK 接口一致）
 * @typedef {Object} WxShareConfig
 * @property {string} title - 分享标题
 * @property {string} desc - 分享描述
 * @property {string} link - 分享链接（当前页或自定义）
 * @property {string} imgUrl - 分享图（建议 300x300 或 500x500，需 HTTPS）
 */

/**
 * 使用后端返回的配置初始化微信 JSSDK，并设置分享卡片
 * @param {WxConfig} config - 后端返回的 wx.config 参数
 * @param {WxShareConfig} shareConfig - 分享给朋友/朋友圈的卡片内容
 * @returns {Promise<void>}
 */
export function initWechatJssdk(config, shareConfig) {
  if (!config || !config.appId || !config.signature) {
    return Promise.reject(new Error('WeChat JSSDK config invalid: need appId and signature'))
  }
  return loadWxScript().then((wx) => {
    return new Promise((resolve, reject) => {
      wx.config({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
        success: () => resolve(),
        fail: (err) => reject(err || new Error('wx.config fail')),
      })
      wx.ready(() => {
        const setShare = () => {
          wx.updateAppMessageShareData({
            title: shareConfig.title,
            desc: shareConfig.desc,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
            success: () => {},
            cancel: () => {},
          })
          wx.updateTimelineShareData({
            title: shareConfig.title,
            link: shareConfig.link,
            imgUrl: shareConfig.imgUrl,
            success: () => {},
            cancel: () => {},
          })
        }
        setShare()
        resolve()
      })
      wx.error((err) => reject(err || new Error('wx.error')))
    })
  })
}

/**
 * 仅设置分享内容，不执行 config（用于已 config 过的页面后续更新文案）
 * 需在 wx.ready 之后调用
 */
export function setWechatShareContent(shareConfig) {
  if (typeof window === 'undefined' || !window.wx) return
  window.wx.updateAppMessageShareData({
    title: shareConfig.title,
    desc: shareConfig.desc,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
  })
  window.wx.updateTimelineShareData({
    title: shareConfig.title,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
  })
}
