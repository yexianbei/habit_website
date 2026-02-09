/**
 * 闪卡学习页面
 * 翻转卡片交互
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFlashcardData } from './useFlashcardData'

export default function FlashcardStudy() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const { getDeck, getCards, loading } = useFlashcardData()
  
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (loading) return
    
    const currentDeck = getDeck(deckId)
    const deckCards = getCards(deckId)
    
    if (currentDeck) {
      setDeck(currentDeck)
      setCards(deckCards)
    }
  }, [deckId, loading, getDeck, getCards])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = (difficulty) => {
    // 简单模拟算法：无论选什么都下一个
    // 实际应用这里会根据 difficulty 计算下次复习时间
    setIsFlipped(false)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setIsFinished(true)
      }
    }, 200) // 等待翻转回去的动画
  }

  if (!deck) return <div className="min-h-screen flex items-center justify-center">加载中...</div>

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">复习完成！</h2>
        <p className="text-gray-500 mb-8">你今天非常棒，继续保持！</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          返回列表
        </button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="text-2xl mr-4">←</button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-800">{deck.title}</h1>
          <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="ml-4 text-sm font-medium text-gray-500">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* 卡片区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 perspective-1000 relative overflow-hidden">
         {/* 背景装饰 */}
         <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
         </div>

        <div 
          className="w-full max-w-md aspect-[3/4] relative cursor-pointer group perspective-1000"
          onClick={handleFlip}
        >
          <div className={`relative w-full h-full transition-all duration-500 transform preserve-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* 正面 */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-3xl flex flex-col items-center justify-center p-8 border border-gray-50">
              <span className="text-xs text-gray-400 absolute top-6 left-6 uppercase tracking-wider">Question</span>
              <div className="text-3xl font-bold text-gray-800 text-center leading-relaxed">
                {currentCard?.front}
              </div>
              <div className="absolute bottom-6 text-gray-400 text-sm animate-pulse">
                点击翻转
              </div>
            </div>

            {/* 背面 */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex flex-col items-center justify-center p-8 rotate-y-180 text-white">
              <span className="text-xs text-indigo-200 absolute top-6 left-6 uppercase tracking-wider">Answer</span>
              <div className="text-2xl font-medium text-center leading-relaxed">
                {currentCard?.back}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white pb-8 pt-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl z-10">
        {!isFlipped ? (
          <button 
            onClick={handleFlip}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-98 transition-transform"
          >
            显示答案
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => handleNext('again')} className="flex flex-col items-center py-2 rounded-xl active:bg-gray-50">
              <span className="text-sm font-bold text-red-500 mb-1">重来</span>
              <span className="text-xs text-gray-400">1m</span>
            </button>
            <button onClick={() => handleNext('hard')} className="flex flex-col items-center py-2 rounded-xl active:bg-gray-50">
              <span className="text-sm font-bold text-orange-500 mb-1">困难</span>
              <span className="text-xs text-gray-400">10m</span>
            </button>
            <button onClick={() => handleNext('good')} className="flex flex-col items-center py-2 rounded-xl active:bg-gray-50">
              <span className="text-sm font-bold text-blue-500 mb-1">良好</span>
              <span className="text-xs text-gray-400">1d</span>
            </button>
            <button onClick={() => handleNext('easy')} className="flex flex-col items-center py-2 rounded-xl active:bg-gray-50">
              <span className="text-sm font-bold text-green-500 mb-1">简单</span>
              <span className="text-xs text-gray-400">4d</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
