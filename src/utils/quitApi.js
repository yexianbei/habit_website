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

function readTokenFromHash() {
  if (typeof window === 'undefined') return ''
  const hash = (window.location.hash || '').replace(/^#/, '')
  if (!hash) return ''
  const params = new URLSearchParams(hash.startsWith('?') ? hash.slice(1) : hash)
  const token = params.get('token') || params.get('access_token') || ''
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

function normalizeToken(raw) {
  const token = String(raw || '').trim()
  if (!token) return ''
  if (/^bearer\s+/i.test(token)) {
    return token.replace(/^bearer\s+/i, '').trim()
  }
  return token
}

function cleanupTokenInUrl() {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    const changed =
      url.searchParams.has('token')
      || url.searchParams.has('access_token')
      || (window.location.hash || '').includes('token=')
      || (window.location.hash || '').includes('access_token=')

    url.searchParams.delete('token')
    url.searchParams.delete('access_token')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash ? '' : ''}`)

    if (changed) {
      const withoutHashToken = window.location.hash
        .replace(/token=[^&]*/g, '')
        .replace(/access_token=[^&]*/g, '')
        .replace(/[#?&]+$/g, '')
      if (withoutHashToken !== window.location.hash) {
        window.history.replaceState({}, '', `${url.pathname}${url.search}${withoutHashToken}`)
      }
    }
  } catch (_) {}
}

export async function getAuthToken() {
  const urlToken = normalizeToken(readTokenFromUrl())
  if (urlToken) {
    cacheToken(urlToken)
    cleanupTokenInUrl()
    return urlToken
  }
  const hashToken = normalizeToken(readTokenFromHash())
  if (hashToken) {
    cacheToken(hashToken)
    cleanupTokenInUrl()
    return hashToken
  }
  const stored = normalizeToken(readTokenFromStorage())
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

export async function deleteQuitAllApi() {
  return request('/api/quit/all', {
    method: 'DELETE',
  })
}
