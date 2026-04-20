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

export async function requireUserId(request, env) {
  const token = readBearerToken(request)
  if (!token) {
    return { error: fail(401, '缺少 Authorization Bearer token') }
  }

  const secret = env.JWT_SECRET
  if (!secret) {
    return { error: fail(500, '服务端未配置 JWT_SECRET') }
  }

  const payload = await verifyHs512Jwt(token, secret)
  const userId = payload?.sub
  if (!userId) {
    return { error: fail(401, 'token 验签失败或无效') }
  }

  return { userId, tokenPayload: payload }
}
