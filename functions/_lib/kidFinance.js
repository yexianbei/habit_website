const KID_FINANCE_HABIT_TYPE = 'kid_finance'
const MAX_TASKS = 5

const DEFAULT_PROFILE = {
  cycle: 7,
  baseMoneyCents: 3000,
  theme: 'girl',
}

const DEFAULT_RATES = [
  { day: 7, rate: 1 },
  { day: 30, rate: 2 },
  { day: 90, rate: 3.5 },
  { day: 180, rate: 5 },
  { day: 365, rate: 7 },
]

let bindingTableReady = false

function toDateKey(dateLike) {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDayMs(dateLike) {
  const d = new Date(dateLike)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function toYuan(cents) {
  return Number((Number(cents || 0) / 100).toFixed(2))
}

function toCents(yuan) {
  const n = Number(yuan || 0)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

function assertTaskPayload(payload = {}) {
  const name = String(payload.name || '').trim()
  if (!name) throw new Error('INVALID_TASK_NAME')
  const effectType = payload.effectType === 'penalty' ? 'penalty' : 'reward'
  const bonusMode = payload.bonusMode === 'times' ? 'times' : 'streak_days'
  const amountPerCheckCents = toCents(payload.amountPerCheck)
  const bonusEvery = Math.max(1, Number(payload.bonusEvery || 1))
  const bonusAmountCents = toCents(payload.bonusAmount)
  return { name, effectType, bonusMode, amountPerCheckCents, bonusEvery, bonusAmountCents }
}

async function ensureBindingTable(db) {
  if (bindingTableReady) return
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS user_habit_bindings (
        app_user_id TEXT NOT NULL,
        habit_type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (app_user_id, habit_type)
      )`,
    )
    .run()
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_user_habit_bindings_type_user
       ON user_habit_bindings(habit_type, app_user_id)`,
    )
    .run()
  bindingTableReady = true
}

export async function ensureKidFinanceBinding(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  try {
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET updated_at = excluded.updated_at`,
      )
      .bind(userId, KID_FINANCE_HABIT_TYPE, nowSec, nowSec)
      .run()
  } catch (error) {
    const message = String(error?.message || '')
    if (!message.includes('no such table: user_habit_bindings')) throw error
    await ensureBindingTable(db)
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET updated_at = excluded.updated_at`,
      )
      .bind(userId, KID_FINANCE_HABIT_TYPE, nowSec, nowSec)
      .run()
  }
}

async function ensureDefaults(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  const today = toDateKey(Date.now())
  await ensureKidFinanceBinding(db, userId)

  await db
    .prepare(
      `INSERT INTO kid_finance_profiles (app_user_id, cycle, base_money_cents, cycle_start_date, theme, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(app_user_id) DO NOTHING`,
    )
    .bind(userId, DEFAULT_PROFILE.cycle, DEFAULT_PROFILE.baseMoneyCents, today, DEFAULT_PROFILE.theme, nowSec)
    .run()

  await db
    .prepare(
      `INSERT INTO kid_finance_accounts (app_user_id, cash_cents, demand_cents, updated_at)
       VALUES (?, 0, 0, ?)
       ON CONFLICT(app_user_id) DO NOTHING`,
    )
    .bind(userId, nowSec)
    .run()

  const countRow = await db
    .prepare(`SELECT COUNT(1) AS c FROM kid_finance_deposit_rates WHERE app_user_id = ?`)
    .bind(userId)
    .first()
  if (!Number(countRow?.c || 0)) {
    await db.batch(
      DEFAULT_RATES.map((r) =>
        db
          .prepare(
            `INSERT INTO kid_finance_deposit_rates (app_user_id, lock_days, rate_percent, updated_at)
             VALUES (?, ?, ?, ?)`,
          )
          .bind(userId, r.day, r.rate, nowSec),
      ),
    )
  }
}

function computeCycleInfo(cycleStartDate, cycle, today) {
  const startRaw = new Date(cycleStartDate || today)
  const nowRaw = new Date(today)
  let start = new Date(startRaw.getFullYear(), startRaw.getMonth(), startRaw.getDate())
  let end = new Date(start.getTime() + (cycle - 1) * 86400000)
  if (nowRaw > end) {
    const passed = Math.floor((startOfDayMs(nowRaw) - startOfDayMs(start)) / (cycle * 86400000))
    start = new Date(start.getTime() + passed * cycle * 86400000)
    end = new Date(start.getTime() + (cycle - 1) * 86400000)
  }
  const typeName = cycle === 7 ? '周' : cycle === 14 ? '双周' : '月'
  const dateRange = `${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')} - ${String(
    end.getMonth() + 1,
  ).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`
  return {
    typeName,
    dateRange,
    startDate: toDateKey(start),
    endDate: toDateKey(end),
    spanMin: start.getTime(),
    spanMax: end.getTime(),
  }
}

function buildTaskHistoryMap(checkRows = []) {
  const map = {}
  for (const row of checkRows) {
    if (!row?.completed) continue
    if (!map[row.check_date]) map[row.check_date] = []
    map[row.check_date].push(row.task_id)
  }
  return map
}

function calcTaskStats(tasks, taskHistory, cycleInfo, todayDate) {
  const cycleDateKeys = []
  for (let ts = cycleInfo.spanMin; ts <= cycleInfo.spanMax; ts += 86400000) {
    cycleDateKeys.push(toDateKey(ts))
  }
  const result = {}
  for (const task of tasks) {
    let completions = 0
    let maxStreak = 0
    let curStreak = 0
    for (const dateKey of cycleDateKeys) {
      const done = (taskHistory[dateKey] || []).includes(task.id)
      if (done) {
        completions += 1
        curStreak += 1
        if (curStreak > maxStreak) maxStreak = curStreak
      } else {
        curStreak = 0
      }
    }

    let streakToday = 0
    let cursor = new Date(`${todayDate}T00:00:00`)
    for (let i = 0; i < Number(task.cycle || 30); i += 1) {
      const dateKey = toDateKey(cursor)
      if ((taskHistory[dateKey] || []).includes(task.id)) {
        streakToday += 1
        cursor = new Date(cursor.getTime() - 86400000)
      } else {
        break
      }
    }
    const bonusBase = task.bonusMode === 'times' ? completions : maxStreak
    const bonusRounds = Math.floor(bonusBase / Math.max(1, Number(task.bonusEvery || 1)))
    const baseMoney = completions * Number(task.amountPerCheck || 0)
    const bonusMoney = bonusRounds * Number(task.bonusAmount || 0)
    const totalMoney = Number((baseMoney + bonusMoney).toFixed(2))
    result[task.id] = { completions, maxStreak, streakToday, bonusRounds, totalMoney }
  }
  return result
}

export async function getKidFinanceDashboard(db, userId, todayInput) {
  await ensureDefaults(db, userId)
  const today = toDateKey(todayInput || Date.now())
  const nowSec = Math.floor(Date.now() / 1000)

  const [profile, accounts, ratesRows, depositsRows, recordsRows, tasksRows] = await Promise.all([
    db
      .prepare(`SELECT cycle, base_money_cents, cycle_start_date, theme FROM kid_finance_profiles WHERE app_user_id = ?`)
      .bind(userId)
      .first(),
    db
      .prepare(`SELECT cash_cents, demand_cents FROM kid_finance_accounts WHERE app_user_id = ?`)
      .bind(userId)
      .first(),
    db
      .prepare(
        `SELECT lock_days, rate_percent
         FROM kid_finance_deposit_rates
         WHERE app_user_id = ?
         ORDER BY lock_days ASC`,
      )
      .bind(userId)
      .all(),
    db
      .prepare(
        `SELECT id, money_cents, lock_days, rate_percent, created_at
         FROM kid_finance_deposits
         WHERE app_user_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .bind(userId)
      .all(),
    db
      .prepare(
        `SELECT id, record_type, name, amount_cents, occurred_at
         FROM kid_finance_records
         WHERE app_user_id = ?
         ORDER BY occurred_at DESC
         LIMIT 1000`,
      )
      .bind(userId)
      .all(),
    db
      .prepare(
        `SELECT id, name, effect_type, amount_per_check_cents, bonus_mode, bonus_every, bonus_amount_cents, sort_order
         FROM kid_finance_tasks
         WHERE app_user_id = ?
         ORDER BY sort_order ASC, created_at ASC`,
      )
      .bind(userId)
      .all(),
  ])

  const cycle = Number(profile?.cycle || DEFAULT_PROFILE.cycle)
  const cycleInfo = computeCycleInfo(profile?.cycle_start_date || today, cycle, today)
  const checkRows = await db
    .prepare(
      `SELECT task_id, check_date, completed
       FROM kid_finance_task_checks
       WHERE app_user_id = ? AND check_date >= ? AND check_date <= ?`,
    )
    .bind(userId, cycleInfo.startDate, cycleInfo.endDate)
    .all()

  const settings = {
    cycle,
    baseMoney: toYuan(profile?.base_money_cents || DEFAULT_PROFILE.baseMoneyCents),
    cycleStartDate: profile?.cycle_start_date || today,
    theme: profile?.theme || DEFAULT_PROFILE.theme,
    depositRates: (ratesRows.results || []).map((r) => ({ day: Number(r.lock_days), rate: Number(r.rate_percent) })),
  }
  const tasks = (tasksRows.results || []).map((r, idx) => ({
    id: r.id,
    name: r.name,
    effectType: r.effect_type,
    amountPerCheck: toYuan(r.amount_per_check_cents),
    bonusMode: r.bonus_mode,
    bonusEvery: Number(r.bonus_every || 1),
    bonusAmount: toYuan(r.bonus_amount_cents),
    sortOrder: Number(r.sort_order || idx),
    cycle,
  }))
  const taskHistory = buildTaskHistoryMap(checkRows.results || [])
  const taskStatsMap = calcTaskStats(tasks, taskHistory, cycleInfo, today)
  const currentEarnedRewards = tasks
    .filter((t) => t.effectType === 'reward')
    .reduce((sum, t) => sum + Number(taskStatsMap[t.id]?.totalMoney || 0), 0)
  const currentPenalties = tasks
    .filter((t) => t.effectType === 'penalty')
    .reduce((sum, t) => sum + Number(taskStatsMap[t.id]?.totalMoney || 0), 0)

  const records = (recordsRows.results || []).map((r) => ({
    id: r.id,
    type: r.record_type,
    name: r.name,
    price: toYuan(r.amount_cents),
    time: new Date(Number(r.occurred_at) * 1000).toLocaleString('zh-CN', { hour12: false }),
    occurredAt: Number(r.occurred_at),
  }))
  const recentRecords = records.slice(0, 5)
  const monthPrefix = today.slice(0, 7)
  const monthlySummary = records.reduce(
    (acc, r) => {
      const d = new Date(r.occurredAt * 1000)
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (prefix !== monthPrefix) return acc
      if (r.type === 'income') acc.income += r.price
      if (r.type === 'expense') acc.expense += r.price
      return acc
    },
    { income: 0, expense: 0 },
  )
  monthlySummary.net = Number((monthlySummary.income - monthlySummary.expense).toFixed(2))

  return {
    bank: toYuan(accounts?.cash_cents || 0),
    demandBank: toYuan(accounts?.demand_cents || 0),
    deposits: (depositsRows.results || []).map((d) => ({
      id: d.id,
      money: toYuan(d.money_cents),
      day: Number(d.lock_days),
      rate: Number(d.rate_percent),
      time: Number(d.created_at) * 1000,
    })),
    records,
    recentRecords,
    tasks,
    taskHistory,
    settings,
    cycleInfo,
    taskStatsMap,
    currentEarnedRewards: Number(currentEarnedRewards.toFixed(2)),
    currentPenalties: Number(currentPenalties.toFixed(2)),
    nextMoney: Number((Math.max(0, settings.baseMoney + currentEarnedRewards - currentPenalties)).toFixed(2)),
    monthlySummary: {
      income: Number(monthlySummary.income.toFixed(2)),
      expense: Number(monthlySummary.expense.toFixed(2)),
      net: monthlySummary.net,
    },
    nowSec,
  }
}

export async function createKidFinanceRecord(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const type = payload.type === 'income' ? 'income' : payload.type === 'expense' ? 'expense' : null
  if (!type) throw new Error('INVALID_RECORD_TYPE')
  const name = String(payload.name || '').trim()
  if (!name) throw new Error('INVALID_RECORD_NAME')
  const amountCents = toCents(payload.price)
  if (amountCents <= 0) throw new Error('INVALID_RECORD_AMOUNT')

  const nowSec = Math.floor(Date.now() / 1000)
  const row = await db.prepare(`SELECT cash_cents FROM kid_finance_accounts WHERE app_user_id = ?`).bind(userId).first()
  const cashCents = Number(row?.cash_cents || 0)
  if (type === 'expense' && amountCents > cashCents) throw new Error('INSUFFICIENT_CASH')

  const nextCash = type === 'income' ? cashCents + amountCents : cashCents - amountCents
  await db.batch([
    db
      .prepare(`UPDATE kid_finance_accounts SET cash_cents = ?, updated_at = ? WHERE app_user_id = ?`)
      .bind(nextCash, nowSec, userId),
    db
      .prepare(
        `INSERT INTO kid_finance_records (id, app_user_id, record_type, name, amount_cents, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(`kfr_${crypto.randomUUID()}`, userId, type, name, amountCents, nowSec, nowSec),
  ])
  return { success: true }
}

export async function createKidFinanceDeposit(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const amountCents = toCents(payload.money)
  if (amountCents <= 0) throw new Error('INVALID_DEPOSIT_AMOUNT')
  const depositType = payload.depositType === 'fixed' ? 'fixed' : 'demand'
  const nowSec = Math.floor(Date.now() / 1000)

  const acc = await db
    .prepare(`SELECT cash_cents, demand_cents FROM kid_finance_accounts WHERE app_user_id = ?`)
    .bind(userId)
    .first()
  const cashCents = Number(acc?.cash_cents || 0)
  const demandCents = Number(acc?.demand_cents || 0)
  if (amountCents > cashCents) throw new Error('INSUFFICIENT_CASH')

  if (depositType === 'demand') {
    await db
      .prepare(
        `UPDATE kid_finance_accounts
         SET cash_cents = ?, demand_cents = ?, updated_at = ?
         WHERE app_user_id = ?`,
      )
      .bind(cashCents - amountCents, demandCents + amountCents, nowSec, userId)
      .run()
    return { success: true }
  }

  const day = Math.max(1, Number(payload.day || 7))
  const rateRow = await db
    .prepare(`SELECT rate_percent FROM kid_finance_deposit_rates WHERE app_user_id = ? AND lock_days = ?`)
    .bind(userId, day)
    .first()
  if (!rateRow) throw new Error('DEPOSIT_RATE_NOT_FOUND')

  await db.batch([
    db
      .prepare(`UPDATE kid_finance_accounts SET cash_cents = ?, updated_at = ? WHERE app_user_id = ?`)
      .bind(cashCents - amountCents, nowSec, userId),
    db
      .prepare(
        `INSERT INTO kid_finance_deposits (id, app_user_id, money_cents, lock_days, rate_percent, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(`kfd_${crypto.randomUUID()}`, userId, amountCents, day, Number(rateRow.rate_percent), nowSec),
  ])
  return { success: true }
}

export async function withdrawKidFinanceDemand(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const amountCents = toCents(payload.money)
  if (amountCents <= 0) throw new Error('INVALID_WITHDRAW_AMOUNT')
  const nowSec = Math.floor(Date.now() / 1000)
  const acc = await db
    .prepare(`SELECT cash_cents, demand_cents FROM kid_finance_accounts WHERE app_user_id = ?`)
    .bind(userId)
    .first()
  const cashCents = Number(acc?.cash_cents || 0)
  const demandCents = Number(acc?.demand_cents || 0)
  if (amountCents > demandCents) throw new Error('INSUFFICIENT_DEMAND')

  await db
    .prepare(
      `UPDATE kid_finance_accounts
       SET cash_cents = ?, demand_cents = ?, updated_at = ?
       WHERE app_user_id = ?`,
    )
    .bind(cashCents + amountCents, demandCents - amountCents, nowSec, userId)
    .run()
  return { success: true }
}

export async function updateKidFinanceSettings(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const nowSec = Math.floor(Date.now() / 1000)
  const profile = await db
    .prepare(`SELECT cycle, base_money_cents, cycle_start_date, theme FROM kid_finance_profiles WHERE app_user_id = ?`)
    .bind(userId)
    .first()

  const cycle = payload.cycle != null ? Math.max(1, Number(payload.cycle || 7)) : Number(profile?.cycle || 7)
  const baseMoneyCents = payload.baseMoney != null ? toCents(payload.baseMoney) : Number(profile?.base_money_cents || 3000)
  const theme = payload.theme != null ? String(payload.theme || 'girl') : String(profile?.theme || 'girl')
  const cycleStartDate = payload.cycleStartDate != null ? String(payload.cycleStartDate || '') : String(profile?.cycle_start_date || toDateKey(Date.now()))

  await db
    .prepare(
      `UPDATE kid_finance_profiles
       SET cycle = ?, base_money_cents = ?, cycle_start_date = ?, theme = ?, updated_at = ?
       WHERE app_user_id = ?`,
    )
    .bind(cycle, baseMoneyCents, cycleStartDate, theme, nowSec, userId)
    .run()

  if (Array.isArray(payload.depositRates)) {
    const nextRates = payload.depositRates
      .map((r) => ({ day: Math.max(1, Number(r?.day || 0)), rate: Number(r?.rate || 0) }))
      .filter((r) => Number.isFinite(r.day) && Number.isFinite(r.rate))
      .sort((a, b) => a.day - b.day)
    await db.prepare(`DELETE FROM kid_finance_deposit_rates WHERE app_user_id = ?`).bind(userId).run()
    if (nextRates.length > 0) {
      await db.batch(
        nextRates.map((r) =>
          db
            .prepare(
              `INSERT INTO kid_finance_deposit_rates (app_user_id, lock_days, rate_percent, updated_at)
               VALUES (?, ?, ?, ?)`,
            )
            .bind(userId, r.day, r.rate, nowSec),
        ),
      )
    }
  }

  return { success: true }
}

export async function upsertKidFinanceTask(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const nowSec = Math.floor(Date.now() / 1000)
  const parsed = assertTaskPayload(payload)
  const taskId = String(payload.id || '').trim()

  if (!taskId) {
    const countRow = await db.prepare(`SELECT COUNT(1) AS c FROM kid_finance_tasks WHERE app_user_id = ?`).bind(userId).first()
    if (Number(countRow?.c || 0) >= MAX_TASKS) throw new Error('TASK_LIMIT_REACHED')
    const maxSortRow = await db
      .prepare(`SELECT MAX(sort_order) AS max_sort FROM kid_finance_tasks WHERE app_user_id = ?`)
      .bind(userId)
      .first()
    const nextSort = Number(maxSortRow?.max_sort || 0) + 1
    await db
      .prepare(
        `INSERT INTO kid_finance_tasks (
          id, app_user_id, name, effect_type, amount_per_check_cents, bonus_mode, bonus_every, bonus_amount_cents, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        `kft_${crypto.randomUUID()}`,
        userId,
        parsed.name,
        parsed.effectType,
        parsed.amountPerCheckCents,
        parsed.bonusMode,
        parsed.bonusEvery,
        parsed.bonusAmountCents,
        nextSort,
        nowSec,
        nowSec,
      )
      .run()
    return { success: true }
  }

  const owned = await db.prepare(`SELECT id FROM kid_finance_tasks WHERE app_user_id = ? AND id = ?`).bind(userId, taskId).first()
  if (!owned) throw new Error('TASK_NOT_FOUND')
  await db
    .prepare(
      `UPDATE kid_finance_tasks
       SET name = ?, effect_type = ?, amount_per_check_cents = ?, bonus_mode = ?, bonus_every = ?, bonus_amount_cents = ?, updated_at = ?
       WHERE app_user_id = ? AND id = ?`,
    )
    .bind(
      parsed.name,
      parsed.effectType,
      parsed.amountPerCheckCents,
      parsed.bonusMode,
      parsed.bonusEvery,
      parsed.bonusAmountCents,
      nowSec,
      userId,
      taskId,
    )
    .run()
  return { success: true }
}

export async function deleteKidFinanceTask(db, userId, taskId) {
  const id = String(taskId || '').trim()
  if (!id) throw new Error('INVALID_TASK_ID')
  await db.batch([
    db.prepare(`DELETE FROM kid_finance_task_checks WHERE app_user_id = ? AND task_id = ?`).bind(userId, id),
    db.prepare(`DELETE FROM kid_finance_tasks WHERE app_user_id = ? AND id = ?`).bind(userId, id),
  ])
  return { success: true }
}

export async function setKidFinanceTaskCheck(db, userId, payload = {}) {
  await ensureDefaults(db, userId)
  const taskId = String(payload.taskId || '').trim()
  if (!taskId) throw new Error('INVALID_TASK_ID')
  const date = String(payload.date || toDateKey(Date.now())).trim()
  if (!date) throw new Error('INVALID_DATE')
  const completed = payload.completed === false ? 0 : 1
  const nowSec = Math.floor(Date.now() / 1000)
  await db
    .prepare(
      `INSERT INTO kid_finance_task_checks (app_user_id, task_id, check_date, completed, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(app_user_id, task_id, check_date) DO UPDATE SET
         completed = excluded.completed,
         updated_at = excluded.updated_at`,
    )
    .bind(userId, taskId, date, completed, nowSec)
    .run()
  return { success: true }
}

export async function deleteAllKidFinanceData(db, userId) {
  const recordsRes = await db.prepare(`DELETE FROM kid_finance_records WHERE app_user_id = ?`).bind(userId).run()
  const depositsRes = await db.prepare(`DELETE FROM kid_finance_deposits WHERE app_user_id = ?`).bind(userId).run()
  const checksRes = await db.prepare(`DELETE FROM kid_finance_task_checks WHERE app_user_id = ?`).bind(userId).run()
  const tasksRes = await db.prepare(`DELETE FROM kid_finance_tasks WHERE app_user_id = ?`).bind(userId).run()
  const ratesRes = await db.prepare(`DELETE FROM kid_finance_deposit_rates WHERE app_user_id = ?`).bind(userId).run()
  const accountsRes = await db.prepare(`DELETE FROM kid_finance_accounts WHERE app_user_id = ?`).bind(userId).run()
  const profilesRes = await db.prepare(`DELETE FROM kid_finance_profiles WHERE app_user_id = ?`).bind(userId).run()
  const bindingRes = await db
    .prepare(`DELETE FROM user_habit_bindings WHERE app_user_id = ? AND habit_type = ?`)
    .bind(userId, KID_FINANCE_HABIT_TYPE)
    .run()

  const counts = {
    records: Number(recordsRes?.meta?.changes || 0),
    deposits: Number(depositsRes?.meta?.changes || 0),
    checks: Number(checksRes?.meta?.changes || 0),
    tasks: Number(tasksRes?.meta?.changes || 0),
    rates: Number(ratesRes?.meta?.changes || 0),
    accounts: Number(accountsRes?.meta?.changes || 0),
    profiles: Number(profilesRes?.meta?.changes || 0),
    habitBindings: Number(bindingRes?.meta?.changes || 0),
  }
  const totalDeleted = Object.values(counts).reduce((sum, n) => sum + n, 0)
  return { deleted: true, counts, totalDeleted }
}
