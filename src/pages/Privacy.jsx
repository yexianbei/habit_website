import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const Privacy = () => {
  const { t, language } = useLanguage()

  const content = language === 'zh' ? {
    title: '隐私政策',
    lastUpdate: '最后更新日期：2024年11月17日',
    sections: [
      {
        title: '1. 引言',
        content: '欢迎使用 Tiny Habits（以下简称"我们"或"本应用"）。我们非常重视您的隐私，并致力于保护您的个人信息。本隐私政策旨在帮助您了解我们如何收集、使用、存储和保护您的信息。'
      },
      {
        title: '2. 我们收集的信息',
        content: '我们可能收集以下类型的信息：\n\n• 账户信息：当您注册账户时，我们会收集您的电子邮件地址和密码（加密存储）。\n• 使用数据：包括您的习惯打卡记录、完成情况、统计数据等。\n• 设备信息：设备型号、操作系统版本、唯一设备标识符等技术信息。\n• CloudKit 同步数据：如果您选择使用 iCloud 同步功能，您的习惯数据将通过 Apple CloudKit 同步。'
      },
      {
        title: '3. 信息的使用',
        content: '我们使用收集的信息用于：\n\n• 提供和改进应用服务\n• 同步您的习惯数据\n• 生成个性化的统计报告和 AI 建议\n• 保护您的账户安全\n• 响应您的客户支持请求\n• 发送重要的服务通知'
      },
      {
        title: '4. 数据存储和安全',
        content: '• 您的数据主要存储在您的本地设备上。\n• 如果您启用 iCloud 同步，数据将通过 Apple CloudKit 安全地存储在 iCloud 中。\n• 我们采用行业标准的加密技术保护您的数据传输和存储。\n• 我们不会将您的个人数据出售给第三方。'
      },
      {
        title: '5. 数据共享',
        content: '我们不会与第三方共享您的个人信息，除非：\n\n• 获得您的明确同意\n• 遵守法律法规或政府要求\n• 保护我们的合法权益\n• 使用第三方服务提供商（如 Apple CloudKit）提供服务，这些服务提供商需遵守严格的隐私协议'
      },
      {
        title: '6. 您的权利',
        content: '您有权：\n\n• 访问和更新您的个人信息\n• 删除您的账户和所有相关数据\n• 导出您的习惯数据\n• 选择退出数据同步功能\n• 拒绝接收非必要的通知'
      },
      {
        title: '7. 儿童隐私',
        content: '我们的服务面向13岁及以上的用户。我们不会有意收集13岁以下儿童的个人信息。如果您发现我们收集了儿童信息，请联系我们，我们将立即删除。'
      },
      {
        title: '8. 隐私政策的变更',
        content: '我们可能会不时更新本隐私政策。我们会在应用内通知您重大变更，并更新本页面顶部的"最后更新日期"。'
      },
      {
        title: '9. 联系我们',
        content: '如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：\n\n电子邮件：252837151@qq.com'
      }
    ]
  } : {
    title: 'Privacy Policy',
    lastUpdate: 'Last Updated: November 17, 2024',
    sections: [
      {
        title: '1. Introduction',
        content: 'Welcome to Tiny Habits (hereinafter referred to as "we" or "the App"). We value your privacy and are committed to protecting your personal information. This Privacy Policy is designed to help you understand how we collect, use, store, and protect your information.'
      },
      {
        title: '2. Information We Collect',
        content: 'We may collect the following types of information:\n\n• Account Information: When you register for an account, we collect your email address and password (encrypted storage).\n• Usage Data: Including your habit check-in records, completion status, statistics, etc.\n• Device Information: Device model, operating system version, unique device identifiers, and other technical information.\n• CloudKit Sync Data: If you choose to use iCloud sync, your habit data will be synced through Apple CloudKit.'
      },
      {
        title: '3. Use of Information',
        content: 'We use the collected information to:\n\n• Provide and improve app services\n• Sync your habit data\n• Generate personalized statistics and AI recommendations\n• Protect your account security\n• Respond to your customer support requests\n• Send important service notifications'
      },
      {
        title: '4. Data Storage and Security',
        content: '• Your data is primarily stored on your local device.\n• If you enable iCloud sync, data will be securely stored in iCloud through Apple CloudKit.\n• We use industry-standard encryption to protect your data transmission and storage.\n• We do not sell your personal data to third parties.'
      },
      {
        title: '5. Data Sharing',
        content: 'We do not share your personal information with third parties unless:\n\n• We have obtained your explicit consent\n• Required by law or government regulations\n• To protect our legitimate interests\n• Using third-party service providers (such as Apple CloudKit) to provide services, who must comply with strict privacy agreements'
      },
      {
        title: '6. Your Rights',
        content: 'You have the right to:\n\n• Access and update your personal information\n• Delete your account and all related data\n• Export your habit data\n• Opt out of data sync features\n• Decline non-essential notifications'
      },
      {
        title: '7. Children\'s Privacy',
        content: 'Our service is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you discover that we have collected information from a child, please contact us and we will delete it immediately.'
      },
      {
        title: '8. Changes to Privacy Policy',
        content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes within the app and update the "Last Updated" date at the top of this page.'
      },
      {
        title: '9. Contact Us',
        content: 'If you have any questions or suggestions about this Privacy Policy, please contact us:\n\nEmail: 252837151@qq.com'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft size={20} />
              {language === 'zh' ? '返回首页' : 'Back to Home'}
            </a>
            <div className="flex items-center gap-3">
              <img 
                src="/app_icon.png" 
                alt="Tiny Habits"
                className="w-10 h-10 rounded-xl"
              />
              <span className="text-xl font-bold">Tiny Habits</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {content.title}
          </h1>
          <p className="text-gray-500 mb-12">{content.lastUpdate}</p>

          <div className="prose prose-lg max-w-none">
            {content.sections.map((section, index) => (
              <div key={index} className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Tiny Habits App. {language === 'zh' ? '保留所有权利。' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  )
}

export default Privacy

