import React from 'react'
import { Mail, Shield, FileText } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo 和简介 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/app_icon.png" 
                alt="Tiny Habits App Icon"
                className="w-12 h-12 rounded-2xl shadow-lg"
              />
              <div className="text-2xl font-bold">{t('hero.title')}</div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  {t('footer.links.features')}
                </a>
              </li>
              <li>
                <a href="#stories" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  {t('footer.links.stories')}
                </a>
              </li>
              <li>
                <a href="#charts" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  {t('footer.links.charts')}
                </a>
              </li>
              <li>
                <a href="#download" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  {t('footer.links.download')}
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  {t('footer.links.blog')}
                </a>
              </li>
            </ul>
          </div>

          {/* 法律信息 */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="/privacy.html" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <Shield size={16} />
                  {t('footer.links.privacy')}
                </a>
              </li>
              <li>
                <a href="/terms.html" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <FileText size={16} />
                  {t('footer.links.terms')}
                </a>
              </li>
              <li>
                <a href="mailto:252837151@qq.com" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <Mail size={16} />
                  {t('footer.links.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} {t('hero.title')} App. {t('footer.copyright')}
            </div>
            <div className="text-gray-400 text-sm">
              {t('footer.madeWith')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

