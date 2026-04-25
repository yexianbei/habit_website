import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { useHabitDelete } from '../../hooks/useHabitDelete'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
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
const TAB_ITEMS = [
  { key: 'home', label: '首页' },
  { key: 'reward', label: '奖惩' },
  { key: 'add', label: '添加' },
  { key: 'stats', label: '统计' },
  { key: 'settings', label: '设置' },
]

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
  const [loadError, setLoadError] = useState('')
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
      setLoadError('')
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
      const isTimeout = error?.code === 'REQUEST_TIMEOUT' || error?.message === 'REQUEST_TIMEOUT'
      const isTokenError = error?.code === 'MISSING_TOKEN' || error?.message === 'MISSING_TOKEN'
      const message = isTokenError
        ? '登录信息失效，请重新进入页面'
        : isTimeout
          ? '网络较慢，获取财商看板超时，请重试'
          : (error?.message || '加载财商数据失败')
      setLoadError(message)
      showToast(message)
    } finally {
      if (pageLoading) setLoading(false)
    }
  }

  useEffect(() => {
    document.title = '财商培养'
    if (isInApp) setTitle('财商培养')
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

  return (
    <div className={`min-h-screen pb-24 relative ${settings.theme === 'boy' ? 'bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100/60' : 'bg-gradient-to-b from-fuchsia-50 via-slate-50 to-slate-100/60'}`}>
      <div className="max-w-[560px] mx-auto px-4 pt-5 pb-28 sm:px-6">
        {loading && (
          <Card className="p-3 mb-3 border-slate-200 bg-white/90">
            <div className="text-sm text-slate-500 animate-pulse">正在同步财商数据...</div>
          </Card>
        )}
        {loadError && !loading && (
          <Card className="p-3 mb-3 border-rose-200 bg-rose-50/80">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-rose-600">{loadError}</div>
              <Button size="sm" variant="outline" onClick={() => loadDashboard({ pageLoading: true })}>
                重试
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-5 mb-4">
          <div className="text-xs tracking-wide text-slate-500">财商培养</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">现金余额</div>
              <div className="text-2xl sm:text-3xl font-semibold text-slate-900">¥{bank.toFixed(2)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/habit/kid-finance/stats')}>
              详细报表
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-100/80 px-3 py-2 text-slate-600">活期余额：<span className="font-semibold text-slate-900">¥{demandBank.toFixed(2)}</span></div>
            <div className="rounded-xl bg-slate-100/80 px-3 py-2 text-slate-600">下期零花钱：<span className="font-semibold text-slate-900">¥{nextMoney.toFixed(2)}</span></div>
          </div>
        </Card>

        {activeTab === 'home' && (
          <Card className="animate-fadeIn">
            <CardContent className="p-5">
            <div className="text-sm text-slate-500">下个{cycleInfo.typeName}零花钱（{cycleInfo.dateRange}）</div>
            <div className="text-3xl font-semibold text-slate-900 mt-2">¥{nextMoney.toFixed(2)}</div>
            <div className="mt-2 text-sm text-slate-500">
              奖励 <span className="text-emerald-600">+¥{currentEarnedRewards.toFixed(2)}</span> / 扣除 <span className="text-rose-600">-¥{currentPenalties.toFixed(2)}</span>
            </div>
            <div className="mt-3 text-sm text-slate-500">活期余额：¥{demandBank.toFixed(2)}</div>
            <div className="mt-5">
              <div className="font-medium text-slate-900 mb-2">近期收支</div>
              {recentRecords.length === 0 ? <div className="text-sm text-slate-400">暂无记录</div> : recentRecords.map((r) => (
                <div key={r.id} className="flex justify-between py-2 text-sm border-b border-slate-100 last:border-b-0">
                  <span className="text-slate-700">{r.name}</span>
                  <span className={r.type === 'income' ? 'text-emerald-600 font-semibold' : 'text-slate-900 font-semibold'}>{r.type === 'income' ? '+' : '-'}¥{Number(r.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reward' && (
          <Card className="animate-fadeIn">
            <CardContent className="p-5">
            <div className="text-base font-semibold text-slate-900 mb-1">行动换财富 ({tasks.length}/{MAX_BEHAVIOR_TASKS})</div>
            <div className="text-xs text-slate-500 mb-3">完成任务获得奖励，未完成可设置惩罚。</div>
            {tasks.map((t) => {
              const checked = (taskHistory[todayStr] || []).includes(t.id)
              const taskStat = taskStatsMap[t.id] || { totalMoney: 0 }
              return (
                <Button
                  key={t.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 border-b border-slate-100 last:border-b-0 rounded-xl px-2"
                  onClick={() => runAction(async () => {
                    await setKidFinanceTaskCheckApi({ taskId: t.id, date: todayStr, completed: !checked })
                  }, '勾选失败')}
                >
                  <div>
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      <span>{checked ? '✅' : '⭕'} {t.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.effectType === 'penalty' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {t.effectType === 'penalty' ? '惩罚' : '奖励'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">每次¥{Number(t.amountPerCheck || 0).toFixed(2)} | 本期累计¥{Number(taskStat.totalMoney || 0).toFixed(2)}</div>
                  </div>
                </Button>
              )
            })}
            {tasks.length === 0 && <div className="text-sm text-slate-400 py-6 text-center">还没有行为任务，去「添加」页创建第一个任务吧</div>}
            </CardContent>
          </Card>
        )}

        {activeTab === 'add' && (
          <div className="space-y-3 animate-fadeIn">
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" size="lg" onClick={() => setActiveModal('cost')}>花一点</Button>
                <Button variant="outline" size="lg" onClick={() => setActiveModal('income')}>赚一笔</Button>
                <Button variant="outline" size="lg" onClick={() => setActiveModal('deposit')}>存钱</Button>
              </div>
            </Card>
            <Button className="w-full h-11" disabled={tasks.length >= MAX_BEHAVIOR_TASKS} onClick={() => { resetTaskEdit(); setActiveModal('task') }}>添加行为</Button>
          </div>
        )}

        {activeTab === 'stats' && (
          <Card className="animate-fadeIn">
            <CardContent className="p-5 text-sm space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">本月收入</div>
                <div className="text-emerald-600 font-semibold mt-1">¥{Number(monthlySummary.income || 0).toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">本月支出</div>
                <div className="text-rose-500 font-semibold mt-1">¥{Number(monthlySummary.expense || 0).toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">本月结余</div>
                <div className="text-slate-900 font-semibold mt-1">¥{Number(monthlySummary.net || 0).toFixed(2)}</div>
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3 animate-fadeIn">
            <Card>
              <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">账期</span>
                <Select value={String(settings.cycle)} onValueChange={(value) => saveSettingsPatch({ cycle: Number(value) })}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7天</SelectItem>
                    <SelectItem value="14">14天</SelectItem>
                    <SelectItem value="30">30天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-slate-700">基础零花钱</span>
                <Input
                  className="w-28 h-9 text-center"
                  value={settings.baseMoney}
                  onChange={(e) => setSettings((s) => ({ ...s, baseMoney: e.target.value }))}
                  onBlur={(e) => saveSettingsPatch({ baseMoney: Number(e.target.value || 0) })}
                />
              </div>
              </CardContent>
            </Card>
            <Button variant="destructive" className="w-full h-11" onClick={deleteHabit} disabled={isDeleting}>{isDeleting ? '移除中...' : '清空并移除此模块'}</Button>
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-3 pb-3">
        <div className="max-w-[560px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5 rounded-2xl bg-white/95 backdrop-blur shadow-lg h-14 p-1">
              {TAB_ITEMS.map((tab) => <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Dialog open={activeModal === 'cost'} onOpenChange={(open) => setActiveModal(open ? 'cost' : null)}>
        <DialogContent>
          <div className="mb-3">
            <div className="text-base font-semibold text-slate-900">记录一笔支出</div>
            <div className="text-xs text-slate-500 mt-1">例如买文具、零食、玩具。</div>
          </div>
          <Input className="mb-2" placeholder="用途" value={costName} onChange={(e) => setCostName(e.target.value)} />
          <Input className="mb-3" type="number" placeholder="金额" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
          <Button className="w-full" onClick={() => runAction(async () => {
              await createKidFinanceRecordApi({ type: 'expense', name: costName.trim(), price: Number(costPrice) })
              setCostName('')
              setCostPrice('')
              setActiveModal(null)
          }, '记录消费失败')}>保存</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'income'} onOpenChange={(open) => setActiveModal(open ? 'income' : null)}>
        <DialogContent>
          <div className="mb-3">
            <div className="text-base font-semibold text-slate-900">记录一笔收入</div>
            <div className="text-xs text-slate-500 mt-1">例如家务奖励、红包、兼职收入。</div>
          </div>
          <Input className="mb-2" placeholder="来源" value={incomeName} onChange={(e) => setIncomeName(e.target.value)} />
          <Input className="mb-3" type="number" placeholder="金额" value={incomePrice} onChange={(e) => setIncomePrice(e.target.value)} />
          <Button className="w-full" onClick={() => runAction(async () => {
              await createKidFinanceRecordApi({ type: 'income', name: incomeName.trim(), price: Number(incomePrice) })
              setIncomeName('')
              setIncomePrice('')
              setActiveModal(null)
          }, '记录收入失败')}>保存</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'deposit'} onOpenChange={(open) => setActiveModal(open ? 'deposit' : null)}>
        <DialogContent>
          <div className="mb-3">
            <div className="text-base font-semibold text-slate-900">存钱计划</div>
            <div className="text-xs text-slate-500 mt-1">活期可随时取，定期按天数和利率计算。</div>
          </div>
          <Select value={depositType} onValueChange={setDepositType}>
            <SelectTrigger className="mb-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demand">活期</SelectItem>
              <SelectItem value="fixed">定期</SelectItem>
            </SelectContent>
          </Select>
          <Input className="mb-2" type="number" placeholder="金额" value={depositMoney} onChange={(e) => setDepositMoney(e.target.value)} />
            {depositType === 'fixed' && (
              <Select value={String(depositDay)} onValueChange={(value) => setDepositDay(Number(value))}>
                <SelectTrigger className="mb-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(settings.depositRates || []).map((r) => <SelectItem key={r.day} value={String(r.day)}>{r.day}天 / {r.rate}%</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          <Button className="w-full" onClick={() => runAction(async () => {
              await createKidFinanceDepositApi({ depositType, money: Number(depositMoney), day: Number(depositDay) })
              setDepositMoney('')
              setActiveModal(null)
          }, '存钱失败')}>确认</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'task'} onOpenChange={(open) => setActiveModal(open ? 'task' : null)}>
        <DialogContent>
          <div className="mb-3">
            <div className="text-base font-semibold text-slate-900">添加行为任务</div>
            <div className="text-xs text-slate-500 mt-1">最多配置 {MAX_BEHAVIOR_TASKS} 个行为任务。</div>
          </div>
          <Input className="mb-2" placeholder="任务名" value={editTaskName} onChange={(e) => setEditTaskName(e.target.value)} />
          <Select value={editTaskEffectType} onValueChange={setEditTaskEffectType}>
            <SelectTrigger className="mb-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reward">奖励</SelectItem>
              <SelectItem value="penalty">惩罚</SelectItem>
            </SelectContent>
          </Select>
          <Input className="mb-2" type="number" placeholder="每次金额" value={editTaskAmountPerCheck} onChange={(e) => setEditTaskAmountPerCheck(e.target.value)} />
          <Select value={editTaskBonusMode} onValueChange={setEditTaskBonusMode}>
            <SelectTrigger className="mb-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="streak_days">连续天数</SelectItem>
              <SelectItem value="times">连续次数</SelectItem>
            </SelectContent>
          </Select>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Input type="number" placeholder="每X次/天" value={editTaskBonusEvery} onChange={(e) => setEditTaskBonusEvery(e.target.value)} />
              <Input type="number" placeholder="额外金额" value={editTaskBonusAmount} onChange={(e) => setEditTaskBonusAmount(e.target.value)} />
            </div>
          <Button className="w-full" onClick={handleSaveTask}>保存任务</Button>
        </DialogContent>
      </Dialog>

      {actionLoading && <div className="fixed inset-0 bg-slate-900/20 z-[120] flex items-center justify-center"><div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 shadow-sm">保存中...</div></div>}
    </div>
  )
}
