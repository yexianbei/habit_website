/**
 * Cloudflare Pages Function: 博客文章阅读统计
 * 路由：/api/view-count
 *
 * 环境变量（在 Cloudflare Pages 控制台配置）：
 *   AIRTABLE_API_KEY     - Airtable Personal Access Token
 *   AIRTABLE_BASE_ID     - Airtable Base ID
 *   AIRTABLE_TABLE_NAME  - 表名，默认 ViewCounts
 */

const DEFAULT_TABLE = 'ViewCounts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS })
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: CORS_HEADERS })
}

export async function onRequestPost({ request, env }) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = env
  const table = AIRTABLE_TABLE_NAME || DEFAULT_TABLE

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return json({ error: 'Server configuration error', message: 'Airtable credentials not configured' }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { postId, action } = body
  if (!postId || !action) {
    return json({ error: 'Missing required parameters', message: 'postId and action are required' }, 400)
  }

  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`
  const airtableHeaders = {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    if (action === 'get') {
      return await getViewCount(postId, baseUrl, airtableHeaders)
    } else if (action === 'increment') {
      return await incrementViewCount(postId, baseUrl, airtableHeaders)
    } else {
      return json({ error: 'Invalid action', message: 'Action must be "get" or "increment"' }, 400)
    }
  } catch (e) {
    return json({ error: 'Internal server error', message: e.message }, 500)
  }
}

async function findRecord(postId, baseUrl, headers) {
  const url = `${baseUrl}?filterByFormula=${encodeURIComponent(`{postId}="${postId}"`)}&maxRecords=1`
  const res = await fetch(url, { headers })
  const data = await res.json()
  return data.records?.[0] ?? null
}

async function getViewCount(postId, baseUrl, headers) {
  const record = await findRecord(postId, baseUrl, headers)
  return json({ success: true, postId, viewCount: record?.fields?.viewCount ?? 0 })
}

async function incrementViewCount(postId, baseUrl, headers) {
  const record = await findRecord(postId, baseUrl, headers)

  if (record) {
    const newCount = (record.fields.viewCount || 0) + 1
    await fetch(baseUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        records: [{ id: record.id, fields: { viewCount: newCount, lastViewed: new Date().toISOString() } }],
      }),
    })
    return json({ success: true, postId, viewCount: newCount })
  } else {
    await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        records: [{ fields: { postId, viewCount: 1, lastViewed: new Date().toISOString() } }],
      }),
    })
    return json({ success: true, postId, viewCount: 1 })
  }
}
