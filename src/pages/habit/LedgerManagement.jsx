import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const LEDGER_TYPE = 20

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const uuid = () => Math.random().toString(36).slice(2)

export default function LedgerManagement() {
  const { isInApp, setTitle, showToast, showLoading, hideLoading, getStorage, setStorage } = useNativeBridge()
  const [ledgers, setLedgers] = useState([])
  const [selectedLedgerId, setSelectedLedgerId] = useState(null)
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLedgerModal, setShowLedgerModal] = useState(false)
  const [newLedgerName, setNewLedgerName] = useState('')
  const [newLedgerCurrency, setNewLedgerCurrency] = useState('CNY')
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [entryForm, setEntryForm] = useState({ type: 'expense', amount: '', category: '', date: formatDate(new Date()), note: '' })

  const pageTitle = '记账'
  useEffect(() => {
    document.title = pageTitle
  }, [])
  useEffect(() => {
    if (isInApp) setTitle(pageTitle)
  }, [isInApp, setTitle])

  const ledgerKey = 'ledger:list'
  const entriesKey = (id) => `ledger:entries:${id}`

  const loadLedgers = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await getStorage(ledgerKey)
      let arr = []
      if (Array.isArray(list) && list.length > 0) {
        arr = list
      } else {
        const defaultLedger = { id: uuid(), name: '默认账本', currency: 'CNY' }
        arr = [defaultLedger]
        await setStorage(ledgerKey, arr)
      }
      setLedgers(arr)
      if (!selectedLedgerId) setSelectedLedgerId(arr[0].id)
    } catch (e) {
      setLedgers([])
    } finally {
      setIsLoading(false)
    }
  }, [getStorage, setStorage, selectedLedgerId])

  const loadEntries = useCallback(async (id) => {
    if (!id) return
    try {
      const list = await getStorage(entriesKey(id))
      setEntries(Array.isArray(list) ? list : [])
    } catch (e) {
      setEntries([])
    }
  }, [getStorage])

  useEffect(() => {
    if (isInApp) loadLedgers()
    else setIsLoading(false)
  }, [isInApp, loadLedgers])

  useEffect(() => {
    if (selectedLedgerId) loadEntries(selectedLedgerId)
  }, [selectedLedgerId, loadEntries])

  const addLedger = async () => {
    if (!newLedgerName.trim()) {
      await showToast('请输入账本名称')
      return
    }
    const l = { id: uuid(), name: newLedgerName.trim(), currency: newLedgerCurrency }
    const next = [...ledgers, l]
    await setStorage(ledgerKey, next)
    setLedgers(next)
    setSelectedLedgerId(l.id)
    setShowLedgerModal(false)
    setNewLedgerName('')
    setNewLedgerCurrency('CNY')
  }

  const saveEntry = async () => {
    if (!selectedLedgerId) return
    if (!entryForm.amount || Number(entryForm.amount) <= 0) {
      await showToast('请输入金额')
      return
    }
    const item = {
      id: uuid(),
      type: entryForm.type,
      amount: Number(entryForm.amount),
      category: entryForm.category || (entryForm.type === 'expense' ? '未分类' : '其他收入'),
      date: entryForm.date || formatDate(new Date()),
      note: entryForm.note || ''
    }
    try {
      await showLoading('保存中...')
      const list = Array.isArray(entries) ? entries.slice() : []
      list.push(item)
      list.sort((a, b) => new Date(a.date) - new Date(b.date))
      await setStorage(entriesKey(selectedLedgerId), list)
      setEntries(list)
      await hideLoading()
      setShowEntryModal(false)
      setEntryForm({ type: 'expense', amount: '', category: '', date: formatDate(new Date()), note: '' })
      await showToast('保存成功')
    } catch (e) {
      await hideLoading()
      await showToast('保存失败: ' + e.message)
    }
  }

  const stats = useMemo(() => {
    const currency = ledgers.find(l => l.id === selectedLedgerId)?.currency || 'CNY'
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const balance = totalIncome - totalExpense
    return { currency, totalExpense, totalIncome, balance }
  }, [entries, selectedLedgerId, ledgers])

  const chartData = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const key = e.category || (e.type === 'expense' ? '未分类' : '其他收入')
      if (!map[key]) map[key] = { name: key, 支出: 0, 收入: 0 }
      if (e.type === 'expense') map[key].支出 += e.amount
      else map[key].收入 += e.amount
    })
    return Object.values(map)
  }, [entries])

  if (!isInApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
            <span className="text-5xl">📒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">记账</h1>
          <p className="text-gray-500 mb-6">请在小习惯 App 内使用</p>
          <a href="https://apps.apple.com/app/id1455083310" 
             className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-400 to-sky-400 text-white rounded-xl font-medium shadow-lg shadow-emerald-200">
            下载小习惯 App
          </a>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <div 
        className="px-6 pt-6 pb-8 relative z-10"
        style={{ background: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📒</span>
              <span className="text-4xl font-bold">记账</span>
            </div>
            <p className="text-white/80 text-sm">多账本与分类统计</p>
          </div>
          <button 
            onClick={() => setShowLedgerModal(true)}
            className="px-3 py-2 rounded-xl bg-white/20 text-white text-sm backdrop-blur-sm"
          >
            新建账本
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          {ledgers.map(l => (
            <button
              key={l.id}
              onClick={() => setSelectedLedgerId(l.id)}
              className={`px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm ${selectedLedgerId === l.id ? 'bg-white/30 text-white' : 'bg-white/20 text-white/80'}`}
            >
              {l.name} · {l.currency}
            </button>
          ))}
        </div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">账本总览</h3>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="支出" value={`${stats.totalExpense.toFixed(2)} ${stats.currency}`} color="text-emerald-600" />
            <StatCard label="收入" value={`${stats.totalIncome.toFixed(2)} ${stats.currency}`} color="text-sky-600" />
            <StatCard label="结余" value={`${stats.balance.toFixed(2)} ${stats.currency}`} color="text-indigo-600" />
          </div>
          <div className="mt-4">
            <button 
              onClick={() => setShowEntryModal(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 text-white font-medium active:scale-95 transition-transform"
            >
              记一笔
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">分类统计</h3>
          {chartData.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">暂无数据，先记一笔吧</div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="支出" fill="#34D399" />
                  <Bar dataKey="收入" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 pb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">明细</h3>
          {entries.length === 0 ? (
            <div className="text-center text-gray-400 text-sm">暂无明细</div>
          ) : (
            <div className="space-y-3">
              {entries.slice().reverse().map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-teal-50/30 border border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{e.category}</div>
                    <div className="text-xs text-gray-500">{e.date}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <div className={`text-sm font-semibold ${e.type === 'expense' ? 'text-emerald-600' : 'text-sky-600'}`}>
                    {e.type === 'expense' ? '-' : '+'}{e.amount.toFixed(2)} {stats.currency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLedgerModal && (
        <Modal title="新建账本" onClose={() => setShowLedgerModal(false)} onConfirm={addLedger} confirmText="创建">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">名称</span>
              <input 
                type="text"
                value={newLedgerName}
                onChange={e => setNewLedgerName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">货币</span>
              <select
                value={newLedgerCurrency}
                onChange={e => setNewLedgerCurrency(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              >
                {['CNY', 'USD', 'EUR', 'JPY', 'HKD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {showEntryModal && (
        <Modal title="记一笔" onClose={() => setShowEntryModal(false)} onConfirm={saveEntry} confirmText="保存">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">类型</span>
              <div className="flex gap-2">
                {[
                  { key: 'expense', label: '支出' },
                  { key: 'income', label: '收入' },
                ].map(i => (
                  <button
                    key={i.key}
                    onClick={() => setEntryForm(f => ({ ...f, type: i.key }))}
                    className={`px-3 py-1.5 rounded-lg text-sm ${entryForm.type === i.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">金额</span>
              <input 
                type="number"
                inputMode="decimal"
                value={entryForm.amount}
                onChange={e => setEntryForm(f => ({ ...f, amount: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">分类</span>
              <input 
                type="text"
                value={entryForm.category}
                onChange={e => setEntryForm(f => ({ ...f, category: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
                placeholder="餐饮、交通、工资等"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">日期</span>
              <input 
                type="date"
                value={entryForm.date}
                onChange={e => setEntryForm(f => ({ ...f, date: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">备注</span>
              <input 
                type="text"
                value={entryForm.note}
                onChange={e => setEntryForm(f => ({ ...f, note: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-0 shadow-sm text-sm"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-teal-50/30 border border-gray-100">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  )
}

function Modal({ title, onClose, onConfirm, confirmText, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 text-sm">取消</button>
          <span className="font-bold text-gray-800">{title}</span>
          <button onClick={onConfirm} className="text-emerald-600 font-medium text-sm">{confirmText}</button>
        </div>
        <div className="p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

