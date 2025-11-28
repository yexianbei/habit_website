import React from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import UserStories from './components/UserStories'
import Charts from './components/Charts'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Download from './components/Download'
import Footer from './components/Footer'
import LanguageSwitcher from './components/LanguageSwitcher'

function App() {
  return (
    <div className="min-h-screen">
      <LanguageSwitcher />
      <Hero />
      <Features />
      <UserStories />
      <Charts />
      <Testimonials />
      <Blog />
      <Download />
      <Footer />
    </div>
  )
}

export default App

