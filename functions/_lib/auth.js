import { verifyHs512Jwt } from './jwt'
import { fail } from './http'

function readBearerToken(request) {
  const auth = request.headers.get('authorization') || ''
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim()
  }
  const alt = request.headers.get('x-access-token')
  return alt ? alt.trim() : ''
}

function buildTraceId(request) {
  const ray = request.headers.get('cf-ray')
  if (ray) return `ray:${ray}`
  return `req:${crypto.randomUUID().slice(0, 8)}`
}

function maskToken(token) {
  if (!token) return ''
  if (token.length <= 18) return `${token.slice(0, 6)}...`
  return `${token.slice(0, 10)}...${token.slice(-8)}`
}

function authLog(level, message, extra = {}) {
  const payload = {
    scope: 'quit-auth',
    level,
    message,
    ...extra,
  }
  console.log(JSON.stringify(payload))
}

function getTestBypassConfig(env) {
  return {
    token: (env?.TEST_BYPASS_TOKEN || '').trim(),
    userId: (env?.TEST_BYPASS_USER_ID || 'quit_test_user').trim(),
  }
}

export async function requireUserId(request, env) {
  const traceId = buildTraceId(request)
  const token = readBearerToken(request)
  if (!token) {
    authLog('warn', 'missing_token', {
      traceId,
      path: new URL(request.url).pathname,
      hasAuthorizationHeader: Boolean(request.headers.get('authorization')),
      hasXAccessToken: Boolean(request.headers.get('x-access-token')),
    })
    return { error: fail(401, '缺少 Authorization Bearer token', { traceId }) }
  }

  const bypass = getTestBypassConfig(env)
  if (bypass.token && token === bypass.token) {
    authLog('info', 'jwt_bypass_test_token', {
      traceId,
      path: new URL(request.url).pathname,
      userId: bypass.userId,
      tokenPreview: maskToken(token),
    })
    return {
      userId: bypass.userId,
      tokenPayload: { sub: bypass.userId, testBypass: true },
      traceId,
    }
  }

  const secret = env.JWT_SECRET
  if (!secret) {
    authLog('error', 'missing_jwt_secret', {
      traceId,
      path: new URL(request.url).pathname,
    })
    return { error: fail(500, '服务端未配置 JWT_SECRET', { traceId }) }
  }

  const verifyResult = await verifyHs512Jwt(token, secret)
  const payload = verifyResult?.payload
  const userId = payload?.sub
  if (!userId) {
    authLog('warn', 'jwt_verify_failed', {
      traceId,
      path: new URL(request.url).pathname,
      reason: verifyResult?.reason || 'unknown',
      alg: verifyResult?.header?.alg || null,
      typ: verifyResult?.header?.typ || null,
      sub: payload?.sub || null,
      partCount: verifyResult?.partCount || 0,
      tokenPreview: maskToken(token),
    })
    return { error: fail(401, 'token 验签失败或无效', { traceId }) }
  }

  authLog('info', 'jwt_verify_ok', {
    traceId,
    path: new URL(request.url).pathname,
    userId,
    alg: verifyResult?.header?.alg || null,
  })

  return { userId, tokenPayload: payload, traceId }
}
