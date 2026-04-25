import { fail, ok } from '../../../_lib/http'
import { requireUserId } from '../../../_lib/auth'
import { deleteKidFinanceTask } from '../../../_lib/kidFinance'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

export async function onRequestDelete(context) {
  const { request, env, params } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  try {
    const data = await deleteKidFinanceTask(db, auth.userId, params.taskId)
    return ok(data)
  } catch (error) {
    return fail(400, '删除任务失败', { code: String(error?.message || '') })
  }
}
