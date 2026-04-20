function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

function readTokenFromUrl() {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  const token = url.searchParams.get('token') || url.searchParams.get('access_token') || ''
  return token.trim()
}

function readTokenFromStorage() {
  if (typeof window === 'undefined') return ''
  return (
    sessionStorage.getItem('habit_auth_token')
    || localStorage.getItem('habit_auth_token')
    || ''
  ).trim()
}

function cacheToken(token) {
  if (!token || typeof window === 'undefined') return
  sessionStorage.setItem('habit_auth_token', token)
}

export async function getAuthToken() {
  const urlToken = readTokenFromUrl()
  if (urlToken) {
    cacheToken(urlToken)
    return urlToken
  }
  const stored = readTokenFromStorage()
  if (stored) return stored
  return ''
}

async function request(path, options = {}) {
  const token = await getAuthToken()
  if (!token) {
    const err = new Error('MISSING_TOKEN')
    err.code = 'MISSING_TOKEN'
    throw err
  }

  const headers = new Headers(options.headers || {})
  headers.set('authorization', `Bearer ${token}`)
  if (!headers.has('content-type') && options.body) {
    headers.set('content-type', 'application/json')
  }

  const res = await fetch(`${resolveApiBase()}${path}`, {
    ...options,
    headers,
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) {
    const message = json?.error || `HTTP_${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return json.data
}

export async function getQuitProfileApi() {
  return request('/api/quit/profile')
}

export async function updateQuitProfileApi(payload) {
  return request('/api/quit/profile', {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export async function getQuitEventsApi(startDate, endDate) {
  const q = new URLSearchParams({
    startDate,
    endDate,
  })
  return request(`/api/quit/events?${q.toString()}`)
}

export async function createQuitEventApi(payload) {
  return request('/api/quit/events', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function getQuitStatsApi(startDate, endDate) {
  const q = new URLSearchParams({
    startDate,
    endDate,
  })
  return request(`/api/quit/stats?${q.toString()}`)
}

export async function hasWorkerAuthToken() {
  const token = await getAuthToken()
  return Boolean(token)
}

export async function getGradualPlanApi() {
  return request('/api/quit/gradual/plan')
}

export async function updateGradualPlanApi(payload) {
  return request('/api/quit/gradual/plan', {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export async function getGradualDailyCountApi(date) {
  const q = new URLSearchParams({ date })
  return request(`/api/quit/gradual/daily-count?${q.toString()}`)
}

export async function saveGradualDailyCountApi(payload) {
  return request('/api/quit/gradual/daily-count', {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export async function getGradualLastSmokeApi() {
  return request('/api/quit/gradual/last-smoke')
}

export async function getGradualRecordsApi(startDate, endDate) {
  const q = new URLSearchParams({ startDate, endDate })
  return request(`/api/quit/gradual/records?${q.toString()}`)
}
