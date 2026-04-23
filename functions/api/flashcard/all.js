import { fail, ok } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { deleteAllFlashcardData } from '../../_lib/flashcard'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestDelete(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error

  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const data = await deleteAllFlashcardData(db, auth.userId)
  return ok(data)
}
