/**
 * 将文本转换为URL友好的slug
 * @param {string} text - 要转换的文本
 * @param {string} lang - 语言代码 ('zh' | 'en')
 * @returns {string} URL友好的slug
 */
export const generateSlug = (text, lang = 'en') => {
  if (!text) return ''
  
  if (lang === 'zh') {
    // 中文处理：移除标点，用连字符连接字符
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '') // 只保留中文、英文、数字、空格、连字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, '') // 移除首尾连字符
      .slice(0, 100) // 限制长度
  } else {
    // 英文处理：转换为小写，移除特殊字符
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 只保留字母、数字、空格、连字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, '') // 移除首尾连字符
      .slice(0, 100) // 限制长度
  }
}

/**
 * 从slug还原ID（用于向后兼容）
 * @param {string} slug - URL slug
 * @returns {number|null} 文章ID或null
 */
export const getIdFromSlug = (slug) => {
  const match = slug.match(/-(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * 为文章标题生成唯一slug（包含ID以确保唯一性）
 * @param {string} title - 文章标题
 * @param {number} id - 文章ID
 * @param {string} lang - 语言代码
 * @returns {string} 唯一的slug
 */
export const generatePostSlug = (title, id, lang = 'en') => {
  const baseSlug = generateSlug(title, lang)
  // 在slug末尾添加ID以确保唯一性和SEO友好性
  return `${baseSlug}-${id}`
}

