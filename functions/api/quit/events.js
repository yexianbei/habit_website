import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { createQuitEvent, listQuitEvents } from '../../_lib/quit'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

function formatDate(dateLike) {
  const d = new Date(dateLike || Date.now())
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const url = new URL(request.url)
  const startDate = url.searchParams.get('startDate') || '2000-01-01'
  const endDate = url.searchParams.get('endDate') || formatDate(new Date())
  const events = await listQuitEvents(db, auth.userId, startDate, endDate)
  return ok({ records: events })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')

  if (!body.type) return fail(400, '缺少 type 字段')
  if (!body.date && !body.eventAt) return fail(400, '缺少 date 或 eventAt 字段')

  const created = await createQuitEvent(db, auth.userId, {
    id: body.id,
    type: body.type,
    eventAt: body.eventAt,
    date: body.date,
    cigaretteCount: body.cigaretteCount,
    details: body.details,
    source: body.source || 'h5',
    resetQuitDate: Boolean(body.resetQuitDate),
  })

  return ok(created)
}
