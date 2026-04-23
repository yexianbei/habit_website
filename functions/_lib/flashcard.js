const FLASHCARD_HABIT_TYPE = 'flashcard'

let bindingTableReady = false

function todayDateKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalizeDifficulty(v) {
  const value = String(v || '').toLowerCase()
  if (value === 'again' || value === 'hard' || value === 'good' || value === 'easy') return value
  return 'good'
}

function calcNextIntervalDays(previousIntervalDays, difficulty) {
  const prev = Number(previousIntervalDays || 0)
  if (difficulty === 'again') return 0
  if (difficulty === 'hard') return Math.max(1, prev > 0 ? Math.round(prev * 1.2) : 1)
  if (difficulty === 'easy') return Math.max(2, prev > 0 ? Math.round(prev * 3) : 3)
  return Math.max(1, prev > 0 ? Math.round(prev * 2) : 1)
}

function calcDueAt(nowSec, intervalDays, difficulty) {
  if (difficulty === 'again') return nowSec + 10 * 60
  return nowSec + intervalDays * 24 * 60 * 60
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

export async function ensureFlashcardHabitBinding(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  try {
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET
           updated_at = excluded.updated_at`,
      )
      .bind(userId, FLASHCARD_HABIT_TYPE, nowSec, nowSec)
      .run()
  } catch (error) {
    const message = String(error?.message || '')
    if (!message.includes('no such table: user_habit_bindings')) throw error
    await ensureBindingTable(db)
    await db
      .prepare(
        `INSERT INTO user_habit_bindings (app_user_id, habit_type, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(app_user_id, habit_type) DO UPDATE SET
           updated_at = excluded.updated_at`,
      )
      .bind(userId, FLASHCARD_HABIT_TYPE, nowSec, nowSec)
      .run()
  }
}

function mapDeckRow(row) {
  const total = Number(row.total_count || 0)
  const due = Number(row.due_count || 0)
  return {
    id: row.id,
    title: row.title,
    desc: row.description || '',
    icon: row.icon || '🧠',
    total,
    due,
    color: row.color || 'from-blue-500 to-indigo-500',
    shadow: row.shadow || 'shadow-blue-200',
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

export async function listFlashcardDecks(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  const rows = await db
    .prepare(
      `SELECT
         d.id, d.title, d.description, d.icon, d.color, d.shadow, d.created_at, d.updated_at,
         (SELECT COUNT(1) FROM flashcard_cards c WHERE c.deck_id = d.id) AS total_count,
         (SELECT COUNT(1)
          FROM flashcard_cards c
          LEFT JOIN flashcard_progress p
            ON p.app_user_id = d.app_user_id AND p.card_id = c.id
          WHERE c.deck_id = d.id
            AND (p.due_at IS NULL OR p.due_at <= ?)
         ) AS due_count
       FROM flashcard_decks d
       WHERE d.app_user_id = ? AND d.archived = 0
       ORDER BY d.updated_at DESC`,
    )
    .bind(nowSec, userId)
    .all()
  return (rows.results || []).map(mapDeckRow)
}

export async function getFlashcardDeckDetail(db, userId, deckId) {
  const row = await db
    .prepare(
      `SELECT id, title, description, icon, color, shadow, created_at, updated_at
       FROM flashcard_decks
       WHERE app_user_id = ? AND id = ? AND archived = 0`,
    )
    .bind(userId, deckId)
    .first()
  if (!row) return null

  const cardsRows = await db
    .prepare(
      `SELECT
         c.id, c.front_text, c.back_text, c.sort_order,
         p.due_at, p.interval_days, p.review_count, p.last_difficulty, p.last_review_at
       FROM flashcard_cards c
       LEFT JOIN flashcard_progress p
         ON p.app_user_id = c.app_user_id AND p.card_id = c.id
       WHERE c.app_user_id = ? AND c.deck_id = ?
       ORDER BY c.sort_order ASC, c.created_at ASC`,
    )
    .bind(userId, deckId)
    .all()

  const cards = (cardsRows.results || []).map((r) => ({
    id: r.id,
    front: r.front_text,
    back: r.back_text || '',
    sortOrder: Number(r.sort_order || 0),
    dueAt: r.due_at || null,
    intervalDays: Number(r.interval_days || 0),
    reviewCount: Number(r.review_count || 0),
    lastDifficulty: r.last_difficulty || null,
    lastReviewAt: r.last_review_at || null,
  }))

  return {
    deck: {
      id: row.id,
      title: row.title,
      desc: row.description || '',
      icon: row.icon || '🧠',
      color: row.color || 'from-blue-500 to-indigo-500',
      shadow: row.shadow || 'shadow-blue-200',
      total: cards.length,
      due: cards.filter((c) => !c.dueAt || Number(c.dueAt) <= Math.floor(Date.now() / 1000)).length,
      createdAt: row.created_at || null,
      updatedAt: row.updated_at || null,
    },
    cards,
  }
}

export async function createFlashcardDeck(db, userId, payload = {}) {
  await ensureFlashcardHabitBinding(db, userId)
  const nowSec = Math.floor(Date.now() / 1000)
  const title = String(payload.title || '').trim()
  const description = String(payload.desc || payload.description || '').trim()
  const icon = String(payload.icon || '🧠').trim() || '🧠'
  const color = String(payload.color || 'from-blue-500 to-indigo-500')
  const shadow = String(payload.shadow || 'shadow-blue-200')
  const inputCards = Array.isArray(payload.cards) ? payload.cards : []

  if (!title) throw new Error('INVALID_TITLE')
  if (inputCards.length === 0) throw new Error('EMPTY_CARDS')

  const deckId = `deck_${crypto.randomUUID()}`
  const cards = inputCards
    .map((c, idx) => ({
      id: `card_${crypto.randomUUID()}`,
      front: String(c?.front || '').trim(),
      back: String(c?.back || '').trim(),
      sortOrder: idx,
    }))
    .filter((c) => c.front)

  if (cards.length === 0) throw new Error('EMPTY_CARDS')

  await db.batch([
    db
      .prepare(
        `INSERT INTO flashcard_decks (
           id, app_user_id, title, description, icon, color, shadow, archived, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      )
      .bind(deckId, userId, title, description, icon, color, shadow, nowSec, nowSec),
    ...cards.map((card) =>
      db
        .prepare(
          `INSERT INTO flashcard_cards (
             id, deck_id, app_user_id, front_text, back_text, sort_order, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(card.id, deckId, userId, card.front, card.back, card.sortOrder, nowSec, nowSec),
    ),
    ...cards.map((card) =>
      db
        .prepare(
          `INSERT INTO flashcard_progress (
             app_user_id, card_id, deck_id, due_at, interval_days, ease_factor, review_count, lapse_count, updated_at
           ) VALUES (?, ?, ?, ?, 0, 2.5, 0, 0, ?)`,
        )
        .bind(userId, card.id, deckId, nowSec, nowSec),
    ),
  ])

  return getFlashcardDeckDetail(db, userId, deckId)
}

function calcStreakDays(dateRows, todayKey) {
  const set = new Set((dateRows || []).map((r) => String(r.review_date)))
  if (set.size === 0) return 0
  let streak = 0
  let cursor = new Date(`${todayKey}T00:00:00`)
  while (true) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    const key = `${y}-${m}-${d}`
    if (!set.has(key)) break
    streak += 1
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000)
  }
  return streak
}

export async function getFlashcardDashboard(db, userId) {
  const nowSec = Math.floor(Date.now() / 1000)
  const todayKey = todayDateKey()
  const [decks, totalsRow, todayReviewRow, streakRows] = await Promise.all([
    listFlashcardDecks(db, userId),
    db
      .prepare(
        `SELECT
           (SELECT COUNT(1) FROM flashcard_cards WHERE app_user_id = ?) AS total_cards,
           (SELECT COUNT(1) FROM flashcard_cards c
            LEFT JOIN flashcard_progress p ON p.app_user_id = c.app_user_id AND p.card_id = c.id
            WHERE c.app_user_id = ? AND (p.due_at IS NULL OR p.due_at <= ?)
           ) AS due_today,
           (SELECT COUNT(1) FROM flashcard_progress
            WHERE app_user_id = ? AND interval_days >= 7 AND due_at > ?
           ) AS mastered_cards`,
      )
      .bind(userId, userId, nowSec, userId, nowSec)
      .first(),
    db
      .prepare(
        `SELECT COUNT(1) AS reviewed_today
         FROM flashcard_review_logs
         WHERE app_user_id = ? AND review_date = ?`,
      )
      .bind(userId, todayKey)
      .first(),
    db
      .prepare(
        `SELECT DISTINCT review_date
         FROM flashcard_review_logs
         WHERE app_user_id = ?
         ORDER BY review_date DESC
         LIMIT 30`,
      )
      .bind(userId)
      .all(),
  ])

  return {
    decks,
    stats: {
      dueToday: Number(totalsRow?.due_today || 0),
      mastered: Number(totalsRow?.mastered_cards || 0),
      totalCards: Number(totalsRow?.total_cards || 0),
      reviewedToday: Number(todayReviewRow?.reviewed_today || 0),
      streakDays: calcStreakDays(streakRows?.results || [], todayKey),
    },
  }
}

export async function reviewFlashcardCard(db, userId, payload = {}) {
  const nowSec = Math.floor(Date.now() / 1000)
  const reviewDate = todayDateKey()
  const deckId = String(payload.deckId || '').trim()
  const cardId = String(payload.cardId || '').trim()
  const difficulty = normalizeDifficulty(payload.difficulty)

  if (!deckId || !cardId) throw new Error('INVALID_REVIEW_PAYLOAD')

  const card = await db
    .prepare(
      `SELECT id
       FROM flashcard_cards
       WHERE app_user_id = ? AND deck_id = ? AND id = ?`,
    )
    .bind(userId, deckId, cardId)
    .first()
  if (!card) throw new Error('CARD_NOT_FOUND')

  const prev = await db
    .prepare(
      `SELECT interval_days, review_count, lapse_count, ease_factor
       FROM flashcard_progress
       WHERE app_user_id = ? AND card_id = ?`,
    )
    .bind(userId, cardId)
    .first()

  const prevInterval = Number(prev?.interval_days || 0)
  const intervalDays = calcNextIntervalDays(prevInterval, difficulty)
  const dueAt = calcDueAt(nowSec, intervalDays, difficulty)
  const reviewCount = Number(prev?.review_count || 0) + 1
  const lapseCount = Number(prev?.lapse_count || 0) + (difficulty === 'again' ? 1 : 0)
  const easeFactor = Number(prev?.ease_factor || 2.5)

  await db.batch([
    db
      .prepare(
        `INSERT INTO flashcard_progress (
           app_user_id, card_id, deck_id, due_at, interval_days, ease_factor,
           review_count, lapse_count, last_difficulty, last_review_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(app_user_id, card_id) DO UPDATE SET
           due_at = excluded.due_at,
           interval_days = excluded.interval_days,
           ease_factor = excluded.ease_factor,
           review_count = excluded.review_count,
           lapse_count = excluded.lapse_count,
           last_difficulty = excluded.last_difficulty,
           last_review_at = excluded.last_review_at,
           updated_at = excluded.updated_at`,
      )
      .bind(
        userId,
        cardId,
        deckId,
        dueAt,
        intervalDays,
        easeFactor,
        reviewCount,
        lapseCount,
        difficulty,
        nowSec,
        nowSec,
      ),
    db
      .prepare(
        `INSERT INTO flashcard_review_logs (
           id, app_user_id, deck_id, card_id, difficulty, reviewed_at, review_date, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(`log_${crypto.randomUUID()}`, userId, deckId, cardId, difficulty, nowSec, reviewDate, nowSec),
    db
      .prepare(`UPDATE flashcard_decks SET updated_at = ? WHERE app_user_id = ? AND id = ?`)
      .bind(nowSec, userId, deckId),
  ])

  return { cardId, deckId, difficulty, dueAt, intervalDays }
}

export async function deleteAllFlashcardData(db, userId) {
  const logsRes = await db.prepare(`DELETE FROM flashcard_review_logs WHERE app_user_id = ?`).bind(userId).run()
  const progressRes = await db.prepare(`DELETE FROM flashcard_progress WHERE app_user_id = ?`).bind(userId).run()
  const cardsRes = await db.prepare(`DELETE FROM flashcard_cards WHERE app_user_id = ?`).bind(userId).run()
  const decksRes = await db.prepare(`DELETE FROM flashcard_decks WHERE app_user_id = ?`).bind(userId).run()
  const bindingRes = await db
    .prepare(`DELETE FROM user_habit_bindings WHERE app_user_id = ? AND habit_type = ?`)
    .bind(userId, FLASHCARD_HABIT_TYPE)
    .run()

  const counts = {
    reviewLogs: Number(logsRes?.meta?.changes || 0),
    progress: Number(progressRes?.meta?.changes || 0),
    cards: Number(cardsRes?.meta?.changes || 0),
    decks: Number(decksRes?.meta?.changes || 0),
    habitBindings: Number(bindingRes?.meta?.changes || 0),
  }
  const totalDeleted = Object.values(counts).reduce((sum, n) => sum + Number(n || 0), 0)
  return { deleted: true, counts, totalDeleted }
}
