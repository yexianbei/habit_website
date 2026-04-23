import { fail, ok } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { getFlashcardDeckDetail } from '../../../_lib/flashcard'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestGet(context) {
  const { request, env, params } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const deckId = String(params?.deckId || '').trim()
  if (!deckId) return fail(400, 'deckId 不能为空')

  const detail = await getFlashcardDeckDetail(db, auth.userId, deckId)
  if (!detail) return fail(404, '卡组不存在')
  return ok(detail)
}
