function toDateKey(dateLike) {
  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toStartOfDayMsFromSec(sec) {
  const d = new Date(Number(sec) * 1000)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return day.getTime()
}

function diffDaysBySec(nowSec, startSec) {
  const nowDay = toStartOfDayMsFromSec(nowSec)
  const startDay = toStartOfDayMsFromSec(startSec)
  return Math.floor((nowDay - startDay) / (24 * 60 * 60 * 1000))
}

function calcTodayTarget(plan, todayDate) {
  if (!plan?.startDate) return 0
  const today = new Date(todayDate)
  const start = new Date(plan.startDate)
  if (Number.isNaN(today.getTime()) || Number.isNaN(start.getTime())) return 0
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const currentWeek = Math.floor(diffDays / 7) + 1

  if (currentWeek > plan.weeks) return plan.targetCount
  const totalReduction = plan.initialCount - plan.targetCount
  const reductionPerWeek = totalReduction / plan.weeks
  return Math.max(plan.targetCount, Math.round(plan.initialCount - reductionPerWeek * currentWeek))
}

const QUIT_HABIT_TYPE = 'quit'

let bindingTableReady = false

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

export async function ensureQuitHabitBinding(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  try {
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET
           updated_at = excluded.updated_at`,
      )
      .bind(userId, QUIT_HABIT_TYPE, nowSec, nowSec)
      .run()
  } catch (error) {
    const message = String(error?.message || '')
    if (!message.includes('no such table: user_habit_bindings')) {
      throw error
    }
    await ensureBindingTable(db)
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET
           updated_at = excluded.updated_at`,
      )
      .bind(userId, QUIT_HABIT_TYPE, nowSec, nowSec)
      .run()
  }
}

export async function getQuitProfile(db, userId) {
  const row = await db
    .prepare(
      `SELECT app_user_id, quit_start_at, timezone, daily_cost_cents, cigarettes_per_day, price_per_cigarette_cents, updated_at
       FROM quit_profiles
       WHERE app_user_id = ?`,
    )
    .bind(userId)
    .first()

  if (!row) return null
  return {
    appUserId: row.app_user_id,
    quitStartAt: row.quit_start_at || null,
    timezone: row.timezone || 'Asia/Shanghai',
    dailyCost: row.daily_cost_cents != null ? row.daily_cost_cents / 100 : null,
    cigarettesPerDay: row.cigarettes_per_day != null ? Number(row.cigarettes_per_day) : null,
    pricePerCigarette: row.price_per_cigarette_cents != null ? row.price_per_cigarette_cents / 100 : null,
    updatedAt: row.updated_at || null,
  }
}

export async function upsertQuitProfile(db, userId, patch = {}) {
  const nowSec = Math.floor(Date.now() / 1000)
  await ensureQuitHabitBinding(db, userId)
  const existing = await getQuitProfile(db, userId)

  const nextQuitStartAt =
    patch.quitStartAt == null
      ? existing?.quitStartAt ?? null
      : Math.floor(new Date(patch.quitStartAt).getTime() / 1000)

  const dailyCost = patch.dailyCost == null ? existing?.dailyCost ?? null : Number(patch.dailyCost)
  const cigarettesPerDay =
    patch.cigarettesPerDay == null ? existing?.cigarettesPerDay ?? null : Number(patch.cigarettesPerDay)
  const pricePerCigarette =
    patch.pricePerCigarette == null ? existing?.pricePerCigarette ?? null : Number(patch.pricePerCigarette)
  const timezone = patch.timezone || existing?.timezone || 'Asia/Shanghai'

  await db
    .prepare(
      `INSERT INTO quit_profiles (
         app_user_id, quit_start_at, timezone, daily_cost_cents, cigarettes_per_day, price_per_cigarette_cents, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(app_user_id) DO UPDATE SET
         quit_start_at = excluded.quit_start_at,
         timezone = excluded.timezone,
         daily_cost_cents = excluded.daily_cost_cents,
         cigarettes_per_day = excluded.cigarettes_per_day,
         price_per_cigarette_cents = excluded.price_per_cigarette_cents,
         updated_at = excluded.updated_at`,
    )
    .bind(
      userId,
      Number.isFinite(nextQuitStartAt) ? nextQuitStartAt : null,
      timezone,
      Number.isFinite(dailyCost) ? Math.round(dailyCost * 100) : null,
      Number.isFinite(cigarettesPerDay) ? cigarettesPerDay : null,
      Number.isFinite(pricePerCigarette) ? Math.round(pricePerCigarette * 100) : null,
      nowSec,
    )
    .run()

  return getQuitProfile(db, userId)
}

