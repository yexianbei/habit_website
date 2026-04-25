import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import {
  deleteKidFinanceAllApi,
  createKidFinanceDepositApi,
  createKidFinanceRecordApi,
  getKidFinanceDashboardApi,
  setKidFinanceTaskCheckApi,
  updateKidFinanceSettingsApi,
  upsertKidFinanceTaskApi,
} from '../../utils/kidFinanceApi'

const MAX_BEHAVIOR_TASKS = 5

function dateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function KidFinanceManagement() {
  const navigate = useNavigate()
  const { isInApp, setTitle, showToast } = useNativeBridge()
  const { deleteHabit, isDeleting } = useHabitDelete({
    name: '培养孩子财商',
    type: 3000,
    beforeDelete: async () => {
      await deleteKidFinanceAllApi()
    },
  })
  const todayStr = useMemo(() => dateKey(new Date()), [])

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [activeModal, setActiveModal] = useState(null)

  const [bank, setBank] = useState(0)
  const [demandBank, setDemandBank] = useState(0)
  const [records, setRecords] = useState([])
  const [tasks, setTasks] = useState([])
  const [taskHistory, setTaskHistory] = useState({})
  const [taskStatsMap, setTaskStatsMap] = useState({})
  const [cycleInfo, setCycleInfo] = useState({ typeName: '周', dateRange: '' })
  const [currentEarnedRewards, setCurrentEarnedRewards] = useState(0)
  const [currentPenalties, setCurrentPenalties] = useState(0)
  const [nextMoney, setNextMoney] = useState(0)
  const [monthlySummary, setMonthlySummary] = useState({ income: 0, expense: 0, net: 0 })
  const [settings, setSettings] = useState({ cycle: 7, baseMoney: 30, theme: 'girl', depositRates: [] })

  const [costName, setCostName] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [incomeName, setIncomeName] = useState('')
  const [incomePrice, setIncomePrice] = useState('')
  const [depositType, setDepositType] = useState('demand')
  const [depositMoney, setDepositMoney] = useState('')
  const [depositDay, setDepositDay] = useState(7)

  const [editTaskId, setEditTaskId] = useState(null)
  const [editTaskName, setEditTaskName] = useState('')
  const [editTaskEffectType, setEditTaskEffectType] = useState('reward')
  const [editTaskAmountPerCheck, setEditTaskAmountPerCheck] = useState(1)
  const [editTaskBonusMode, setEditTaskBonusMode] = useState('streak_days')
  const [editTaskBonusEvery, setEditTaskBonusEvery] = useState(3)
  const [editTaskBonusAmount, setEditTaskBonusAmount] = useState(0)

  const recentRecords = useMemo(() => records.slice(0, 5), [records])

  const loadDashboard = async ({ pageLoading = false } = {}) => {
    try {
      if (pageLoading) setLoading(true)
      const data = await getKidFinanceDashboardApi()
      setBank(Number(data?.bank || 0))
      setDemandBank(Number(data?.demandBank || 0))
      setRecords(Array.isArray(data?.records) ? data.records : [])
      setTasks(Array.isArray(data?.tasks) ? data.tasks : [])
      setTaskHistory(data?.taskHistory || {})
      setTaskStatsMap(data?.taskStatsMap || {})
      setCycleInfo(data?.cycleInfo || { typeName: '周', dateRange: '' })
      setCurrentEarnedRewards(Number(data?.currentEarnedRewards || 0))
      setCurrentPenalties(Number(data?.currentPenalties || 0))
      setNextMoney(Number(data?.nextMoney || 0))
      setMonthlySummary(data?.monthlySummary || { income: 0, expense: 0, net: 0 })
      setSettings((prev) => ({ ...prev, ...(data?.settings || {}) }))
    } catch (error) {
      showToast(error?.message || '加载财商数据失败')
    } finally {
      if (pageLoading) setLoading(false)
    }
  }

  useEffect(() => {
    document.title = '宝贝理财记账本'
    if (isInApp) setTitle('宝贝理财记账本')
    loadDashboard({ pageLoading: true })
  }, [])

  const runAction = async (job, message) => {
    try {
      setActionLoading(true)
      await job()
      await loadDashboard({ pageLoading: false })
    } catch (error) {
      showToast(error?.message || message)
    } finally {
      setActionLoading(false)
    }
  }

  const saveSettingsPatch = async (patch) => {
    await runAction(async () => {
      await updateKidFinanceSettingsApi(patch)
      setSettings((prev) => ({ ...prev, ...patch }))
    }, '保存设置失败')
  }

  const resetTaskEdit = () => {
    setEditTaskId(null)
    setEditTaskName('')
    setEditTaskEffectType('reward')
    setEditTaskAmountPerCheck(1)
    setEditTaskBonusMode('streak_days')
    setEditTaskBonusEvery(3)
    setEditTaskBonusAmount(0)
  }

  const handleSaveTask = async () => {
    if (!editTaskName.trim()) return showToast('请输入任务名称')
    if (!editTaskId && tasks.length >= MAX_BEHAVIOR_TASKS) return showToast(`最多只能配置 ${MAX_BEHAVIOR_TASKS} 个行为`)
    await runAction(async () => {
      await upsertKidFinanceTaskApi({
        id: editTaskId || undefined,
        name: editTaskName.trim(),
        effectType: editTaskEffectType,
        amountPerCheck: Number(editTaskAmountPerCheck || 0),
        bonusMode: editTaskBonusMode,
        bonusEvery: Number(editTaskBonusEvery || 1),
        bonusAmount: Number(editTaskBonusAmount || 0),
      })
      setActiveModal(null)
      setActiveTab('reward')
      resetTaskEdit()
    }, '保存任务失败')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>

  return (
    <div className={`min-h-screen pb-20 ${settings.theme === 'boy' ? 'bg-sky-50' : 'bg-fuchsia-50'} relative`}>
      <div className="max-w-[480px] mx-auto p-5 pb-28">
        <div className="flex justify-between items-center mb-5">
          <div className="text-lg font-bold">现金余额：¥{bank.toFixed(2)}</div>
          <button className="px-3 py-1 text-xs border rounded-full" onClick={() => navigate('/habit/kid-finance/stats')}>详细报表</button>
        </div>

        {activeTab === 'home' && (
          <div className="bg-white rounded-2xl p-5">
            <div className="text-sm text-gray-500">下个{cycleInfo.typeName}零花钱（{cycleInfo.dateRange}）</div>
            <div className="text-3xl font-black mt-2">¥{nextMoney.toFixed(2)}</div>
            <div className="mt-2 text-sm text-gray-500">奖励 +¥{currentEarnedRewards.toFixed(2)} / 扣除 -¥{currentPenalties.toFixed(2)}</div>
            <div className="mt-3 text-sm text-gray-500">活期余额：¥{demandBank.toFixed(2)}</div>
            <div className="mt-4">
              <div className="font-bold mb-2">近期收支</div>
              {recentRecords.length === 0 ? <div className="text-sm text-gray-400">暂无记录</div> : recentRecords.map((r) => (
                <div key={r.id} className="flex justify-between py-1 text-sm">
                  <span>{r.name}</span>
                  <span className={r.type === 'income' ? 'text-amber-500 font-bold' : 'font-bold'}>{r.type === 'income' ? '+' : '-'}¥{Number(r.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reward' && (
          <div className="bg-white rounded-2xl p-5">
            <div className="text-base font-black mb-3">行动换财富 ({tasks.length}/{MAX_BEHAVIOR_TASKS})</div>
            {tasks.map((t) => {
              const checked = (taskHistory[todayStr] || []).includes(t.id)
              const taskStat = taskStatsMap[t.id] || { totalMoney: 0 }
              return (
                <div key={t.id} className="py-2 border-b last:border-b-0" onClick={() => runAction(async () => {
                  await setKidFinanceTaskCheckApi({ taskId: t.id, date: todayStr, completed: !checked })
                }, '勾选失败')}>
                  <div className="font-bold">{checked ? '✅' : '⭕'} {t.name}</div>
                  <div className="text-xs text-gray-500">{t.effectType === 'penalty' ? '惩罚' : '奖励'} 每次¥{Number(t.amountPerCheck || 0).toFixed(2)} | 本期¥{Number(taskStat.totalMoney || 0).toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 grid grid-cols-3 gap-2">
              <button className="border rounded-lg py-2" onClick={() => setActiveModal('cost')}>花一点</button>
              <button className="border rounded-lg py-2" onClick={() => setActiveModal('income')}>赚一笔</button>
              <button className="border rounded-lg py-2" onClick={() => setActiveModal('deposit')}>存钱</button>
            </div>
            <button className="w-full bg-black text-white rounded-xl py-3 disabled:opacity-50" disabled={tasks.length >= MAX_BEHAVIOR_TASKS} onClick={() => { resetTaskEdit(); setActiveModal('task') }}>添加行为</button>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl p-5 text-sm space-y-1">
            <div>本月收入：¥{Number(monthlySummary.income || 0).toFixed(2)}</div>
            <div>本月支出：¥{Number(monthlySummary.expense || 0).toFixed(2)}</div>
            <div className="font-black text-lg mt-2">结余：¥{Number(monthlySummary.net || 0).toFixed(2)}</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span>账期</span>
                <select value={settings.cycle} onChange={(e) => saveSettingsPatch({ cycle: Number(e.target.value) })}>
                  <option value="7">7天</option>
                  <option value="14">14天</option>
                  <option value="30">30天</option>
                </select>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span>基础零花钱</span>
                <input
                  className="w-24 border rounded px-2 py-1 text-center"
                  value={settings.baseMoney}
                  onChange={(e) => setSettings((s) => ({ ...s, baseMoney: e.target.value }))}
                  onBlur={(e) => saveSettingsPatch({ baseMoney: Number(e.target.value || 0) })}
                />
              </div>
            </div>
            <button className="w-full border rounded-xl py-3 text-gray-500" onClick={deleteHabit} disabled={isDeleting}>{isDeleting ? '移除中...' : '清空并移除此模块'}</button>
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-0 h-14 bg-white border-t">
        <div className="max-w-[480px] mx-auto grid grid-cols-5 h-full text-sm">
          <button onClick={() => setActiveTab('home')}>首页</button>
          <button onClick={() => setActiveTab('reward')}>奖惩</button>
          <button onClick={() => setActiveTab('add')}>添加</button>
          <button onClick={() => setActiveTab('stats')}>统计</button>
          <button onClick={() => setActiveTab('settings')}>设置</button>
        </div>
      </div>

      {activeModal === 'cost' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm">
            <input className="w-full border rounded-lg p-2 mb-2" placeholder="用途" value={costName} onChange={(e) => setCostName(e.target.value)} />
            <input className="w-full border rounded-lg p-2 mb-3" type="number" placeholder="金额" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
            <button className="w-full py-2 bg-black text-white rounded-lg" onClick={() => runAction(async () => {
              await createKidFinanceRecordApi({ type: 'expense', name: costName.trim(), price: Number(costPrice) })
              setCostName('')
              setCostPrice('')
              setActiveModal(null)
            }, '记录消费失败')}>保存</button>
          </div>
        </div>
      )}

      {activeModal === 'income' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm">
            <input className="w-full border rounded-lg p-2 mb-2" placeholder="来源" value={incomeName} onChange={(e) => setIncomeName(e.target.value)} />
            <input className="w-full border rounded-lg p-2 mb-3" type="number" placeholder="金额" value={incomePrice} onChange={(e) => setIncomePrice(e.target.value)} />
            <button className="w-full py-2 bg-black text-white rounded-lg" onClick={() => runAction(async () => {
              await createKidFinanceRecordApi({ type: 'income', name: incomeName.trim(), price: Number(incomePrice) })
              setIncomeName('')
              setIncomePrice('')
              setActiveModal(null)
            }, '记录收入失败')}>保存</button>
          </div>
        </div>
      )}

      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm">
            <select className="w-full border rounded-lg p-2 mb-2" value={depositType} onChange={(e) => setDepositType(e.target.value)}>
              <option value="demand">活期</option>
              <option value="fixed">定期</option>
            </select>
            <input className="w-full border rounded-lg p-2 mb-2" type="number" placeholder="金额" value={depositMoney} onChange={(e) => setDepositMoney(e.target.value)} />
            {depositType === 'fixed' && (
              <select className="w-full border rounded-lg p-2 mb-3" value={depositDay} onChange={(e) => setDepositDay(Number(e.target.value))}>
                {(settings.depositRates || []).map((r) => <option key={r.day} value={r.day}>{r.day}天 / {r.rate}%</option>)}
              </select>
            )}
            <button className="w-full py-2 bg-black text-white rounded-lg" onClick={() => runAction(async () => {
              await createKidFinanceDepositApi({ depositType, money: Number(depositMoney), day: Number(depositDay) })
              setDepositMoney('')
              setActiveModal(null)
            }, '存钱失败')}>确认</button>
          </div>
        </div>
      )}

      {activeModal === 'task' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm">
            <input className="w-full border rounded-lg p-2 mb-2" placeholder="任务名" value={editTaskName} onChange={(e) => setEditTaskName(e.target.value)} />
            <select className="w-full border rounded-lg p-2 mb-2" value={editTaskEffectType} onChange={(e) => setEditTaskEffectType(e.target.value)}>
              <option value="reward">奖励</option>
              <option value="penalty">惩罚</option>
            </select>
            <input className="w-full border rounded-lg p-2 mb-2" type="number" placeholder="每次金额" value={editTaskAmountPerCheck} onChange={(e) => setEditTaskAmountPerCheck(e.target.value)} />
            <select className="w-full border rounded-lg p-2 mb-2" value={editTaskBonusMode} onChange={(e) => setEditTaskBonusMode(e.target.value)}>
              <option value="streak_days">连续天数</option>
              <option value="times">连续次数</option>
            </select>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input className="w-full border rounded-lg p-2" type="number" placeholder="每X次/天" value={editTaskBonusEvery} onChange={(e) => setEditTaskBonusEvery(e.target.value)} />
              <input className="w-full border rounded-lg p-2" type="number" placeholder="额外金额" value={editTaskBonusAmount} onChange={(e) => setEditTaskBonusAmount(e.target.value)} />
            </div>
            <button className="w-full py-2 bg-black text-white rounded-lg" onClick={handleSaveTask}>保存任务</button>
          </div>
        </div>
      )}

      {actionLoading && <div className="fixed inset-0 bg-black/20 z-[120] flex items-center justify-center"><div className="bg-white rounded-lg px-4 py-2 text-sm">保存中...</div></div>}
    </div>
  )
}
