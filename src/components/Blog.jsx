import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, BookOpen, Eye } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { blogPosts } from '../data/blogPosts'
import { generatePostSlug } from '../utils/slug'
import { getViewCounts, formatViewCount } from '../utils/viewCounter'

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

const Blog = () => {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewCounts, setViewCounts] = useState({})

  // 先按时间从新到旧排序，再根据选择的分类筛选文章
  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredPosts = selectedCategory === 'all' 
    ? sortedPosts 
    : sortedPosts.filter(post => post.category === selectedCategory)

  // 首页只展示最多两行（每行 3 篇），共 6 篇文章
  const postsToShow = filteredPosts.slice(0, 6)

  // 获取阅读数
  useEffect(() => {
    const fetchViewCounts = async () => {
      const postIds = postsToShow.map(post => post.id)
      const counts = await getViewCounts(postIds)
      setViewCounts(counts)
    }

    if (postsToShow.length > 0) {
      fetchViewCounts()
    }
  }, [postsToShow])

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

  // 获取文章的slug
  const getPostSlug = (post) => {
    if (post.slug && post.slug[language]) {
      return post.slug[language]
    }
    return generatePostSlug(post.title[language], post.id, language)
  }

  return (
    <section id="blog" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* 标题区域 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen size={32} className="text-blue-600" />
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
          {postsToShow.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${getPostSlug(post)}`}
              // 标记来源于首页博客区，便于详情页返回时滚回博客位置
              state={{ from: 'home-blog' }}
              className="block"
            >
              <article
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer h-full flex flex-col"
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
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors" itemProp="headline">
                    {post.title[language]}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1" itemProp="description">
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
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>
                        {viewCounts[post.id] !== undefined
                          ? formatViewCount(viewCounts[post.id])
                          : '--'
                        }
                      </span>
                    </div>
                  </div>

                  {/* 阅读更多按钮 */}
                  <div className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
                    {t('blog.readMore')}
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 显示更多按钮（跳转到完整博客列表页） */}
        {filteredPosts.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-blue-600 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {language === 'zh' ? '显示更多文章' : 'View more articles'}
              <span className="text-lg">↗</span>
            </Link>
          </div>
        )}

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
                blogPost: postsToShow.map(post => ({
                  '@type': 'BlogPosting',
                  headline: post.title[language],
                  description: post.excerpt[language],
                  datePublished: post.date,
                  url: window.location.origin + `/blog/${getPostSlug(post)}`,
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

