import React, { useState } from 'react'
import { Calendar, Clock, ExternalLink, BookOpen } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

// 博客分类配置
const categories = [
  { id: 'all', name: { zh: '全部', en: 'All' }, color: 'bg-gray-100 text-gray-700' },
  { id: 'habit', name: { zh: '习惯养成', en: 'Habit Building' }, color: 'bg-blue-100 text-blue-700' },
  { id: 'productivity', name: { zh: '效率提升', en: 'Productivity' }, color: 'bg-green-100 text-green-700' },
  { id: 'time', name: { zh: '时间管理', en: 'Time Management' }, color: 'bg-purple-100 text-purple-700' },
  { id: 'fitness', name: { zh: '健身减肥', en: 'Fitness & Weight Loss' }, color: 'bg-red-100 text-red-700' },
  { id: 'mindfulness', name: { zh: '冥想瑜伽', en: 'Mindfulness & Yoga' }, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'self-discipline', name: { zh: '自律成长', en: 'Self-Discipline' }, color: 'bg-indigo-100 text-indigo-700' }
]

// 示例博客文章数据（后续可以替换为真实内容）
const blogPosts = [
  {
    id: 1,
    title: { zh: '微习惯：为什么每天1分钟比每周1小时更有效？', en: 'Micro Habits: Why 1 Minute Daily Beats 1 Hour Weekly' },
    excerpt: { 
      zh: '探索微习惯的科学原理，了解为什么从小事开始能带来持久改变。通过真实案例和数据，揭示习惯养成的底层逻辑。', 
      en: 'Explore the science behind micro habits and why starting small leads to lasting change. Real cases and data reveal the logic of habit formation.' 
    },
    category: 'habit',
    date: '2024-01-15',
    readTime: { zh: '5分钟', en: '5 min' },
    image: '/assets/app-screenshot-1.png', // 可以使用博客封面图
    externalUrl: 'https://example.com/blog/micro-habits', // 外部文章链接
    featured: true
  },
  {
    id: 2,
    title: { zh: '番茄工作法：如何用25分钟提升专注力', en: 'Pomodoro Technique: Boost Focus in 25 Minutes' },
    excerpt: { 
      zh: '详细介绍番茄工作法的使用技巧，结合小习惯App的计时器功能，帮助你在工作和学习中保持高效专注。', 
      en: 'Learn how to use the Pomodoro Technique effectively with Tiny Habits timer to stay focused and productive.' 
    },
    category: 'productivity',
    date: '2024-01-10',
    readTime: { zh: '6分钟', en: '6 min' },
    image: '/assets/app-screenshot-2.png',
    externalUrl: 'https://example.com/blog/pomodoro',
    featured: false
  },
  {
    id: 3,
    title: { zh: '时间管理的5个黄金法则', en: '5 Golden Rules of Time Management' },
    excerpt: { 
      zh: '从优先级排序到任务分解，掌握时间管理的核心技巧，让你的每一天都更有价值。', 
      en: 'Master time management from prioritization to task breakdown, making every day more valuable.' 
    },
    category: 'time',
    date: '2024-01-05',
    readTime: { zh: '8分钟', en: '8 min' },
    image: '/assets/app-screenshot-3.png',
    externalUrl: 'https://example.com/blog/time-management',
    featured: false
  },
  {
    id: 4,
    title: { zh: '从0到1：如何养成运动习惯', en: 'From Zero to One: Building Exercise Habits' },
    excerpt: { 
      zh: '分享一个上班族如何从每天5个深蹲开始，最终养成规律运动习惯的真实故事。', 
      en: 'A real story of how an office worker started with 5 squats daily and built a consistent exercise routine.' 
    },
    category: 'fitness',
    date: '2024-01-01',
    readTime: { zh: '7分钟', en: '7 min' },
    image: '/assets/app-screenshot-4.png',
    externalUrl: 'https://example.com/blog/exercise-habits',
    featured: false
  },
  {
    id: 5,
    title: { zh: '冥想入门：每天10分钟改变你的生活', en: 'Meditation 101: 10 Minutes Daily to Transform Your Life' },
    excerpt: { 
      zh: '初学者友好的冥想指南，从呼吸练习到正念训练，用最简单的方式开始你的冥想之旅。', 
      en: 'Beginner-friendly meditation guide, from breathing exercises to mindfulness training, start your journey the simplest way.' 
    },
    category: 'mindfulness',
    date: '2023-12-28',
    readTime: { zh: '9分钟', en: '9 min' },
    image: '/assets/app-screenshot-1.png',
    externalUrl: 'https://example.com/blog/meditation',
    featured: false
  },
  {
    id: 6,
    title: { zh: '自律的本质：不是意志力，而是系统', en: 'The Essence of Self-Discipline: Systems, Not Willpower' },
    excerpt: { 
      zh: '深入探讨自律的真正含义，揭示为什么建立系统比依赖意志力更可靠，更持久。', 
      en: 'Explore what self-discipline really means and why building systems beats relying on willpower.' 
    },
    category: 'self-discipline',
    date: '2023-12-25',
    readTime: { zh: '10分钟', en: '10 min' },
    image: '/assets/app-screenshot-2.png',
    externalUrl: 'https://example.com/blog/self-discipline',
    featured: false
  }
]

const Blog = () => {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 根据选择的分类筛选文章
  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  // 获取当前语言的分类名称
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name[language] : ''
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (language === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <section id="blog" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* 标题区域 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen size={32} className="text-primary" />
            <h2 className="section-title mb-0">{t('blog.title')}</h2>
          </div>
          <p className="section-subtitle mb-0">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* 分类筛选器 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? `${category.color} shadow-md scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name[language]}
            </button>
          ))}
        </div>

        {/* 博客文章列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              {/* 文章封面图 */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={post.image}
                  alt={post.title[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {post.featured && (
                  <div className="absolute top-4 left-4 bg-primary text-dark px-3 py-1 rounded-full text-sm font-semibold">
                    {language === 'zh' ? '精选' : 'Featured'}
                  </div>
                )}
                <div className={`absolute top-4 right-4 ${categories.find(c => c.id === post.category)?.color} px-3 py-1 rounded-full text-sm font-medium`}>
                  {getCategoryName(post.category)}
                </div>
              </div>

              {/* 文章内容 */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" itemProp="headline">
                  {post.title[language]}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3" itemProp="description">
                  {post.excerpt[language]}
                </p>

                {/* 文章元信息 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <time dateTime={post.date} itemProp="datePublished">
                      {formatDate(post.date)}
                    </time>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{post.readTime[language]}</span>
                  </div>
                </div>

                {/* 阅读更多按钮 */}
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
                  itemProp="url"
                >
                  {t('blog.readMore')}
                  <ExternalLink size={18} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* 如果没有文章 */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'zh' ? '该分类下暂无文章' : 'No articles in this category'}
            </p>
          </div>
        )}

        {/* SEO: 结构化数据 */}
        {typeof window !== 'undefined' && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Blog',
                name: language === 'zh' ? '小习惯博客' : 'Tiny Habits Blog',
                description: t('blog.subtitle'),
                url: window.location.origin + '/#blog',
                blogPost: filteredPosts.map(post => ({
                  '@type': 'BlogPosting',
                  headline: post.title[language],
                  description: post.excerpt[language],
                  datePublished: post.date,
                  url: post.externalUrl,
                  image: window.location.origin + post.image,
                  author: {
                    '@type': 'Organization',
                    name: language === 'zh' ? '小习惯团队' : 'Tiny Habits Team'
                  }
                }))
              })
            }}
          />
        )}
      </div>
    </section>
  )
}

export default Blog

