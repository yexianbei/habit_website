// Netlify Function: 处理博客文章阅读统计
// 需要安装依赖：npm install --save airtable

const Airtable = require('airtable')

// 从环境变量读取配置
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'ViewCounts'

// 初始化 Airtable（使用 API Key）
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY
})

// 获取 Base 实例（在 handler 内部初始化，以便环境变量可用）

// CORS 响应头
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
}

exports.handler = async (event, context) => {
  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // 验证环境变量
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('Missing Airtable configuration')
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error',
        message: 'Airtable credentials not configured'
      })
    }
  }

  try {
    // 初始化 Base 实例（每次请求时创建）
    const base = Airtable.base(AIRTABLE_BASE_ID)

    const { postId, action } = JSON.parse(event.body || '{}')

    // 验证参数
    if (!postId || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameters',
          message: 'postId and action are required'
        })
      }
    }

    if (action === 'increment') {
      // 增加阅读次数
      return await incrementViewCount(postId, base)
    } else if (action === 'get') {
      // 获取阅读次数
      return await getViewCount(postId, base)
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid action',
          message: 'Action must be "increment" or "get"'
        })
      }
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}

// 增加阅读次数
async function incrementViewCount(postId, base) {
  try {
    // 先查找是否存在该文章记录
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        filterByFormula: `{postId} = ${postId}`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length > 0) {
      // 记录已存在，更新阅读次数
      const record = records[0]
      const currentCount = record.fields.viewCount || 0
      
      await base(AIRTABLE_TABLE_NAME).update([
        {
          id: record.id,
          fields: {
            viewCount: currentCount + 1,
            lastViewed: new Date().toISOString()
          }
        }
      ])

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          postId,
          viewCount: currentCount + 1
        })
      }
    } else {
      // 记录不存在，创建新记录
      const newRecord = await base(AIRTABLE_TABLE_NAME).create([
        {
          fields: {
            postId: postId,
            viewCount: 1,
            lastViewed: new Date().toISOString()
          }
        }
      ])

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          postId,
          viewCount: 1
        })
      }
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to increment view count',
        message: error.message
      })
    }
  }
}

// 获取阅读次数
async function getViewCount(postId, base) {
  try {
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        filterByFormula: `{postId} = ${postId}`,
        maxRecords: 1
      })
      .firstPage()

    if (records.length > 0) {
      const viewCount = records[0].fields.viewCount || 0
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          postId,
          viewCount
        })
      }
    } else {
      // 记录不存在，返回0
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          postId,
          viewCount: 0
        })
      }
    }
  } catch (error) {
    console.error('Error getting view count:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get view count',
        message: error.message
      })
    }
  }
}

