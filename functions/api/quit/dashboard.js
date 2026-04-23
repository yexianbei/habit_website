import { fail, ok } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { getQuitDashboard } from '../../_lib/quit'

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
  const today = url.searchParams.get('today') || formatDate(new Date())
  const data = await getQuitDashboard(db, auth.userId, today)
  return ok(data)
}
