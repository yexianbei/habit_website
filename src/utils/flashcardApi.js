import { getAuthToken } from './quitApi'

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
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
    const traceId = json?.details?.traceId
    const message = traceId ? `${json?.error || `HTTP_${res.status}`} (${traceId})` : (json?.error || `HTTP_${res.status}`)
    const err = new Error(message)
    err.status = res.status
    err.traceId = traceId || null
    throw err
  }
  return json.data
}

export async function getFlashcardDashboardApi() {
  return request('/api/flashcard/dashboard')
}

export async function getFlashcardDeckApi(deckId) {
  return request(`/api/flashcard/decks/${encodeURIComponent(deckId)}`)
}

export async function createFlashcardDeckApi(payload) {
  return request('/api/flashcard/decks', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function reviewFlashcardCardApi(payload) {
  return request('/api/flashcard/review', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export async function deleteFlashcardAllApi() {
  return request('/api/flashcard/all', {
    method: 'DELETE',
  })
}
