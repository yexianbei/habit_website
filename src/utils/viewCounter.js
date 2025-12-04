// 阅读统计工具函数

const API_ENDPOINT = '/.netlify/functions/view-count'

/**
 * 增加文章的阅读次数
 * @param {number} postId - 文章ID
 * @returns {Promise<number>} - 更新后的阅读次数
 */
export async function incrementViewCount(postId) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId,
        action: 'increment'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.viewCount
    } else {
      throw new Error(data.message || 'Failed to increment view count')
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
    // 静默失败，不影响用户体验
    return null
  }
}

/**
 * 获取文章的阅读次数
 * @param {number} postId - 文章ID
 * @returns {Promise<number>} - 阅读次数
 */
export async function getViewCount(postId) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId,
        action: 'get'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.viewCount || 0
    } else {
      throw new Error(data.message || 'Failed to get view count')
    }
  } catch (error) {
    console.error('Error getting view count:', error)
    // 失败时返回0，不影响UI显示
    return 0
  }
}

/**
 * 批量获取多篇文章的阅读次数
 * @param {number[]} postIds - 文章ID数组
 * @returns {Promise<Object>} - { postId: viewCount } 格式的对象
 */
export async function getViewCounts(postIds) {
  try {
    // 并行请求所有文章的阅读数
    const promises = postIds.map(async (postId) => {
      const count = await getViewCount(postId)
      return { postId, viewCount: count }
    })

    const results = await Promise.all(promises)
    
    // 转换为对象格式 { postId: viewCount }
    return results.reduce((acc, { postId, viewCount }) => {
      acc[postId] = viewCount
      return acc
    }, {})
  } catch (error) {
    console.error('Error getting view counts:', error)
    return {}
  }
}

/**
 * 格式化阅读数显示
 * @param {number} count - 阅读次数
 * @returns {string} - 格式化后的字符串（如：1,234 或 1.2K）
 */
export function formatViewCount(count) {
  if (count === null || count === undefined) {
    return '0'
  }

  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  } else {
    return count.toLocaleString()
  }
}


