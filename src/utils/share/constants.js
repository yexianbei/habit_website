import { BASE_URL } from '../../config'

/** 分享基础 URL，统一从 config.js 读取 */
export const SHARE_BASE_URL = BASE_URL
/** 默认分享图（与首页 og:image 一致，建议尺寸 300x300 或 1.91:1 如 1200x630） */
export const DEFAULT_SHARE_IMAGE = `${SHARE_BASE_URL}/app_icon.png`
