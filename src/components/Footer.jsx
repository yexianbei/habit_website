import React from 'react'
import { Mail, Shield, FileText } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo 和简介 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl">
                ✨
              </div>
              <div className="text-2xl font-bold">小习惯</div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              基于微习惯方法 + AI 教练的极简习惯养成工具。
              <br />
              让改变从微小开始，让坚持变得轻松。
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="微信"
              >
                <span className="text-xl">💬</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="微博"
              >
                <span className="text-xl">🐦</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="小红书"
              >
                <span className="text-xl">📕</span>
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  功能特点
                </a>
              </li>
              <li>
                <a href="#stories" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  用户故事
                </a>
              </li>
              <li>
                <a href="#charts" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  数据统计
                </a>
              </li>
              <li>
                <a href="#download" className="text-gray-400 hover:text-primary transition-colors duration-300">
                  立即下载
                </a>
              </li>
            </ul>
          </div>

          {/* 法律信息 */}
          <div>
            <h3 className="font-bold text-lg mb-4">法律信息</h3>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <Shield size={16} />
                  隐私政策
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <FileText size={16} />
                  用户协议
                </a>
              </li>
              <li>
                <a href="mailto:support@xiaoguanxi.com" className="text-gray-400 hover:text-primary transition-colors duration-300 flex items-center gap-2">
                  <Mail size={16} />
                  联系我们
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} 小习惯 App. 保留所有权利。
            </div>
            <div className="text-gray-400 text-sm">
              Made with ❤️ for better habits
            </div>
          </div>
        </div>

        {/* 备案信息（如需要） */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            ICP备案号：京ICP备xxxxxxxx号
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

