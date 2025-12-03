import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Hero from './components/Hero'
import Features from './components/Features'
import UserStories from './components/UserStories'
import Charts from './components/Charts'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Download from './components/Download'
import Footer from './components/Footer'
import LanguageSwitcher from './components/LanguageSwitcher'
import SEO from './components/SEO'
import BlogPost from './pages/BlogPost'
import BlogList from './pages/BlogList'
import { useLanguage } from './i18n/LanguageContext'

// 路由滚动处理组件
const ScrollToTop = () => {
  const { pathname } = useLocation()
  
  useEffect(() => {
    // 在全局 smooth scroll 开启的情况下，强制「瞬间滚动」
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

    // 文章详情页：任何方式进入都滚到顶部
    if (pathname.startsWith('/blog/')) {
      scrollInstantly(0)
    }
  }, [pathname])
  
  return null
}

// 主页组件
const Home = () => {
  const { language } = useLanguage()
  
  const seoConfig = language === 'zh' ? {
    title: 'Tiny Habits - 小习惯 | 微习惯养成工具，AI教练助力习惯养成',
    description: '基于微习惯方法和AI教练的极简习惯养成工具。每天1分钟也能坚持，让改变从微小开始。支持习惯追踪、番茄钟、数据统计等功能。',
    keywords: '习惯养成,微习惯,习惯追踪,AI教练,番茄钟,时间管理,习惯打卡,自律工具,小习惯',
    image: 'https://tinyhabits.top/app_icon.png'
  } : {
    title: 'Tiny Habits - Habit Tracker & Time Management App | Build Better Habits',
    description: 'Build lasting habits with Tiny Habits - A powerful habit tracker and time management app. Use micro-habits method, AI coach, and Pomodoro timer to achieve your goals. Start free today!',
    keywords: 'habit tracker, habit building, time management, productivity app, micro habits, tiny habits, pomodoro timer, goal tracking, daily habits',
    image: 'https://tinyhabits.top/app_icon.png'
  }
  
  return (
    <>
      <SEO {...seoConfig} />
      {/* Organization结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Tiny Habits',
            alternateName: '小习惯',
            url: 'https://tinyhabits.top',
            logo: 'https://tinyhabits.top/app_icon.png',
            description: language === 'zh' 
              ? '基于微习惯方法和AI教练的极简习惯养成工具'
              : 'A powerful habit tracker and time management app using micro-habits method and AI coach',
            sameAs: [
              'https://apps.apple.com/app/id1455083310'
            ]
          })
        }}
      />
      <Hero />
      <Features />
      <UserStories />
      <Charts />
      <Testimonials />
      <Blog />
      <Download />
      <Footer />
    </>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <LanguageSwitcher />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </div>
  )
}

export default App
