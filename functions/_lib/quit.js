function toDateKey(dateLike) {
  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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
