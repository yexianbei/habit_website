const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
}

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {})
  for (const [key, value] of Object.entries(JSON_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value)
  }
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function ok(data) {
  return json({ ok: true, data })
}

export function fail(status, message, details) {
  return json(
    {
      ok: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  )
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch (_) {
    return null
  }
}
