import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// 只在初始化时执行一次的语言检测逻辑
const getInitialLanguage = () => {
  // 1）优先使用用户在 localStorage 中保存的选择
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('language')
      if (saved === 'zh' || saved === 'en') {
        return saved
      }
    } catch {
      // 忽略隐私模式等场景下的报错，继续做浏览器语言检测
    }

    // 2）第一次访问：根据浏览器语言进行自动检测
    const navLang =
      (window.navigator.language || window.navigator.userLanguage || '').toLowerCase()

    if (navLang.startsWith('zh')) {
      return 'zh'
    }
  }

  // 3）兜底：默认英文（或你网站的主语言）
  return 'en'
}

export const LanguageProvider = ({ children }) => {
  // 只在第一次渲染时执行 getInitialLanguage（“只做一次自动检测”）
  const [language, setLanguage] = useState(getInitialLanguage)

  // 保存语言偏好到 localStorage，并同步 <html lang="">
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('language', language)
      } catch {
        // 忽略写入失败（比如无痕模式）
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
      }
    }
  }, [language])

  // 切换语言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }

  // 获取翻译文本
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // 如果找不到翻译，返回 key
      }
    }
    
    return value || key
  }

  // 获取数组类型的翻译
  const tArray = (key) => {
    const value = t(key)
    return Array.isArray(value) ? value : []
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    tArray,
    isZh: language === 'zh',
    isEn: language === 'en'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

