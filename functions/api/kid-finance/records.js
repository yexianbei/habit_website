import { fail, ok, readJson } from '../../_lib/http'
import { requireUserId } from '../../_lib/auth'
import { createKidFinanceRecord } from '../../_lib/kidFinance'

function checkDb(env) {
  return env.DB || env.HABIT_DB || null
}

function mapError(error) {
  const code = String(error?.message || '')
  if (code === 'INVALID_RECORD_TYPE') return fail(400, 'type 仅支持 income/expense')
  if (code === 'INVALID_RECORD_NAME') return fail(400, 'name 不能为空')
  if (code === 'INVALID_RECORD_AMOUNT') return fail(400, 'amount 必须大于 0')
  if (code === 'INSUFFICIENT_CASH') return fail(400, '现金小金库余额不足')
  return fail(400, '保存记账记录失败', { code })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireUserId(request, env)
  if (auth.error) return auth.error
  const db = checkDb(env)
  if (!db) return fail(500, '未绑定 D1 数据库（请在 wrangler.toml 配置 d1_databases）')

  const body = (await readJson(request)) || {}
  try {
    const data = await createKidFinanceRecord(db, auth.userId, body)
    return ok(data)
  } catch (error) {
    return mapError(error)
  }
}
