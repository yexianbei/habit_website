/**
 * 金额统计详情弹窗
 */

import React, { useState, useEffect } from 'react'
import { formatNumber } from '../../../../../utils/quitUtils'
import { getQuitProfileApi, hasWorkerAuthToken, updateQuitProfileApi } from '../../../../../utils/quitApi'

export const MoneyDetailModal = ({ 
  isOpen, 
  onClose, 
  savedMoney, 
  dailyCost, 
  days, 
  onDailyCostChange,
  onSettingsChange,
  showToast,
  showLoading,
  hideLoading,
}) => {
  // 如果没有传递这些方法，使用默认实现
  const safeShowToast = showToast || ((msg) => console.log('[Toast]', msg))
  const safeShowLoading = showLoading || (() => {})
  const safeHideLoading = hideLoading || (() => {})
  
  const [isEditing, setIsEditing] = useState(false)
  const [cigarettesPerDay, setCigarettesPerDay] = useState('')
  const [pricePerCigarette, setPricePerCigarette] = useState('')
  const [calculatedDailyCost, setCalculatedDailyCost] = useState(dailyCost || 0)

  // 加载设置
  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  // 当 dailyCost 变化时更新计算值
  useEffect(() => {
    if (dailyCost) {
      setCalculatedDailyCost(dailyCost)
    }
  }, [dailyCost])

  const loadSettings = async () => {
    try {
      const workerEnabled = await hasWorkerAuthToken().catch(() => false)
      if (!workerEnabled) return
      const settings = await getQuitProfileApi().catch(() => null)
      if (settings) {
        setCigarettesPerDay(settings.cigarettesPerDay?.toString() || '')
        setPricePerCigarette(settings.pricePerCigarette?.toString() || '')
        
        // 如果有设置，计算 dailyCost
        if (settings.cigarettesPerDay && settings.pricePerCigarette) {
          const cost = settings.cigarettesPerDay * settings.pricePerCigarette
          setCalculatedDailyCost(cost)
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  const handleSave = async () => {
    const cigarettes = parseFloat(cigarettesPerDay)
    const price = parseFloat(pricePerCigarette)

    if (!cigarettes || cigarettes <= 0) {
      safeShowToast('请输入每天抽多少根烟')
      return
    }

    if (!price || price <= 0) {
      safeShowToast('请输入一根烟的价格')
      return
    }

    try {
      safeShowLoading()
      const newDailyCost = cigarettes * price
      const workerEnabled = await hasWorkerAuthToken().catch(() => false)
      if (!workerEnabled) {
        throw new Error('缺少 token，请在打开 H5 时携带 token 参数')
      }
      
      // 保存设置
      await updateQuitProfileApi({
        cigarettesPerDay: cigarettes,
        pricePerCigarette: price,
        dailyCost: newDailyCost,
      })

      setCalculatedDailyCost(newDailyCost)
      setIsEditing(false)
      
      // 通知父组件更新 dailyCost
      if (onDailyCostChange) {
        onDailyCostChange(newDailyCost)
      }
      
      // 通知父组件更新设置
      if (onSettingsChange) {
        onSettingsChange({
          cigarettesPerDay: cigarettes,
          pricePerCigarette: price,
          dailyCost: newDailyCost,
        })
      }
      
      safeShowToast('设置已保存')
    } catch (error) {
      console.error('保存设置失败:', error)
      safeShowToast('保存失败: ' + (error.message || '未知错误'))
    } finally {
      safeHideLoading()
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadSettings() // 恢复原始值
  }

  if (!isOpen) return null

  const weekly = calculatedDailyCost * 7
  const monthly = calculatedDailyCost * 30
  const yearly = calculatedDailyCost * 365
  // 使用传入的 savedMoney（已经是精确计算的），如果没有则使用天数计算作为后备
  const currentSavedMoney = savedMoney > 0 ? savedMoney : (days * calculatedDailyCost)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            金额统计
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* 已节省金额 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">¥{(currentSavedMoney || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">已节省金额</div>
            <div className="text-xs text-gray-500 mt-1">
              {cigarettesPerDay > 0 && pricePerCigarette > 0 
                ? `每天 ${cigarettesPerDay} 根 × ¥${parseFloat(pricePerCigarette).toFixed(2)} = ¥${calculatedDailyCost.toFixed(2)}`
                : `坚持 ${days} 天 × 每天 ¥${calculatedDailyCost.toFixed(2)}`}
            </div>
          </div>

          {/* 设置区域 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>⚙️</span>
                费用设置
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-quit-green font-medium px-3 py-1.5 rounded-lg hover:bg-quit-green/10 active:scale-95 transition-transform"
                >
                  编辑
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每天抽多少根烟？
                  </label>
                  <input
                    type="number"
                    value={cigarettesPerDay}
                    onChange={(e) => setCigarettesPerDay(e.target.value)}
                    placeholder="例如：20"
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    一根烟多少钱？（元）
                  </label>
                  <input
                    type="number"
                    value={pricePerCigarette}
                    onChange={(e) => setPricePerCigarette(e.target.value)}
                    placeholder="例如：0.5"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-quit-green"
                  />
                </div>

                {/* 实时计算预览 */}
                {cigarettesPerDay && pricePerCigarette && (
                  <div className="bg-quit-green/10 rounded-xl p-3 border border-quit-green/20">
                    <div className="text-sm text-gray-600 mb-1">计算结果：</div>
                    <div className="text-lg font-bold text-quit-green-dark">
                      每天花费：¥{(parseFloat(cigarettesPerDay || 0) * parseFloat(pricePerCigarette || 0)).toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:scale-95 transition-transform"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-quit-green to-quit-green-dark text-white font-medium shadow-lg active:scale-95 transition-transform"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">每天抽多少根烟</span>
                  <span className="text-base font-bold text-gray-800">
                    {cigarettesPerDay ? `${cigarettesPerDay} 根` : '未设置'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">一根烟多少钱</span>
                  <span className="text-base font-bold text-gray-800">
                    {pricePerCigarette ? `¥${parseFloat(pricePerCigarette).toFixed(2)}` : '未设置'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">每天花费</span>
                  <span className="text-base font-bold text-quit-green-dark">
                    ¥{calculatedDailyCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <div className="text-lg font-bold text-gray-800">¥{weekly.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">每周</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <div className="text-lg font-bold text-gray-800">¥{monthly.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">每月</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <div className="text-lg font-bold text-gray-800">¥{yearly.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">每年</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 <strong>理财建议：</strong>将节省的钱存入专门的账户，用这些钱奖励自己，让戒烟更有动力！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
