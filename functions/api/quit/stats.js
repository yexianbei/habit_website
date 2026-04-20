import { fail, ok } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { getQuitProfile, listQuitEvents } from '../../_lib/quit'

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

function diffDays(nowMs, startMs) {
  const d1 = new Date(nowMs)
  const d2 = new Date(startMs)
  const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  return Math.floor((a - b) / (24 * 60 * 60 * 1000))
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

  const [profile, events] = await Promise.all([
    getQuitProfile(db, auth.userId),
    listQuitEvents(db, auth.userId, startDate, endDate),
  ])

  const relapseEvents = events.filter((e) => e.type === 'relapse')
  const latestRelapseAt = relapseEvents.length > 0 ? relapseEvents[0].eventAt : null
  const quitStartAt = latestRelapseAt || profile?.quitStartAt || null
  const nowSec = Math.floor(Date.now() / 1000)
  const days = quitStartAt ? Math.max(0, diffDays(nowSec * 1000, quitStartAt * 1000)) : 0

  const dailyCost = profile?.dailyCost || 0
  const savedMoney = Number((days * dailyCost).toFixed(2))

  return ok({
    days,
    quitStartAt,
    lastRelapseAt: latestRelapseAt,
    dailyCost,
    savedMoney,
    relapseCount: relapseEvents.length,
  })
}
