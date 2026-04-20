import { fail, ok, readJson } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { getGradualPlan, upsertGradualPlan } from '../../../_lib/quit'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')
  const plan = await getGradualPlan(db, auth.userId)
  return ok(plan)
}

export async function onRequestPut(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')
  const plan = await upsertGradualPlan(db, auth.userId, body)
  return ok(plan)
}
