import React from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 bg-white hover:bg-gray-50 text-dark font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
      aria-label="切换语言 / Switch Language"
    >
      <Globe size={20} className="group-hover:rotate-12 transition-transform duration-300" />
      <span className="font-semibold">
        {language === 'zh' ? 'EN' : '中文'}
      </span>
    </button>
  )
}

export default LanguageSwitcher

