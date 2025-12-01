import React, { useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { getPostById } from '../data/blogPosts'
import Footer from '../components/Footer'
import LanguageSwitcher from '../components/LanguageSwitcher'

const categories = [
  { id: 'habit', name: { zh: '习惯养成', en: 'Habit Building' }, color: 'bg-blue-100 text-blue-700' },
  { id: 'productivity', name: { zh: '效率提升', en: 'Productivity' }, color: 'bg-green-100 text-green-700' },
  { id: 'time', name: { zh: '时间管理', en: 'Time Management' }, color: 'bg-purple-100 text-purple-700' },
  { id: 'fitness', name: { zh: '健身减肥', en: 'Fitness & Weight Loss' }, color: 'bg-red-100 text-red-700' },
  { id: 'mindfulness', name: { zh: '冥想瑜伽', en: 'Mindfulness & Yoga' }, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'self-discipline', name: { zh: '自律成长', en: 'Self-Discipline' }, color: 'bg-indigo-100 text-indigo-700' }
]

const BlogPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguage()
  const post = getPostById(id)

  // 在全局开启 smooth scroll 的情况下，程序触发的滚动改为「瞬间滚动」
  const scrollInstantly = (y = 0) => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlBehavior = html.style.scrollBehavior
    const prevBodyBehavior = body.style.scrollBehavior

    html.style.scrollBehavior = 'auto'
    body.style.scrollBehavior = 'auto'
    window.scrollTo(0, y)

    // 下一帧恢复原来的行为，保证用户自己滚动/点击锚点依然是平滑的
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevHtmlBehavior
      body.style.scrollBehavior = prevBodyBehavior
    })
  }

  // 页面加载时滚动到顶部（强制无动画）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      scrollInstantly(0)
    }
  }, [id])

  // 返回：区分来源
  const handleBack = () => {
    const from = location.state?.from

    // 从首页博客区进来的：回到首页并滚动到博客板块
    if (from === 'home-blog') {
      navigate('/')
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const blogSection = document.getElementById('blog')
          if (blogSection) {
            const offsetTop = blogSection.offsetTop - 20

            const html = document.documentElement
            const body = document.body
            const prevHtmlBehavior = html.style.scrollBehavior
            const prevBodyBehavior = body.style.scrollBehavior

            html.style.scrollBehavior = 'auto'
            body.style.scrollBehavior = 'auto'
            window.scrollTo(0, offsetTop)

            requestAnimationFrame(() => {
              html.style.scrollBehavior = prevHtmlBehavior
              body.style.scrollBehavior = prevBodyBehavior
            })
          }
        }
      }, 50)
      return
    }

    // 其他情况（例如从 /blog 列表进来），交给浏览器历史处理，保留原列表位置
    navigate(-1)
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <Link to="/#blog" className="text-primary hover:underline">返回博客</Link>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.id === post.category)
  const categoryName = category ? category.name[language] : ''
  const categoryColor = category ? category.color : ''

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (language === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title[language],
        text: post.excerpt[language],
        url: window.location.href
      })
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert(language === 'zh' ? '链接已复制到剪贴板' : 'Link copied to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <LanguageSwitcher />
      
      {/* 文章头部 */}
      <article className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{language === 'zh' ? '返回博客' : 'Back to Blog'}</span>
          </button>

          {/* 分类标签 */}
          <div className={`inline-block ${categoryColor} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
            {categoryName}
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" itemProp="headline">
            {post.title[language]}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <time dateTime={post.date} itemProp="datePublished">
                {formatDate(post.date)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.readTime[language]}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Share2 size={18} />
              <span>{language === 'zh' ? '分享' : 'Share'}</span>
            </button>
          </div>

          {/* 封面图 */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={post.image}
              alt={post.title[language]}
              className="w-full h-auto object-cover"
              itemProp="image"
            />
          </div>

          {/* 文章内容 */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-2 prose-strong:text-gray-900 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4"
            dangerouslySetInnerHTML={{ __html: post.content[language] }}
            itemProp="articleBody"
          />

          {/* 分隔线 */}
          <div className="border-t my-12"></div>

          {/* 返回博客按钮 */}
          <div className="text-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-primary hover:bg-yellow-400 text-dark font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={20} />
              <span>{language === 'zh' ? '查看更多文章' : 'View More Articles'}</span>
            </button>
          </div>
        </div>
      </article>

      {/* SEO: 结构化数据 */}
      {typeof window !== 'undefined' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title[language],
              description: post.excerpt[language],
              datePublished: post.date,
              image: window.location.origin + post.image,
              author: {
                '@type': 'Organization',
                name: language === 'zh' ? '小习惯团队' : 'Tiny Habits Team'
              },
              publisher: {
                '@type': 'Organization',
                name: language === 'zh' ? '小习惯' : 'Tiny Habits',
                logo: {
                  '@type': 'ImageObject',
                  url: window.location.origin + '/app_icon.png'
                }
              }
            })
          }}
        />
      )}

      <Footer />
    </div>
  )
}

export default BlogPost

