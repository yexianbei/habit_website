import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  type = 'website',
  noindex = false 
}) => {
  const { language } = useLanguage()
  const location = useLocation()
  
  const baseUrl = 'https://tinyhabits.top'
  const currentUrl = baseUrl + location.pathname
  
  useEffect(() => {
    // 设置页面标题
    if (title) {
      document.title = title
    }
    
    // 设置或更新meta标签
    const setMetaTag = (name, content, property = false) => {
      if (!content) return
      
      let element
      if (property) {
        element = document.querySelector(`meta[property="${name}"]`) || document.createElement('meta')
        element.setAttribute('property', name)
      } else {
        element = document.querySelector(`meta[name="${name}"]`) || document.createElement('meta')
        element.setAttribute('name', name)
      }
      element.setAttribute('content', content)
      if (!element.parentNode) {
        document.head.appendChild(element)
      }
    }
    
    // 设置基本meta标签
    if (description) {
      setMetaTag('description', description)
      setMetaTag('og:description', description, true)
      setMetaTag('twitter:description', description, true)
    }
    
    if (title) {
      setMetaTag('og:title', title, true)
      setMetaTag('twitter:title', title, true)
    }
    
    if (keywords) {
      setMetaTag('keywords', keywords)
    }
    
    // Open Graph标签
    setMetaTag('og:url', currentUrl, true)
    setMetaTag('og:type', type, true)
    if (image) {
      const imageUrl = image.startsWith('http') ? image : baseUrl + image
      setMetaTag('og:image', imageUrl, true)
      setMetaTag('twitter:image', imageUrl, true)
    }
    
    // Twitter卡片
    setMetaTag('twitter:card', 'summary_large_image', true)
    setMetaTag('twitter:url', currentUrl, true)
    
    // 设置canonical链接
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)
    
    // 设置robots
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      setMetaTag('robots', 'index, follow')
    }
    
    // 设置hreflang标签（多语言支持）
    const setHreflang = (lang, url) => {
      let hreflang = document.querySelector(`link[hreflang="${lang}"]`)
      if (!hreflang) {
        hreflang = document.createElement('link')
        hreflang.setAttribute('rel', 'alternate')
        hreflang.setAttribute('hreflang', lang)
        document.head.appendChild(hreflang)
      }
      hreflang.setAttribute('href', url)
    }
    
    // 设置当前语言和替代语言
    setHreflang(language === 'zh' ? 'zh-CN' : 'en', currentUrl)
    setHreflang(language === 'zh' ? 'en' : 'zh-CN', currentUrl)
    setHreflang('x-default', currentUrl)
    
  }, [title, description, keywords, image, type, currentUrl, language, noindex])
  
  return null
}

export default SEO