export async function listQuitEvents(db, userId, startDate, endDate) {
  const rows = await db
    .prepare(
      `SELECT id, app_user_id, event_type, event_at, event_date, cigarette_count, payload_json, source, created_at
       FROM quit_events
       WHERE app_user_id = ?
         AND event_date >= ?
         AND event_date <= ?
       ORDER BY event_at DESC`,
    )
    .bind(userId, startDate, endDate)
    .all()

  return (rows.results || []).map((row) => ({
    id: row.id,
    appUserId: row.app_user_id,
    type: row.event_type,
    eventAt: row.event_at,
    date: row.event_date,
    cigaretteCount: row.cigarette_count,
    details: row.payload_json ? JSON.parse(row.payload_json) : null,
    source: row.source,
    createdAt: row.created_at,
  }))
}

export async function createQuitEvent(db, userId, payload = {}) {
  const nowSec = Math.floor(Date.now() / 1000)
  await ensureQuitHabitBinding(db, userId)
  const eventDate = payload.date || toDateKey(payload.eventAt || Date.now())
  const eventAtSec = payload.eventAt
    ? Math.floor(new Date(payload.eventAt).getTime() / 1000)
    : nowSec

  const id = payload.id || crypto.randomUUID()
  const details = payload.details || {}
  const type = payload.type || 'note'
  const source = payload.source || 'h5'
  const cigaretteCount = Number(payload.cigaretteCount)

  await db
    .prepare(
      `INSERT INTO quit_events (
        id, app_user_id, event_type, event_at, event_date, cigarette_count, payload_json, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      userId,
      type,
      eventAtSec,
      eventDate,
      Number.isFinite(cigaretteCount) ? cigaretteCount : null,
      JSON.stringify(details || {}),
      source,
      nowSec,
    )
    .run()

  if (payload.resetQuitDate && eventAtSec) {
    await upsertQuitProfile(db, userId, {
      quitStartAt: new Date(eventAtSec * 1000).toISOString(),
    })
  }

  return { id }
}

export async function getGradualPlan(db, userId) {
  const row = await db
    .prepare(
      `SELECT app_user_id, initial_count, target_count, weeks, start_date, updated_at
       FROM quit_gradual_plans
       WHERE app_user_id = ?`,
    )
    .bind(userId)
    .first()
  if (!row) return null
  return {
    appUserId: row.app_user_id,
    initialCount: Number(row.initial_count || 0),
    targetCount: Number(row.target_count || 0),
    weeks: Number(row.weeks || 0),
    startDate: row.start_date || null,
    updatedAt: row.updated_at || null,
  }
}

export async function upsertGradualPlan(db, userId, payload = {}) {
  const nowSec = Math.floor(Date.now() / 1000)
  await ensureQuitHabitBinding(db, userId)
  const initialCount = Number(payload.initialCount || 0)
  const targetCount = Number(payload.targetCount || 0)
  const weeks = Number(payload.weeks || 0)
  const startDate = String(payload.startDate || '')

  await db
    .prepare(
      `INSERT INTO quit_gradual_plans (
        app_user_id, initial_count, target_count, weeks, start_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(app_user_id) DO UPDATE SET
        initial_count = excluded.initial_count,
        target_count = excluded.target_count,
        weeks = excluded.weeks,
        start_date = excluded.start_date,
        updated_at = excluded.updated_at`,
    )
    .bind(userId, initialCount, targetCount, weeks, startDate, nowSec)
    .run()

  return getGradualPlan(db, userId)
}

export async function getGradualDailyCount(db, userId, date) {
  const row = await db
    .prepare(
      `SELECT app_user_id, record_date, cigarette_count, last_smoke_at, updated_at
       FROM quit_gradual_daily_counts
       WHERE app_user_id = ? AND record_date = ?`,
    )
    .bind(userId, date)
    .first()

  if (!row) return 0
  return Number(row.cigarette_count || 0)
}

export async function upsertGradualDailyCount(db, userId, payload = {}) {
  const nowSec = Math.floor(Date.now() / 1000)
  await ensureQuitHabitBinding(db, userId)
  const date = String(payload.date || '').trim()
  const count = Number(payload.count || 0)
  const eventAtSec = payload.datetime ? Math.floor(new Date(payload.datetime).getTime() / 1000) : nowSec
  const lastSmokeAt = count > 0 ? eventAtSec : null

  await db
    .prepare(
      `INSERT INTO quit_gradual_daily_counts (
        app_user_id, record_date, cigarette_count, last_smoke_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(app_user_id, record_date) DO UPDATE SET
        cigarette_count = excluded.cigarette_count,
        last_smoke_at = CASE
          WHEN excluded.last_smoke_at IS NOT NULL THEN excluded.last_smoke_at
          ELSE quit_gradual_daily_counts.last_smoke_at
        END,
        updated_at = excluded.updated_at`,
    )
    .bind(userId, date, count, lastSmokeAt, nowSec)
    .run()

  return { date, count }
}

export async function getGradualLastSmokeTime(db, userId) {
  const row = await db
    .prepare(
      `SELECT MAX(last_smoke_at) AS last_smoke_at
       FROM quit_gradual_daily_counts
       WHERE app_user_id = ?`,
    )
    .bind(userId)
    .first()
  if (!row?.last_smoke_at) return null
  return new Date(Number(row.last_smoke_at) * 1000).toISOString()
}

export async function listGradualCountRecords(db, userId, startDate, endDate) {
  const rows = await db
    .prepare(
      `SELECT app_user_id, record_date, cigarette_count, last_smoke_at, updated_at
       FROM quit_gradual_daily_counts
       WHERE app_user_id = ? AND record_date >= ? AND record_date <= ?
       ORDER BY record_date ASC`,
    )
    .bind(userId, startDate, endDate)
    .all()
  return (rows.results || []).map((row) => ({
    appUserId: row.app_user_id,
    date: row.record_date,
    count: Number(row.cigarette_count || 0),
    lastSmokeAt: row.last_smoke_at ? new Date(Number(row.last_smoke_at) * 1000).toISOString() : null,
    updatedAt: row.updated_at || null,
  }))
}

export async function deleteAllQuitData(db, userId) {
  const eventsRes = await db.prepare(`DELETE FROM quit_events WHERE app_user_id = ?`).bind(userId).run()
  const profilesRes = await db.prepare(`DELETE FROM quit_profiles WHERE app_user_id = ?`).bind(userId).run()
  const dailyRes = await db.prepare(`DELETE FROM quit_gradual_daily_counts WHERE app_user_id = ?`).bind(userId).run()
  const plansRes = await db.prepare(`DELETE FROM quit_gradual_plans WHERE app_user_id = ?`).bind(userId).run()
  const bindingRes = await db
    .prepare(`DELETE FROM user_habit_bindings WHERE app_user_id = ? AND habit_type = ?`)
    .bind(userId, QUIT_HABIT_TYPE)
    .run()
  const counts = {
    quitEvents: Number(eventsRes?.meta?.changes || 0),
    quitProfiles: Number(profilesRes?.meta?.changes || 0),
    gradualDailyCounts: Number(dailyRes?.meta?.changes || 0),
    gradualPlans: Number(plansRes?.meta?.changes || 0),
    habitBindings: Number(bindingRes?.meta?.changes || 0),
  }
  const totalDeleted = Object.values(counts).reduce((sum, n) => sum + Number(n || 0), 0)
  return { deleted: true, counts, totalDeleted }
}

export async function getQuitDashboard(db, userId, todayDate) {
  const today = todayDate || toDateKey(Date.now())
  const nowSec = Math.floor(Date.now() / 1000)

  const [profile, relapseRow, gradualPlan, gradualTodayCount, gradualLastSmokeIso] = await Promise.all([
    getQuitProfile(db, userId),
    db
      .prepare(
        `SELECT event_at
         FROM quit_events
         WHERE app_user_id = ? AND event_type = 'relapse'
         ORDER BY event_at DESC
         LIMIT 1`,
      )
      .bind(userId)
      .first(),
    getGradualPlan(db, userId),
    getGradualDailyCount(db, userId, today),
    getGradualLastSmokeTime(db, userId),
  ])

  const relapseEventAt = relapseRow?.event_at ? Number(relapseRow.event_at) : null
  const gradualLastSmokeAt = gradualLastSmokeIso ? Math.floor(new Date(gradualLastSmokeIso).getTime() / 1000) : null
  const lastRelapseAt = Math.max(relapseEventAt || 0, gradualLastSmokeAt || 0) || null

  const baseQuitStartAt = profile?.quitStartAt || null
  const quitStartAt = Math.max(baseQuitStartAt || 0, lastRelapseAt || 0) || baseQuitStartAt || lastRelapseAt || null
  const days = quitStartAt ? Math.max(0, diffDaysBySec(nowSec, quitStartAt)) : 0
  const dailyCost = Number(profile?.dailyCost || 0)
  const savedMoney = Number((days * dailyCost).toFixed(2))

  const gradual = gradualPlan
    ? {
        enabled: true,
        ...gradualPlan,
        todayCount: Number(gradualTodayCount || 0),
        lastSmokeAt: gradualLastSmokeIso,
        targetToday: calcTodayTarget(gradualPlan, today),
      }
    : { enabled: false }

  if (gradual.enabled) {
    gradual.remaining = Math.max(0, Number(gradual.targetToday || 0) - Number(gradual.todayCount || 0))
  }

  return {
    quitStartAt,
    lastRelapseAt,
    days,
    dailyCost,
    savedMoney,
    profile: profile || null,
    gradual,
  }
}
