import { fail, ok } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { getKidFinanceDashboard } from '../../_lib/kidFinance'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

function mapError(error) {
  const code = String(error?.message || '')
  if (code === 'MISSING_TABLE') return fail(500, 'kid_finance 数据表不存在，请先执行 migration')
  return fail(400, '获取财商看板失败', { code })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  try {
    const today = new URL(request.url).searchParams.get('today') || undefined
    const data = await getKidFinanceDashboard(db, auth.userId, today)
    return ok(data)
  } catch (error) {
    return mapError(error)
  }
}
