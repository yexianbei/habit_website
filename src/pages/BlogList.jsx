import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useNavigationType } from 'react-router-dom'
import { Calendar, Clock, BookOpen, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { blogPosts } from '../data/blogPosts'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { generatePostSlug } from '../utils/slug'

// 博客分类配置（与首页博客区域保持一致）
const categories = [
  { id: 'all', name: { zh: '全部', en: 'All' }, color: 'bg-gray-100 text-gray-700' },
  { id: 'habit', name: { zh: '习惯养成', en: 'Habit Building' }, color: 'bg-blue-100 text-blue-700' },
  { id: 'productivity', name: { zh: '效率提升', en: 'Productivity' }, color: 'bg-green-100 text-green-700' },
  { id: 'time', name: { zh: '时间管理', en: 'Time Management' }, color: 'bg-purple-100 text-purple-700' },
  { id: 'fitness', name: { zh: '健身减肥', en: 'Fitness & Weight Loss' }, color: 'bg-red-100 text-red-700' },
  { id: 'mindfulness', name: { zh: '冥想瑜伽', en: 'Mindfulness & Yoga' }, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'self-discipline', name: { zh: '自律成长', en: 'Self-Discipline' }, color: 'bg-indigo-100 text-indigo-700' }
]

const BlogList = () => {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const navigate = useNavigate()
  const navigationType = useNavigationType()

  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredPosts = selectedCategory === 'all'
    ? sortedPosts
    : sortedPosts.filter(post => post.category === selectedCategory)

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name[language] : ''
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (language === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // 获取文章的slug
  const getPostSlug = (post) => {
    if (post.slug && post.slug[language]) {
      return post.slug[language]
    }
    return generatePostSlug(post.title[language], post.id, language)
  }

  // 在全局 smooth scroll 开启的情况下，程序触发的滚动改为「瞬间滚动」
  const scrollInstantly = (y = 0) => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlBehavior = html.style.scrollBehavior
    const prevBodyBehavior = body.style.scrollBehavior

    html.style.scrollBehavior = 'auto'
    body.style.scrollBehavior = 'auto'
    window.scrollTo(0, y)

    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevHtmlBehavior
      body.style.scrollBehavior = prevBodyBehavior
    })
  }

  // 返回：首页并自动回到博客区域附近
  const handleBackHome = () => {
    navigate('/')
    // 等首页渲染完再定位到 blog 区域
    setTimeout(() => {
      const blogSection = document.getElementById('blog')
      if (blogSection) {
        const offsetTop = blogSection.offsetTop - 20
        scrollInstantly(offsetTop)
      }
    }, 50)
  }

  // 首次从首页进入 /blog 时（PUSH），滚动到文章列表顶部；
  // 从文章详情返回（POP）时，不改变滚动位置，让浏览器恢复。
  useEffect(() => {
    if (navigationType === 'PUSH') {
      scrollInstantly(0)
    }
  }, [navigationType])

  const seoConfig = language === 'zh' ? {
    title: '博客文章 | 习惯养成、时间管理、效率提升 - Tiny Habits',
    description: '探索微习惯、时间管理、效率提升等主题的深度文章。学习如何通过科学的方法养成好习惯，提升生活和工作效率。',
    keywords: '习惯养成,时间管理,效率提升,微习惯,自律,番茄工作法,习惯追踪',
    image: 'https://tinyhabits.top/app_icon.png',
    type: 'website'
  } : {
    title: 'Blog Articles | Habit Building, Time Management, Productivity - Tiny Habits',
    description: 'Explore in-depth articles on micro habits, time management, and productivity. Learn how to build good habits and improve your life with science-based methods.',
    keywords: 'habit building, time management, productivity, micro habits, self-discipline, pomodoro technique',
    image: 'https://tinyhabits.top/app_icon.png',
    type: 'website'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO {...seoConfig} />
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* 标题区域 */}
          <div className="mb-10">
            {/* 返回首页 */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleBackHome}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary text-sm md:text-base transition-colors"
              >
                <ArrowLeft size={18} />
                <span>{language === 'zh' ? '返回首页' : 'Back to Home'}</span>
              </button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <BookOpen size={32} className="text-blue-600" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {language === 'zh' ? '全部博客文章' : 'All Blog Articles'}
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                {t('blog.subtitle')}
              </p>
            </div>
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

          {/* 博客文章列表：新闻风格列表，显示所有符合分类的文章 */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${getPostSlug(post)}`}
                state={{ from: 'blog-list' }}
                className="block"
              >
                <article
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer md:h-60"
                  itemScope
                  itemType="https://schema.org/BlogPosting"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* 文章封面图 */}
                    <div className="md:w-1/3 relative h-48 md:h-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={post.image}
                        alt={post.title[language]}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {post.featured && (
                        <div className="absolute top-3 left-3 bg-primary text-dark px-3 py-1 rounded-full text-xs font-semibold">
                          {language === 'zh' ? '精选' : 'Featured'}
                        </div>
                      )}
                    </div>

                    {/* 文章内容 */}
                    <div className="md:w-2/3 p-6 flex flex-col md:h-full">
                      {/* 分类 & 时间行 */}
                      <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${categories.find(c => c.id === post.category)?.color}`}>
                          {getCategoryName(post.category)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <time dateTime={post.date} itemProp="datePublished">
                            {formatDate(post.date)}
                          </time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{post.readTime[language]}</span>
                        </div>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors" itemProp="headline">
                        {post.title[language]}
                      </h2>
                      <p className="text-gray-600 mb-3 line-clamp-2 md:line-clamp-3 flex-1" itemProp="description">
                        {post.excerpt[language]}
                      </p>

                      {/* 阅读更多按钮 */}
                      <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-base group-hover:gap-3 transition-all duration-300">
                        {t('blog.readMore')}
                        <span className="text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BlogList


