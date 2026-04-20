import { fail, ok } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { listGradualCountRecords } from '../../../_lib/quit'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const url = new URL(request.url)
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  if (!startDate || !endDate) return fail(400, '缺少 startDate 或 endDate 参数')

  const records = await listGradualCountRecords(db, auth.userId, startDate, endDate)
  return ok(records)
}
