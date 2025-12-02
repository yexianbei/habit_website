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
import BlogPost from './pages/BlogPost'
import BlogList from './pages/BlogList'

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
const Home = () => (
  <>
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

function App() {
  return (
    <div className="min-h-screen">
      <LanguageSwitcher />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
      </Routes>
    </div>
  )
}

export default App
