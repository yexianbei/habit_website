import React from 'react'
import { Download as DownloadIcon, Smartphone, QrCode } from 'lucide-react'

const Download = () => {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-primary via-yellow-400 to-yellow-300 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-dark mb-6">
            现在就开始你的下一次改变
          </h2>
          <p className="text-xl md:text-2xl text-dark/80 mb-12">
            加入 10 万+ 用户，用微习惯改变生活
          </p>

          {/* 下载按钮 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <a
              href="https://apps.apple.com/app/your-app-id"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-dark hover:bg-gray-800 text-white font-semibold px-10 py-5 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-3 text-lg"
            >
              <DownloadIcon size={28} />
              从 App Store 下载
            </a>
            
            <button className="bg-white/30 backdrop-blur-sm text-dark font-semibold px-10 py-5 rounded-full inline-flex items-center gap-3 text-lg opacity-60 cursor-not-allowed">
              <Smartphone size={28} />
              Android 版（即将推出）
            </button>
          </div>

          {/* 二维码区域 */}
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">二维码占位</div>
                  <div className="text-xs text-gray-400 mt-1">App Store 下载</div>
                </div>
              </div>
              <div className="text-center font-medium text-dark">扫码下载 iOS 版</div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 opacity-60">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">二维码占位</div>
                  <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
                </div>
              </div>
              <div className="text-center font-medium text-dark">Android 版（即将推出）</div>
            </div>
          </div>

          {/* 特性提示 */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-semibold text-dark mb-1">完全免费</div>
              <div className="text-sm text-dark/70">核心功能永久免费使用</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-semibold text-dark mb-1">隐私安全</div>
              <div className="text-sm text-dark/70">数据加密，不会泄露隐私</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl mb-2">☁️</div>
              <div className="font-semibold text-dark mb-1">云端同步</div>
              <div className="text-sm text-dark/70">多设备无缝同步数据</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Download

