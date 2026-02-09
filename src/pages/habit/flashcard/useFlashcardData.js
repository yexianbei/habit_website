import { useState, useEffect } from 'react';
import { mockDecks, mockCards } from './data';

const STORAGE_KEY_DECKS = 'flashcard_decks';
const STORAGE_KEY_CARDS = 'flashcard_cards';

export function useFlashcardData() {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);

  // 初始化数据：合并 Mock 数据和 LocalStorage 数据
  useEffect(() => {
    const loadData = () => {
      try {
        const storedDecks = localStorage.getItem(STORAGE_KEY_DECKS);
        const storedCards = localStorage.getItem(STORAGE_KEY_CARDS);

        const localDecks = storedDecks ? JSON.parse(storedDecks) : [];
        const localCards = storedCards ? JSON.parse(storedCards) : {};

        // 合并策略：Mock 数据在前，本地数据在后（或者根据需求混合）
        // 这里简单处理：如果本地没有数据，初始化为 Mock 数据；如果有，则合并
        
        // 为了演示方便，我们总是把 Mock 数据和 LocalStorage 数据合并显示
        // 注意：实际应用中可能需要去重
        const allDecks = [...mockDecks, ...localDecks];
        const allCards = { ...mockCards, ...localCards };

        setDecks(allDecks);
        setCards(allCards);
      } catch (e) {
        console.error('Failed to load flashcard data', e);
        setDecks(mockDecks);
        setCards(mockCards);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const saveDeck = (newDeck, newDeckCards) => {
    try {
      // 1. 获取现有本地数据
      const storedDecks = JSON.parse(localStorage.getItem(STORAGE_KEY_DECKS) || '[]');
      const storedCards = JSON.parse(localStorage.getItem(STORAGE_KEY_CARDS) || '{}');

      // 2. 更新本地数据
      const updatedDecks = [...storedDecks, newDeck];
      const updatedCards = { ...storedCards, [newDeck.id]: newDeckCards };

      // 3. 保存回 LocalStorage
      localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(updatedDecks));
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(updatedCards));

      // 4. 更新状态
      setDecks(prev => [...prev, newDeck]);
      setCards(prev => ({ ...prev, [newDeck.id]: newDeckCards }));
      
      return true;
    } catch (e) {
      console.error('Failed to save deck', e);
      return false;
    }
  };

  const getDeck = (deckId) => {
    return decks.find(d => d.id === deckId);
  };

  const getCards = (deckId) => {
    return cards[deckId] || [];
  };

  return {
    decks,
    loading,
    getDeck,
    getCards,
    saveDeck
  };
}
