import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'
import LanguageSwitcher from './components/LanguageSwitcher'
import SEO from './components/SEO'
import LazySection from './components/LazySection'
import { useLanguage } from './i18n/LanguageContext'

// 懒加载非关键组件 - 代码分割
const UserStories = lazy(() => import('./components/UserStories'))
const Charts = lazy(() => import('./components/Charts'))
const Testimonials = lazy(() => import('./components/Testimonials'))
const Blog = lazy(() => import('./components/Blog'))
const Download = lazy(() => import('./components/Download'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const BlogList = lazy(() => import('./pages/BlogList'))

// 习惯功能页面（App 内 WebView 使用）
const PeriodIntro = lazy(() => import('./pages/habit/PeriodIntro'))
const PeriodManagement = lazy(() => import('./pages/habit/PeriodManagement'))
const PeriodOnboarding = lazy(() => import('./pages/habit/PeriodOnboarding'))
const QuitIntro = lazy(() => import('./pages/habit/QuitIntro'))
const QuitManagement = lazy(() => import('./pages/habit/QuitManagement'))
const QuitOnboarding = lazy(() => import('./pages/habit/QuitOnboarding'))
const GradualQuitConfig = lazy(() => import('./pages/habit/GradualQuitConfig'))
const GradualQuitStats = lazy(() => import('./pages/habit/GradualQuitStats'))
const SleepIntro = lazy(() => import('./pages/habit/SleepIntro'))
const SleepManagement = lazy(() => import('./pages/habit/SleepManagement'))
const BodyIntro = lazy(() => import('./pages/habit/BodyIntro'))
const BodyManagement = lazy(() => import('./pages/habit/BodyManagement'))
const LedgerIntro = lazy(() => import('./pages/habit/LedgerIntro'))
const LedgerManagement = lazy(() => import('./pages/habit/LedgerManagement'))
const FlashcardHome = lazy(() => import('./pages/habit/flashcard/FlashcardHome'))
const FlashcardStudy = lazy(() => import('./pages/habit/flashcard/FlashcardStudy'))
const FlashcardImport = lazy(() => import('./pages/habit/flashcard/FlashcardImport'))
const NotFound = lazy(() => import('./pages/NotFound'))
const FlashcardIntro = lazy(() => import('./pages/habit/flashcard/FlashcardIntro'))

// 加载中的占位组件
const LoadingPlaceholder = ({ height = '200px' }) => (
  <div 
    className="w-full bg-gray-50 animate-pulse rounded-lg" 
    style={{ height }}
  />
)

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
      {/* 懒加载非关键组件 - 滚动到视口时才加载 */}
      <LazySection fallback={<LoadingPlaceholder height="400px" />}>
        <Suspense fallback={<LoadingPlaceholder height="400px" />}>
          <UserStories />
        </Suspense>
      </LazySection>
      <LazySection fallback={<LoadingPlaceholder height="600px" />}>
        <Suspense fallback={<LoadingPlaceholder height="600px" />}>
          <Charts />
        </Suspense>
      </LazySection>
      <LazySection fallback={<LoadingPlaceholder height="500px" />}>
        <Suspense fallback={<LoadingPlaceholder height="500px" />}>
          <Testimonials />
        </Suspense>
      </LazySection>
      <LazySection fallback={<LoadingPlaceholder height="800px" />}>
        <Suspense fallback={<LoadingPlaceholder height="800px" />}>
          <Blog />
        </Suspense>
      </LazySection>
      <LazySection fallback={<LoadingPlaceholder height="400px" />}>
        <Suspense fallback={<LoadingPlaceholder height="400px" />}>
          <Download />
        </Suspense>
      </LazySection>
      <Footer />
    </>
  )
}

// 条件渲染语言切换器（在 /habit/ 路径下不显示）
const ConditionalLanguageSwitcher = () => {
  const { pathname } = useLocation()
  
  // 在习惯功能页面不显示语言切换器
  if (pathname.startsWith('/habit/')) {
    return null
  }
  
  return <LanguageSwitcher />
}

function App() {
  return (
    <div className="min-h-screen">
      <ConditionalLanguageSwitcher />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/blog" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="600px" />}>
              <BlogList />
            </Suspense>
          } 
        />
        <Route 
          path="/blog/:slug" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="800px" />}>
              <BlogPost />
            </Suspense>
          } 
        />
        {/* 习惯功能页面 - App 内 WebView 使用 */}
        <Route 
          path="/habit/period/intro" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <PeriodIntro />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/period" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <PeriodManagement />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/period/onboarding" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <PeriodOnboarding />
            </Suspense>
          }
        />
        {/* 闪卡功能页面 */}
        <Route
          path="/habit/flashcard/intro"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <FlashcardIntro />
            </Suspense>
          }
        />
        <Route
          path="/habit/flashcard"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <FlashcardHome />
            </Suspense>
          }
        />
        <Route
          path="/habit/flashcard/import"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <FlashcardImport />
            </Suspense>
          }
        />
        <Route
          path="/habit/flashcard/study/:deckId"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <FlashcardStudy />
            </Suspense>
          }
        />
        <Route 
          path="/habit/quit/intro" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <QuitIntro />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/quit" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <QuitManagement />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/quit/onboarding" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <QuitOnboarding />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/quit/gradual/config" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <GradualQuitConfig />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/quit/gradual/stats" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <GradualQuitStats />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/sleep/intro" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <SleepIntro />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/sleep" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <SleepManagement />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/body/intro" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <BodyIntro />
            </Suspense>
          } 
        />
        <Route 
          path="/habit/body" 
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <BodyManagement />
            </Suspense>
          }
        />
        <Route
          path="/habit/ledger/intro"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <LedgerIntro />
            </Suspense>
          }
        />
        <Route
          path="/habit/ledger"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <LedgerManagement />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingPlaceholder height="100vh" />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </div>
  )
}

export default App
