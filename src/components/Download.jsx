import React from 'react'
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

const Download = () => {
  const { t } = useLanguage()

  return (
    <section id="download" className="py-12 md:py-16 bg-gradient-to-br from-primary via-yellow-400 to-yellow-300 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">
            {t('download.title')}
          </h2>
          <p className="text-lg md:text-xl text-dark/80 mb-8">
            {t('download.subtitle')}
          </p>

          {/* 下载按钮 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <a
              href="https://apps.apple.com/app/id1455083310"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-dark hover:bg-gray-800 text-white font-semibold px-10 py-5 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-3 text-lg"
            >
              <AppleLogo size={28} />
              {t('download.downloadIOS')}
            </a>
            
            {/* Android 按钮暂时隐藏 */}
            {/* <button className="bg-white/30 backdrop-blur-sm text-dark font-semibold px-10 py-5 rounded-full inline-flex items-center gap-3 text-lg opacity-60 cursor-not-allowed">
              <Smartphone size={28} />
              {t('download.downloadAndroid')}
            </button> */}
          </div>

          {/* 二维码区域 */}
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <div className="w-40 h-40 rounded-xl overflow-hidden mb-3">
                <img 
                  src="/assets/apple_qr_code.png" 
                  alt="App Store QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center text-sm font-medium text-dark">{t('download.scanIOS')}</div>
            </div>

            {/* Android 二维码暂时隐藏 */}
            {/* <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 opacity-60">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">{t('common.placeholder')}</div>
                  <div className="text-xs text-gray-400 mt-1">{t('common.comingSoon')}</div>
                </div>
              </div>
              <div className="text-center font-medium text-dark">{t('download.scanAndroid')}</div>
            </div> */}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Download

