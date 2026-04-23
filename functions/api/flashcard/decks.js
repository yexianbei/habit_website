import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { createFlashcardDeck, listFlashcardDecks } from '../../_lib/flashcard'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')
  const decks = await listFlashcardDecks(db, auth.userId)
  return ok({ decks })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = await readJson(request)
  if (!body || typeof body !== 'object') return fail(400, '请求体必须为 JSON')
  if (!String(body.title || '').trim()) return fail(400, 'title 不能为空')
  if (!Array.isArray(body.cards) || body.cards.length === 0) return fail(400, 'cards 不能为空')

  try {
    const data = await createFlashcardDeck(db, auth.userId, body)
    return ok(data)
  } catch (error) {
    const message = String(error?.message || '')
    if (message === 'INVALID_TITLE') return fail(400, 'title 不能为空')
    if (message === 'EMPTY_CARDS') return fail(400, 'cards 不能为空')
    return fail(500, '创建卡组失败')
  }
}
