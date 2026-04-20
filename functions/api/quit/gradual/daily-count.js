import { fail, ok, readJson } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { getGradualDailyCount, upsertGradualDailyCount } from '../../../_lib/quit'

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
  const date = url.searchParams.get('date')
  if (!date) return fail(400, '缺少 date 参数')
  const count = await getGradualDailyCount(db, auth.userId, date)
  return ok(count)
}

export async function onRequestPut(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')
  if (!body.date) return fail(400, '缺少 date 字段')

  const result = await upsertGradualDailyCount(db, auth.userId, body)
  return ok(result)
}
