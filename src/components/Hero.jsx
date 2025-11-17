import React from 'react'
import { Download, Smartphone } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 左侧文字内容 */}
          <div className="text-center md:text-left animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              小习惯
              <span className="block text-primary">更轻松地养成习惯</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              基于微习惯方法 + AI 教练的极简习惯养成工具
            </p>
            <p className="text-lg text-gray-500 mb-10">
              每天 1 分钟也能坚持，让改变从微小开始
            </p>

            {/* 下载按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="#download"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Download size={24} />
                App Store 下载
              </a>
              <button className="btn-secondary inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                <Smartphone size={24} />
                Android 下载（Coming Soon）
              </button>
            </div>

            {/* 统计数据 */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-gray-600 text-sm mt-1">活跃用户</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500万+</div>
                <div className="text-gray-600 text-sm mt-1">习惯打卡</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="text-gray-600 text-sm mt-1">用户评分</div>
              </div>
            </div>
          </div>

          {/* 右侧手机展示 */}
          <div className="flex justify-center animate-float">
            <div className="relative">
              {/* 手机外框 */}
              <div className="w-[300px] h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* 占位图 - 可替换为真实截图 */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-yellow-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">📱</div>
                      <div className="text-gray-600 font-medium">App 截图占位</div>
                      <div className="text-sm text-gray-500 mt-2">
                        替换为: /assets/app-screenshot.png
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 装饰元素 */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="text-gray-400 text-sm mb-2">向下滚动探索更多</div>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full mx-auto relative">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero

