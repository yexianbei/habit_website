/**
 * 闪卡导入/创建页面
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlashcardData } from './useFlashcardData'

const PRESET_COLORS = [
  { name: 'Blue', value: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200' },
  { name: 'Orange', value: 'from-rose-500 to-orange-500', shadow: 'shadow-orange-200' },
  { name: 'Green', value: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-200' },
  { name: 'Yellow', value: 'from-amber-400 to-yellow-500', shadow: 'shadow-yellow-200' },
  { name: 'Purple', value: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-200' },
  { name: 'Pink', value: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200' },
]

export default function FlashcardImport() {
  const navigate = useNavigate()
  const { saveDeck } = useFlashcardData()
  
  const [step, setStep] = useState(1) // 1: Info, 2: Content
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [importText, setImportText] = useState('')
  const [parsedCards, setParsedCards] = useState([])
  const [separator, setSeparator] = useState('|') // 默认分隔符

  // 解析文本
  const parseContent = (text) => {
    if (!text) return []
    return text.split('\n')
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        // 支持自定义分隔符，默认为 |
        // 如果找不到分隔符，整行作为正面，背面为空
        const parts = line.split(separator)
        return {
          id: Date.now() + index,
          front: parts[0]?.trim() || '',
          back: parts.slice(1).join(separator)?.trim() || '' // 重新组合剩余部分作为背面
        }
      })
      .filter(card => card.front) // 过滤掉没有正面的卡片
  }

  const handlePreview = () => {
    const cards = parseContent(importText)
    if (cards.length === 0) {
      alert('请输入内容，每行一条，使用 "|" 分隔正面和背面')
      return
    }
    setParsedCards(cards)
    setStep(2)
  }

  const handleSave = () => {
    if (!title) {
      alert('请输入卡组标题')
      return
    }

    const newDeck = {
      id: `custom-${Date.now()}`,
      title,
      desc: desc || '自定义卡组',
      icon: '📝', // 默认图标
      total: parsedCards.length,
      due: parsedCards.length, // 新卡组全部待复习
      color: selectedColor.value,
      shadow: selectedColor.shadow,
      createdAt: new Date().toISOString()
    }

    const success = saveDeck(newDeck, parsedCards)
    if (success) {
      navigate('/habit/flashcard')
    } else {
      alert('保存失败，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm z-10 sticky top-0">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="text-gray-500 mr-3">
          取消
        </button>
        <h1 className="font-bold text-gray-800 flex-1 text-center">
          {step === 1 ? '创建新卡组' : '确认内容'}
        </h1>
        <button 
          onClick={step === 1 ? handlePreview : handleSave}
          className="text-indigo-600 font-bold"
        >
          {step === 1 ? '下一步' : '完成'}
        </button>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {step === 1 ? (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：雅思核心词汇"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="简短描述这个卡组的内容"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">主题颜色</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.value} flex-shrink-0 transition-transform ${
                      selectedColor.name === color.name ? 'ring-4 ring-offset-2 ring-indigo-200 scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 批量导入 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">批量导入内容</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">分隔符:</span>
                  <select 
                    value={separator} 
                    onChange={e => setSeparator(e.target.value)}
                    className="bg-gray-50 text-xs border rounded px-1 py-0.5 outline-none"
                  >
                    <option value="|">|</option>
                    <option value=",">,</option>
                    <option value="-">-</option>
                    <option value="\t">Tab</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                每行一张卡片，格式：<span className="font-mono bg-gray-100 px-1 rounded">正面 {separator === '\t' ? '[Tab]' : separator} 背面</span>
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={`Apple ${separator === '\t' ? '[Tab]' : separator} 苹果\nBanana ${separator === '\t' ? '[Tab]' : separator} 香蕉\n...`}
                className="w-full h-64 px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-gray-500 text-sm">预览 ({parsedCards.length} 张卡片)</h3>
            </div>
            
            {parsedCards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">正面</span>
                    <p className="text-gray-800 font-medium break-words">{card.front}</p>
                  </div>
                  <div className="border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-2">
                    <span className="text-xs text-gray-400 block mb-1">背面</span>
                    <p className="text-gray-600 break-words">{card.back}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {parsedCards.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                没有解析到卡片，请检查格式
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
