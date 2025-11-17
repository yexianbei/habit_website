import React from 'react'
import { GraduationCap, Heart, Briefcase } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

const iconMap = [GraduationCap, Heart, Briefcase]
const colorMap = [
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-green-500 to-emerald-500'
]
const chartPlaceholders = [
  '/assets/chart-student.png',
  '/assets/chart-parent.png',
  '/assets/chart-worker.png'
]

// 真实人物头像 - 来自 Unsplash，符合各自身份特征
const avatarImages = [
  // 学生 - 年轻大学生，学习场景
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&h=200&fit=crop&crop=faces',
  // 父母/妈妈 - 30多岁女性，温暖亲和
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  // 上班族 - 职场人士，专业形象
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces'
]

const UserStories = () => {
  const { t, tArray, language } = useLanguage()
  const stories = tArray('userStories.stories').map((story, index) => ({
    ...story,
    icon: iconMap[index],
    color: colorMap[index],
    chartPlaceholder: chartPlaceholders[index],
    avatar: avatarImages[index],
    age: index === 0 ? 21 : index === 1 ? 35 : 28,
    stats: index === 0 
      ? { days: 60, sessions: 240, hours: 100 }
      : index === 1
      ? { days: 30, habits: 3, completion: 92 }
      : { days: 90, weight: -12, bodyFat: -5 }
  }))

  return (
    <section id="stories" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('userStories.title')}</h2>
          <p className="section-subtitle">
            {t('userStories.subtitle')}
          </p>
        </div>

        <div className="space-y-20">
          {stories.map((story, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* 内容区 */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  {/* 真实人物头像 */}
                  <img 
                    src={story.avatar}
                    alt={story.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20 shadow-lg"
                    loading="lazy"
                  />
                  {/* 角色图标（小） */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${story.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                    <story.icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{story.name}</div>
                    <div className="text-gray-600">
                      {story.role} · {story.age}{language === 'zh' ? '岁' : ' years old'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-primary mb-2">🎯 {t('userStories.labels.goal')}</div>
                    <div className="text-lg">{story.goal}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-red-500 mb-2">😰 {t('userStories.labels.challenge')}</div>
                    <div className="text-gray-600">{story.challenge}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-blue-500 mb-2">💡 {t('userStories.labels.solution')}</div>
                    <div className="text-gray-600">{story.solution}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-green-500 mb-2">✨ {t('userStories.labels.result')}</div>
                    <div className="text-lg font-medium">{story.result}</div>
                  </div>
                </div>

                {/* 数据统计 */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {Object.entries(story.stats).map(([key, value], i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {typeof value === 'number' && value > 0 ? '+' : ''}{value}
                        {key === 'completion' ? '%' : ''}
                        {key === 'weight' ? (language === 'zh' ? '斤' : 'kg') : ''}
                        {key === 'bodyFat' ? '%' : ''}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t(`userStories.stats.${key}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 图表区 */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="card">
                  <div className="text-sm font-semibold text-gray-500 mb-4">
                    {story.chartType}
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-5xl mb-4">📊</div>
                      <div className="text-gray-600 font-medium">{t('common.chartPlaceholder')}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {story.chartPlaceholder}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserStories

