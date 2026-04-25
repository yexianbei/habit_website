import { getAuthToken } from './quitApi'

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

async function request(path, options = {}) {
  const { timeoutMs = 12000, ...fetchOptions } = options
  const token = await getAuthToken()
  if (!token) {
    const err = new Error('MISSING_TOKEN')
    err.code = 'MISSING_TOKEN'
    throw err
  }

  const headers = new Headers(fetchOptions.headers || {})
  headers.set('authorization', `Bearer ${token}`)
  if (!headers.has('content-type') && fetchOptions.body) headers.set('content-type', 'application/json')

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timeoutId = controller
    ? setTimeout(() => {
      controller.abort()
    }, timeoutMs)
    : null

  let res
  try {
    res = await fetch(`${resolveApiBase()}${path}`, { ...fetchOptions, headers, signal: controller?.signal })
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('REQUEST_TIMEOUT')
      err.code = 'REQUEST_TIMEOUT'
      throw err
    }
    throw error
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) {
    const err = new Error(json?.error || `HTTP_${res.status}`)
    err.status = res.status
    err.details = json?.details || null
    throw err
  }
  return json.data
}

export function getKidFinanceDashboardApi(today) {
  const q = new URLSearchParams()
  if (today) q.set('today', today)
  const path = `/api/kid-finance/dashboard${q.toString() ? `?${q.toString()}` : ''}`
  return request(path, { timeoutMs: 8000 }).catch((error) => {
    const shouldRetry =
      error?.code === 'REQUEST_TIMEOUT'
      || error?.status >= 500
      || error?.message === '获取财商看板失败'
    if (!shouldRetry) throw error
    return request(path, { timeoutMs: 10000 })
  })
}

export function createKidFinanceRecordApi(payload) {
  return request('/api/kid-finance/records', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function createKidFinanceDepositApi(payload) {
  return request('/api/kid-finance/deposits', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function withdrawKidFinanceApi(payload) {
  return request('/api/kid-finance/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function updateKidFinanceSettingsApi(payload) {
  return request('/api/kid-finance/settings', {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export function upsertKidFinanceTaskApi(payload) {
  return request('/api/kid-finance/tasks', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function deleteKidFinanceTaskApi(taskId) {
  return request(`/api/kid-finance/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  })
}

export function setKidFinanceTaskCheckApi(payload) {
  return request('/api/kid-finance/tasks/check', {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export function deleteKidFinanceAllApi() {
  return request('/api/kid-finance/all', {
    method: 'DELETE',
  })
}
