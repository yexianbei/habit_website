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

  if (body.quitStartAt != null) {
    const ts = new Date(body.quitStartAt).getTime()
    if (Number.isNaN(ts)) return fail(400, 'quitStartAt 时间格式无效')
  }

  if (body.dailyCost != null) {
    const dailyCost = Number(body.dailyCost)
    if (!Number.isFinite(dailyCost) || dailyCost < 0 || dailyCost > 100000) {
      return fail(400, 'dailyCost 必须是 0-100000 的数字')
    }
  }

  if (body.cigarettesPerDay != null) {
    const cpd = Number(body.cigarettesPerDay)
    if (!Number.isFinite(cpd) || cpd < 0 || cpd > 1000) {
      return fail(400, 'cigarettesPerDay 必须是 0-1000 的数字')
    }
  }

  if (body.pricePerCigarette != null) {
    const price = Number(body.pricePerCigarette)
    if (!Number.isFinite(price) || price < 0 || price > 1000) {
      return fail(400, 'pricePerCigarette 必须是 0-1000 的数字')
    }
  }

  const profile = await upsertQuitProfile(db, auth.userId, {
    quitStartAt: body.quitStartAt,
    dailyCost: body.dailyCost,
    cigarettesPerDay: body.cigarettesPerDay,
    pricePerCigarette: body.pricePerCigarette,
    timezone: body.timezone,
  })

  return ok(profile)
}
