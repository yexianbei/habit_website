const encoder = new TextEncoder()
const decoder = new TextDecoder()

function base64UrlToUint8Array(base64Url) {
  const padLength = (4 - (base64Url.length % 4)) % 4
  const base64 = (base64Url + '='.repeat(padLength)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i)
  }
  return bytes
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

async function hmacSha512(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return new Uint8Array(signature)
}

export async function verifyHs512Jwt(token, secret) {
  if (!token || !secret || typeof token !== 'string') {
    return {
      ok: false,
      reason: 'invalid_input',
      payload: null,
      header: null,
      partCount: 0,
    }
  }
  const parts = token.split('.')
  if (parts.length !== 3) {
    return {
      ok: false,
      reason: 'invalid_part_count',
      payload: null,
      header: null,
      partCount: parts.length,
    }
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const data = `${encodedHeader}.${encodedPayload}`

  let header
  let payload
  try {
    header = JSON.parse(decoder.decode(base64UrlToUint8Array(encodedHeader)))
    payload = JSON.parse(decoder.decode(base64UrlToUint8Array(encodedPayload)))
  } catch (_) {
    return {
      ok: false,
      reason: 'decode_failed',
      payload: null,
      header: null,
      partCount: parts.length,
    }
  }

  if (header?.alg !== 'HS512') {
    return {
      ok: false,
      reason: 'alg_not_hs512',
      payload,
      header,
      partCount: parts.length,
    }
  }

  const expected = await hmacSha512(secret, data)
  const actual = base64UrlToUint8Array(encodedSignature)
  if (!timingSafeEqual(expected, actual)) {
    return {
      ok: false,
      reason: 'signature_mismatch',
      payload,
      header,
      partCount: parts.length,
    }
  }

  return {
    ok: true,
    reason: 'ok',
    payload,
    header,
    partCount: parts.length,
  }
}
