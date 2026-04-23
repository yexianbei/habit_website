import { useState, useEffect, useCallback } from 'react'
import {
  createFlashcardDeckApi,
  getFlashcardDashboardApi,
  getFlashcardDeckApi,
  reviewFlashcardCardApi,
} from '../../../utils/flashcardApi'

export function useFlashcardData() {
  const [decks, setDecks] = useState([])
  const [cardsMap, setCardsMap] = useState({})
  const [stats, setStats] = useState({
    dueToday: 0,
    mastered: 0,
    totalCards: 0,
    reviewedToday: 0,
    streakDays: 0,
  })
  const [loading, setLoading] = useState(true)

  const refreshDashboard = useCallback(async () => {
    const dashboard = await getFlashcardDashboardApi()
    setDecks(Array.isArray(dashboard?.decks) ? dashboard.decks : [])
    setStats({
      dueToday: Number(dashboard?.stats?.dueToday || 0),
      mastered: Number(dashboard?.stats?.mastered || 0),
      totalCards: Number(dashboard?.stats?.totalCards || 0),
      reviewedToday: Number(dashboard?.stats?.reviewedToday || 0),
      streakDays: Number(dashboard?.stats?.streakDays || 0),
    })
    return dashboard
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshDashboard()
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load flashcard dashboard', e)
          setDecks([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshDashboard])

  const saveDeck = useCallback(async (newDeck, newDeckCards) => {
    try {
      const detail = await createFlashcardDeckApi({
        title: newDeck?.title,
        desc: newDeck?.desc,
        icon: newDeck?.icon || '📝',
        color: newDeck?.color,
        shadow: newDeck?.shadow,
        cards: (newDeckCards || []).map((c) => ({
          front: c.front,
          back: c.back,
        })),
      })
      if (detail?.deck?.id && Array.isArray(detail?.cards)) {
        setCardsMap((prev) => ({ ...prev, [detail.deck.id]: detail.cards }))
      }
      await refreshDashboard()
      return true
    } catch (e) {
      console.error('Failed to save deck', e)
      return false
    }
  }, [refreshDashboard])

  const loadDeck = useCallback(async (deckId) => {
    const detail = await getFlashcardDeckApi(deckId)
    if (detail?.deck?.id && Array.isArray(detail?.cards)) {
      setCardsMap((prev) => ({ ...prev, [detail.deck.id]: detail.cards }))
    }
    return detail
  }, [])

  const recordReview = useCallback(async ({ deckId, cardId, difficulty }) => {
    const result = await reviewFlashcardCardApi({ deckId, cardId, difficulty })
    return result
  }, [])

  const getDeck = useCallback((deckId) => decks.find((d) => d.id === deckId), [decks])
  const getCards = useCallback((deckId) => cardsMap[deckId] || [], [cardsMap])

  return {
    decks,
    stats,
    loading,
    getDeck,
    getCards,
    saveDeck,
    loadDeck,
    recordReview,
    refreshDashboard,
  }
}
