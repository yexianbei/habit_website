import React, { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { getViewCount, formatViewCount } from '../utils/viewCounter'

/**
 * 阅读数显示组件
 * @param {Object} props
 * @param {number} props.postId - 文章ID
 * @param {number} props.size - 图标大小，默认18
 * @param {string} props.className - 额外的CSS类名
 * @param {boolean} props.showIcon - 是否显示图标，默认true
 */
const ViewCount = ({ postId, size = 18, className = '', showIcon = true }) => {
  const [viewCount, setViewCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取阅读数
    const fetchViewCount = async () => {
      if (!postId) return
      
      setLoading(true)
      const count = await getViewCount(postId)
      setViewCount(count)
      setLoading(false)
    }

    fetchViewCount()
  }, [postId])

  // 加载中显示占位
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Eye size={size} className="text-gray-400" />}
        <span className="text-gray-400 text-sm">--</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Eye size={size} className="text-gray-600" />}
      <span className="text-gray-600 text-sm">
        {formatViewCount(viewCount)}
      </span>
    </div>
  )
}

export default ViewCount


