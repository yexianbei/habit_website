/**
 * 统一分享 Hook
 * - 在微信内：自动设置当前页的微信分享卡片（若配置了签名接口）
 * - 提供 triggerShare()：App 内调原生，否则复制链接 / Web Share API
 * 使用方式：const { setWechatShare, triggerShare, shareConfig } = useShare(optionalOverrideConfig)
 */

import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  setWechatShareConfig,
  triggerShare as triggerShareUtil,
  normalizeShareConfig,
  getShareConfigFromPage,
} from '../utils/share'
import bridge from '../utils/NativeBridge'

/**
 * @param {import('../utils/share').ShareConfig} [initialConfig] - 页面级分享配置（如从 SEO 传入），会与当前页 og 合并
 * @returns {{ setWechatShare: (config?) => Promise<void>, triggerShare: (config?) => Promise<void>, shareConfig: import('../utils/share').ShareConfig }}
 */
export function useShare(initialConfig) {
  const location = useLocation()
  const configRef = useRef(initialConfig)

  configRef.current = initialConfig

  const getMergedConfig = useCallback(() => {
    return normalizeShareConfig(configRef.current)
  }, [])

  /** 设置微信分享卡片（在微信内打开时调用，如页面 mount 或 SEO 更新后） */
  const setWechatShare = useCallback((override) => {
    const config = override ? normalizeShareConfig(override) : getMergedConfig()
    return setWechatShareConfig(config)
  }, [getMergedConfig])

  /** 触发分享：App 内调原生 share，否则复制链接或系统分享 */
  const triggerShare = useCallback((override) => {
    const config = override ? normalizeShareConfig(override) : getMergedConfig()
    const nativeShare = bridge.isInApp() && typeof bridge.share === 'function'
      ? (payload) => bridge.share(payload)
      : null
    return triggerShareUtil(config, { nativeShare })
  }, [getMergedConfig])

  const shareConfig = getShareConfigFromPage()

  return { setWechatShare, triggerShare, shareConfig }
}

/**
 * 在微信内自动设置分享卡片（根据当前页 og 或传入 config）
 * 用于在页面内调用一次即可，例如在 SEO 已设置好 og 的页面 mount 后调用
 * @param {import('../utils/share').ShareConfig} [config] - 不传则用当前页 og
 */
export function useWechatShare(config) {
  const location = useLocation()
  useEffect(() => {
    setWechatShareConfig(config || undefined)
  }, [location.pathname, location.search, config])
}
