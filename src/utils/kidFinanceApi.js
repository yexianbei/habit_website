import { getAuthToken } from './quitApi'

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
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
  if (!headers.has('content-type') && options.body) headers.set('content-type', 'application/json')

  const res = await fetch(`${resolveApiBase()}${path}`, { ...options, headers })
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
  return request(`/api/kid-finance/dashboard${q.toString() ? `?${q.toString()}` : ''}`)
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
