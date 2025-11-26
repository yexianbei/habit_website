import React from 'react'
import { Smartphone } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

// Apple Logo SVG Component
const AppleLogo = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
)

const Hero = () => {
  const { t, language } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* 左侧文字内容 */}
          <div className="text-center md:text-left animate-fade-in">
            {/* App 图标 + 标题 */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <img 
                src="/app_icon.png" 
                alt="Tiny Habits App Icon"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg ring-2 ring-primary/30"
              />
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                {t('hero.title')}
              </h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              {t('hero.subtitle')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              {t('hero.description')}
            </p>
            <p className="text-lg text-gray-500 mb-10">
              {t('hero.tagline')}
            </p>

            {/* 下载按钮和二维码 */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-center md:justify-start">
              {/* 下载按钮 */}
              <a
                href="https://apps.apple.com/app/id6738595702"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <AppleLogo size={24} />
                {t('hero.downloadIOS')}
              </a>

              {/* 二维码 - 小尺寸，适合电脑用户 */}
              <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-lg ring-2 ring-primary/20 w-full sm:w-auto">
                <img 
                  src="/assets/apple_qr_code.png" 
                  alt="Scan to Download"
                  className="w-20 h-20 rounded-lg"
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {language === 'zh' ? '扫码下载' : 'Scan to Download'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {language === 'zh' ? '手机扫描二维码' : 'Scan with phone'}
                  </div>
                </div>
              </div>
              
              {/* Android 按钮暂时隐藏 */}
              {/* <button className="btn-secondary inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                <Smartphone size={24} />
                {t('hero.downloadAndroid')}
              </button> */}
            </div>

            {/* 统计数据 */}
            <div className="mt-10 md:mt-12 grid grid-cols-3 gap-4 md:gap-6 text-sm md:text-base">
              <div>
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-gray-600 text-sm mt-1">{t('hero.stats.users')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">
                  {language === 'zh' ? '500万+' : '5M+'}
                </div>
                <div className="text-gray-600 text-sm mt-1">{t('hero.stats.checkins')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="text-gray-600 text-sm mt-1">{t('hero.stats.rating')}</div>
              </div>
            </div>
          </div>

          {/* 右侧手机展示 - 扇形排列 */}
          <div className="flex justify-center items-center animate-float mt-12 md:mt-0">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] md:w-[460px] md:h-[560px] aspect-[5/7]">
              {/* App Logo - 悬浮在中心上方 */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-50">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[1.5rem] shadow-2xl p-3 ring-4 ring-primary/30">
                  <img 
                    src="/app_icon.png" 
                    alt="Tiny Habits App Icon"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* 第一张截图 - 最左边，旋转 -15 度 */}
              <div className="absolute top-6 md:top-10 left-0 w-[40%] h-[80%] md:w-[220px] md:h-[440px] transform -rotate-[10deg] md:-rotate-[15deg] origin-bottom-right transition-all duration-300 hover:scale-105 hover:-rotate-[6deg] md:hover:-rotate-[10deg] z-10">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    <img 
                      src="/assets/app-screenshot-1.png" 
                      alt="Tiny Habits Screenshot 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 第二张截图 - 左侧，旋转 -8 度 */}
              <div className="absolute top-4 md:top-6 left-[14%] md:left-20 w-[40%] h-[80%] md:w-[220px] md:h-[440px] transform -rotate-[6deg] md:-rotate-[8deg] origin-bottom-right transition-all duration-300 hover:scale-105 hover:-rotate-[3deg] md:hover:-rotate-[4deg] z-20">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    <img 
                      src="/assets/app-screenshot-2.png" 
                      alt="Tiny Habits Screenshot 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 第三张截图 - 右侧，旋转 8 度 */}
              <div className="absolute top-4 md:top-6 right-[14%] md:right-20 w-[40%] h-[80%] md:w-[220px] md:h-[440px] transform rotate-[6deg] md:rotate-[8deg] origin-bottom-left transition-all duration-300 hover:scale-105 hover:rotate-[3deg] md:hover:rotate-[4deg] z-20">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    <img 
                      src="/assets/app-screenshot-3.png" 
                      alt="Tiny Habits Screenshot 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 第四张截图 - 最右边，旋转 15 度 */}
              <div className="absolute top-6 md:top-10 right-0 w-[40%] h-[80%] md:w-[220px] md:h-[440px] transform rotate-[10deg] md:rotate-[15deg] origin-bottom-left transition-all duration-300 hover:scale-105 hover:rotate-[6deg] md:hover:rotate-[10deg] z-10">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    <img 
                      src="/assets/app-screenshot-4.png" 
                      alt="Tiny Habits Screenshot 4"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-gray-400 text-sm mb-2">{t('hero.scrollHint')}</div>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full mx-auto relative">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero

