import { fail, ok, readJson } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { setKidFinanceTaskCheck } from '../../../_lib/kidFinance'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestPut(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')
  const body = (await readJson(request)) || {}

  try {
    const data = await setKidFinanceTaskCheck(db, auth.userId, body)
    return ok(data)
  } catch (error) {
    return fail(400, '更新任务勾选失败', { code: String(error?.message || '') })
  }
}
