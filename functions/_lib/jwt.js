const encoder = new TextEncoder()

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
  if (!token || !secret || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const data = `${encodedHeader}.${encodedPayload}`

  let header
  let payload
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedHeader)))
    payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedPayload)))
  } catch (_) {
    return null
  }

  if (header?.alg !== 'HS512') return null

  const expected = await hmacSha512(secret, data)
  const actual = base64UrlToUint8Array(encodedSignature)
  if (!timingSafeEqual(expected, actual)) return null

  return payload
}
