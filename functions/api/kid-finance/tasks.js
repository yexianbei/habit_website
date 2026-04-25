import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { upsertKidFinanceTask } from '../../_lib/kidFinance'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

function mapError(error) {
  const code = String(error?.message || '')
  if (code === 'TASK_LIMIT_REACHED') return fail(400, '最多只能配置 5 个行为任务')
  if (code === 'TASK_NOT_FOUND') return fail(404, '任务不存在')
  if (code === 'INVALID_TASK_NAME') return fail(400, '任务名称不能为空')
  return fail(400, '保存任务失败', { code })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')
  const body = (await readJson(request)) || {}

  try {
    const data = await upsertKidFinanceTask(db, auth.userId, body)
    return ok(data)
  } catch (error) {
    return mapError(error)
  }
}
