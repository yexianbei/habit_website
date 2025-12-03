import React, { useEffect, useRef, useState } from 'react'

/**
 * 懒加载组件包装器
 * 使用 Intersection Observer 实现滚动到视口时才加载组件
 */
const LazySection = ({ children, fallback = null, rootMargin = '100px' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          // 一旦加载就不再观察
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      {
        rootMargin,
        threshold: 0.01
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [rootMargin, hasLoaded])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}

export default LazySection
