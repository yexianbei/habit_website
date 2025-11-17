import React from 'react'
import { Star } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

// 使用 Unsplash 的人物照片
// 这些是精选的专业人物照片，适合作为用户头像
const avatarImages = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces', // 男性 - 产品经理
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces', // 女性 - 妈妈
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', // 男性 - 程序员
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces', // 女性 - 自由职业者
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', // 男性 - 大学生
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'  // 女性 - 小白领
]

// 为每个用户评价设置不同的标签颜色（柔和的配色）
const tagColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },      // 蓝色
  { bg: 'bg-pink-100', text: 'text-pink-700' },      // 粉色
  { bg: 'bg-green-100', text: 'text-green-700' },    // 绿色
  { bg: 'bg-purple-100', text: 'text-purple-700' },  // 紫色
  { bg: 'bg-orange-100', text: 'text-orange-700' },  // 橙色
  { bg: 'bg-indigo-100', text: 'text-indigo-700' }   // 靛蓝色
]

const Testimonials = () => {
  const { t, tArray } = useLanguage()
  const testimonials = tArray('testimonials.items').map((item, index) => ({
    ...item,
    avatar: avatarImages[index],
    rating: 5,
    tagColor: tagColors[index]
  }))

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('testimonials.title')}</h2>
          <p className="section-subtitle">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 头像和信息 */}
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  loading="lazy"
                />
                <div>
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>

              {/* 评分 */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#FFCE00" stroke="#FFCE00" />
                ))}
              </div>

              {/* 评价内容 */}
              <p className="text-gray-700 leading-relaxed mb-4">
                "{testimonial.content}"
              </p>

              {/* 亮点标签 */}
              <div className={`inline-block ${testimonial.tagColor.bg} ${testimonial.tagColor.text} px-4 py-2 rounded-full text-sm font-medium`}>
                ✨ {testimonial.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* App Store 评分展示 */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-6xl font-bold text-primary">4.8</div>
              <div className="text-left">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} fill="#FFCE00" stroke="#FFCE00" />
                  ))}
                </div>
                <div className="text-gray-600 mt-1">{t('testimonials.appStoreRating')}</div>
              </div>
            </div>
            <div className="text-gray-500">{t('testimonials.basedOn')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

