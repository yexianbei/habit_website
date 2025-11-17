import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const Terms = () => {
  const { t, language } = useLanguage()

  const content = language === 'zh' ? {
    title: '服务条款',
    lastUpdate: '最后更新日期：2024年11月17日',
    sections: [
      {
        title: '1. 接受条款',
        content: '欢迎使用 Tiny Habits！通过访问或使用本应用，您同意受本服务条款的约束。如果您不同意这些条款，请不要使用本应用。'
      },
      {
        title: '2. 服务说明',
        content: 'Tiny Habits 是一款习惯养成应用，提供以下功能：\n\n• 习惯创建和跟踪\n• 打卡记录和统计\n• AI 智能建议\n• 多设备数据同步（通过 iCloud）\n• 进度可视化和报表\n• 游戏化养成功能\n\n我们保留随时修改、暂停或终止服务的任何部分的权利。'
      },
      {
        title: '3. 用户账户',
        content: '• 您需要提供准确、完整的注册信息。\n• 您有责任保护您的账户密码安全。\n• 您对在您账户下发生的所有活动负责。\n• 如发现任何未经授权的使用，请立即通知我们。\n• 我们保留随时拒绝服务、终止账户的权利。'
      },
      {
        title: '4. 用户行为规范',
        content: '在使用本应用时，您同意不会：\n\n• 违反任何适用的法律法规\n• 侵犯他人的知识产权或其他权利\n• 上传含有病毒或恶意代码的内容\n• 试图未经授权访问我们的系统\n• 干扰或破坏服务的正常运行\n• 使用自动化手段访问服务\n• 进行任何商业性使用（除非获得书面许可）'
      },
      {
        title: '5. 知识产权',
        content: '本应用及其所有内容（包括但不限于文字、图形、图标、界面设计、代码）均受知识产权法保护，归 Tiny Habits 或其授权方所有。未经书面许可，您不得：\n\n• 复制、修改、分发应用内容\n• 反编译、逆向工程应用程序\n• 移除任何版权或所有权声明'
      },
      {
        title: '6. 用户内容',
        content: '• 您保留对自己创建的习惯数据的所有权。\n• 您授予我们使用、存储、备份您数据的必要权限，以提供服务。\n• 您可以随时导出或删除您的数据。\n• 我们不对用户生成的内容负责。'
      },
      {
        title: '7. 免责声明',
        content: '本应用按"现状"和"可用"基础提供，不提供任何明示或暗示的保证，包括但不限于：\n\n• 服务的连续性、及时性、安全性\n• 服务结果的准确性或可靠性\n• 通过服务获得的任何产品、服务或信息的质量\n• AI 建议仅供参考，不构成专业建议\n\n我们不保证服务不会中断或无错误。'
      },
      {
        title: '8. 责任限制',
        content: '在法律允许的最大范围内，Tiny Habits 及其关联方、董事、员工不对以下情况承担责任：\n\n• 任何间接、偶然、特殊或后果性损害\n• 利润、收入、数据或使用的损失\n• 服务中断或数据丢失\n• 第三方行为造成的损失\n\n我们的总责任不超过您在过去12个月内支付给我们的费用（如适用）。'
      },
      {
        title: '9. 订阅和付费',
        content: '• 应用提供免费和付费功能。\n• 付费订阅通过 App Store 处理，受 Apple 的购买条款约束。\n• 订阅价格可能随时更改，但不影响现有订阅。\n• 取消订阅后，您可以继续使用至当前计费周期结束。\n• 退款政策遵循 Apple App Store 的标准政策。'
      },
      {
        title: '10. 隐私保护',
        content: '您的隐私对我们很重要。我们如何收集、使用和保护您的信息详见我们的隐私政策。使用本服务即表示您同意我们的隐私政策。'
      },
      {
        title: '11. 服务变更和终止',
        content: '• 我们可能随时修改或终止服务的任何部分。\n• 我们可能因违反条款而暂停或终止您的访问权限。\n• 终止后，您使用服务的许可立即结束。\n• 终止后的条款（包括免责声明和责任限制）继续有效。'
      },
      {
        title: '12. 适用法律',
        content: '本条款受中华人民共和国法律管辖。任何争议应首先通过友好协商解决，协商不成的，应提交至我们所在地有管辖权的法院解决。'
      },
      {
        title: '13. 条款变更',
        content: '我们保留随时修改本服务条款的权利。重大变更将通过应用内通知或电子邮件通知您。继续使用服务即表示您接受修改后的条款。'
      },
      {
        title: '14. 联系方式',
        content: '如果您对本服务条款有任何疑问，请联系我们：\n\n电子邮件：252837151@qq.com'
      }
    ]
  } : {
    title: 'Terms of Service',
    lastUpdate: 'Last Updated: November 17, 2024',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'Welcome to Tiny Habits! By accessing or using this application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.'
      },
      {
        title: '2. Service Description',
        content: 'Tiny Habits is a habit-building application that provides the following features:\n\n• Habit creation and tracking\n• Check-in records and statistics\n• AI smart recommendations\n• Multi-device data sync (via iCloud)\n• Progress visualization and reports\n• Gamified habit building\n\nWe reserve the right to modify, suspend, or discontinue any part of the service at any time.'
      },
      {
        title: '3. User Accounts',
        content: '• You must provide accurate and complete registration information.\n• You are responsible for keeping your account password secure.\n• You are responsible for all activities that occur under your account.\n• Notify us immediately if you discover any unauthorized use.\n• We reserve the right to refuse service or terminate accounts at any time.'
      },
      {
        title: '4. User Conduct',
        content: 'When using this application, you agree not to:\n\n• Violate any applicable laws or regulations\n• Infringe on others\' intellectual property or other rights\n• Upload content containing viruses or malicious code\n• Attempt unauthorized access to our systems\n• Interfere with or disrupt normal service operations\n• Use automated means to access the service\n• Make any commercial use (unless written permission is obtained)'
      },
      {
        title: '5. Intellectual Property',
        content: 'This application and all its content (including but not limited to text, graphics, icons, interface design, code) are protected by intellectual property laws and owned by Tiny Habits or its licensors. Without written permission, you may not:\n\n• Copy, modify, or distribute application content\n• Decompile or reverse engineer the application\n• Remove any copyright or proprietary notices'
      },
      {
        title: '6. User Content',
        content: '• You retain ownership of your created habit data.\n• You grant us necessary permissions to use, store, and backup your data to provide services.\n• You may export or delete your data at any time.\n• We are not responsible for user-generated content.'
      },
      {
        title: '7. Disclaimer',
        content: 'This application is provided on an "as is" and "as available" basis, without any express or implied warranties, including but not limited to:\n\n• Service continuity, timeliness, security\n• Accuracy or reliability of service results\n• Quality of any products, services, or information obtained through the service\n• AI recommendations are for reference only and do not constitute professional advice\n\nWe do not guarantee that the service will be uninterrupted or error-free.'
      },
      {
        title: '8. Limitation of Liability',
        content: 'To the maximum extent permitted by law, Tiny Habits and its affiliates, directors, employees are not liable for:\n\n• Any indirect, incidental, special, or consequential damages\n• Loss of profits, revenue, data, or use\n• Service interruption or data loss\n• Losses caused by third-party actions\n\nOur total liability does not exceed the fees you paid to us in the past 12 months (if applicable).'
      },
      {
        title: '9. Subscription and Payment',
        content: '• The app offers free and paid features.\n• Paid subscriptions are processed through the App Store and subject to Apple\'s purchase terms.\n• Subscription prices may change at any time but do not affect existing subscriptions.\n• After cancellation, you may continue to use until the end of the current billing period.\n• Refund policy follows Apple App Store\'s standard policy.'
      },
      {
        title: '10. Privacy Protection',
        content: 'Your privacy is important to us. How we collect, use, and protect your information is detailed in our Privacy Policy. By using this service, you agree to our Privacy Policy.'
      },
      {
        title: '11. Service Changes and Termination',
        content: '• We may modify or terminate any part of the service at any time.\n• We may suspend or terminate your access for violating the terms.\n• After termination, your license to use the service ends immediately.\n• Terms after termination (including disclaimers and liability limitations) remain in effect.'
      },
      {
        title: '12. Governing Law',
        content: 'These terms are governed by the laws of the jurisdiction where our company is registered. Any disputes should first be resolved through friendly negotiation; if unsuccessful, they should be submitted to a court with jurisdiction in our location.'
      },
      {
        title: '13. Changes to Terms',
        content: 'We reserve the right to modify these Terms of Service at any time. Significant changes will be notified through in-app notifications or email. Continued use of the service indicates your acceptance of the modified terms.'
      },
      {
        title: '14. Contact Information',
        content: 'If you have any questions about these Terms of Service, please contact us:\n\nEmail: 252837151@qq.com'
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

export default Terms

