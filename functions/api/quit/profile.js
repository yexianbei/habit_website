import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { getQuitProfile, upsertQuitProfile } from '../../_lib/quit'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const profile = await getQuitProfile(db, auth.userId)
  return ok(profile || null)
}

export async function onRequestPut(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')

  const profile = await upsertQuitProfile(db, auth.userId, {
    quitStartAt: body.quitStartAt,
    dailyCost: body.dailyCost,
    cigarettesPerDay: body.cigarettesPerDay,
    pricePerCigarette: body.pricePerCigarette,
    timezone: body.timezone,
  })

  return ok(profile)
}
