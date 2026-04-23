import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { reviewFlashcardCard } from '../../_lib/flashcard'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')

  try {
    const data = await reviewFlashcardCard(db, auth.userId, body)
    return ok(data)
  } catch (error) {
    const message = String(error?.message || '')
    if (message === 'INVALID_REVIEW_PAYLOAD') return fail(400, 'deckId/cardId 不能为空')
    if (message === 'CARD_NOT_FOUND') return fail(404, '卡片不存在')
    return fail(500, '保存复习结果失败')
  }
}
