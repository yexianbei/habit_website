import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import { useHabitDelete } from '../../hooks/useHabitDelete'

const LOCAL_STORAGE_KEY = 'kid_finance_data_v2'

// 工具方法：格式化 YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const defaultTasks = [
  { id: 't1', name: '独立完成作业', requiredDays: 5, reward: 5, penalty: 0 },
  { id: 't2', name: '按时早睡 (21:30前)', requiredDays: 7, reward: 10, penalty: 5 },
  { id: 't3', name: '主动做家务', requiredDays: 3, reward: 3, penalty: 0 },
]

export default function KidFinanceManagement() {
  const navigate = useNavigate()
  const { isInApp, setTitle, showToast } = useNativeBridge()
  
  const { deleteHabit, isDeleting } = useHabitDelete({ name: '培养孩子财商', type: 3000 })

  // === 状态定义 ===
  const [bank, setBank] = useState(0) // 现金小金库
  const [demandBank, setDemandBank] = useState(0) // 活期存款
  const [deposits, setDeposits] = useState([]) // 定期存款数组
  const [records, setRecords] = useState([]) // 账单记录
  
  // 任务与打卡体系
  const [tasks, setTasks] = useState(defaultTasks)
  const [taskHistory, setTaskHistory] = useState({}) // { 'YYYY-MM-DD': ['t1', 't3'] }

  const [settings, setSettings] = useState({
    rule1: true,
    rule2: true, 
    rule3: true,
    cycle: 7,
    baseMoney: 30, // 动态基础零花钱
    cycleStartDate: null, // YYYY-MM-DD
    theme: 'girl',
    depositRates: [
      { day: 7, rate: 1 },
      { day: 30, rate: 2 },
      { day: 90, rate: 3.5 },
      { day: 180, rate: 5 },
      { day: 365, rate: 7 }
    ]
  })

  // 弹窗状态
  const [activeModal, setActiveModal] = useState(null) // 'cost' | 'income' | 'deposit' | 'withdraw' | 'set' | 'task_edit' | null
  
  // 辅助变量：表单
  const [costName, setCostName] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [incomeName, setIncomeName] = useState('')
  const [incomePrice, setIncomePrice] = useState('')
  
  // 存款变量
  const [depositType, setDepositType] = useState('demand') // 'demand' | 'fixed'
  const [depositMoney, setDepositMoney] = useState('')
  const [depositDay, setDepositDay] = useState(7)
  const [withdrawMoney, setWithdrawMoney] = useState('')

  // 任务配置临时变量
  const [editTaskName, setEditTaskName] = useState('')
  const [editTaskDays, setEditTaskDays] = useState(1)
  const [editTaskReward, setEditTaskReward] = useState(1)
  const [editTaskPenalty, setEditTaskPenalty] = useState(0)
  const [editTaskId, setEditTaskId] = useState(null)
  
  // 利率配置临时变量
  const [editRateDay, setEditRateDay] = useState('')
  const [editRateValue, setEditRateValue] = useState('')
  const [editRateDayOriginal, setEditRateDayOriginal] = useState(null)

  const initialized = useRef(false)
  const todayStr = useMemo(() => formatDate(new Date()), [])

  // === 生命周期与数据初始化 ===
  useEffect(() => {
    document.title = '宝贝理财记账本'
    if (isInApp) setTitle('宝贝理财记账本')
  }, [isInApp, setTitle])

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (dataStr) {
        const data = JSON.parse(dataStr)
        if (data.bank !== undefined) setBank(data.bank)
        if (data.demandBank !== undefined) setDemandBank(data.demandBank)
        if (data.records) setRecords(data.records)
        if (data.deposits) setDeposits(data.deposits)
        if (data.settings) {
          setSettings(s => ({ ...s, ...data.settings }))
        }
        if (data.tasks) setTasks(data.tasks)
        if (data.taskHistory) setTaskHistory(data.taskHistory)
      } else {
        // 初次配置初始日期
        setSettings(s => ({ ...s, cycleStartDate: todayStr }))
      }
    } catch (e) {
      console.error('Failed to load local data', e)
    }
  }, [todayStr])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }
    const data = { bank, demandBank, records, deposits, settings, tasks, taskHistory }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }, [bank, demandBank, records, deposits, settings, tasks, taskHistory])


  // === 周期时间计算逻辑 ===
  const cycleInfo = useMemo(() => {
    const startStr = settings.cycleStartDate || todayStr
    const startDt = new Date(startStr)
    const endDt = new Date(startDt.getTime() + (settings.cycle - 1) * 86400000)
    
    // 如果今天已经超过了结束日期，理论上应自动发放并进入下一期（此处简化为仅前移显示框）
    const nowDt = new Date(todayStr)
    let finalStart = startDt
    let finalEnd = endDt
    if (nowDt > endDt) {
       // 自动切到包含今天的周期
       const diffDays = Math.floor((nowDt - startDt) / 86400000)
       const passedCycles = Math.floor(diffDays / settings.cycle)
       finalStart = new Date(startDt.getTime() + passedCycles * settings.cycle * 86400000)
       finalEnd = new Date(finalStart.getTime() + (settings.cycle - 1) * 86400000)
       // 注意：真实场景这里应该触发发钱派息逻辑并同步设置，为防止死循环暂由 UI Mock
    }

    const typeName = settings.cycle === 7 ? '周' : settings.cycle === 14 ? '双周' : '月'
    const dateRange = `${String(finalStart.getMonth()+1).padStart(2,'0')}.${String(finalStart.getDate()).padStart(2,'0')} - ${String(finalEnd.getMonth()+1).padStart(2,'0')}.${String(finalEnd.getDate()).padStart(2,'0')}`

    return { typeName, dateRange, spanMin: finalStart.getTime(), spanMax: finalEnd.getTime() }
  }, [settings.cycle, settings.cycleStartDate, todayStr])


  // === 连击天数与任务计算 ===
  const getTaskStreak = (taskId) => {
    let streak = 0
    let checkDate = new Date(todayStr)
    
    // 从今天往回数，看看连续几天
    for (let i = 0; i < settings.cycle; i++) {
       const cdStr = formatDate(checkDate)
       const dayTasks = taskHistory[cdStr] || []
       if (dayTasks.includes(taskId)) {
         streak++
         checkDate = new Date(checkDate.getTime() - 86400000)
       } else {
         break // 凡有一天断了就不叫连续了
       }
    }
    return streak
  }


  // === 业务方法 ===

  // 1. 记账 (消费 / 收入)
  const handleSaveCost = () => {
    const priceNum = parseFloat(costPrice)
    if (!costName.trim() || isNaN(priceNum) || priceNum <= 0) return showToast('请输入有效的支出用途和金额')
    if (priceNum > bank) return showToast('现金小金库余额不足')
    
    const nr = { id: Date.now().toString(), name: costName, price: priceNum, type: 'expense', time: new Date().toLocaleString() }
    setRecords([nr, ...records])
    setBank(p => p - priceNum)
    setCostName(''); setCostPrice('')
    setActiveModal(null)
  }

  const handleSaveIncome = () => {
    const priceNum = parseFloat(incomePrice)
    if (!incomeName.trim() || isNaN(priceNum) || priceNum <= 0) return showToast('请输入有效的收入来源和金额')
    
    const nr = { id: Date.now().toString(), name: incomeName, price: priceNum, type: 'income', time: new Date().toLocaleString() }
    setRecords([nr, ...records])
    setBank(p => p + priceNum)
    setIncomeName(''); setIncomePrice('')
    setActiveModal(null)
  }

  // 2. 存钱 (活期 / 定期)
  const handleSaveDeposit = () => {
    const moneyNum = parseFloat(depositMoney)
    if (isNaN(moneyNum) || moneyNum <= 0 || moneyNum > bank) return showToast('存入金额大于您的现金余额，存入失败')
    
    if (depositType === 'demand') {
      setDemandBank(p => p + moneyNum)
    } else {
      const dayNum = parseInt(depositDay, 10)
      const targetRate = settings.depositRates.find(r => r.day === dayNum)?.rate || 0
      setDeposits([{ 
        id: Date.now().toString(), money: moneyNum, day: dayNum, rate: targetRate, time: new Date().getTime() 
      }, ...deposits])
    }
    setBank(p => p - moneyNum)
    setDepositMoney('')
    setActiveModal(null)
  }

  // 3. 取出活期
  const handleWithdraw = () => {
    const moneyNum = parseFloat(withdrawMoney)
    if (isNaN(moneyNum) || moneyNum <= 0 || moneyNum > demandBank) return showToast('没那么多钱可以取哦')
    setDemandBank(p => p - moneyNum)
    setBank(p => p + moneyNum)
    setWithdrawMoney('')
    setActiveModal(null)
    showToast(`成功取出 ¥${moneyNum} 到可用现金`)
  }

  // 4. 今日打卡切换
  const toggleTaskCheck = (taskId) => {
    setTaskHistory(prev => {
      const dayList = prev[todayStr] ? [...prev[todayStr]] : []
      const has = dayList.includes(taskId)
      let nextList = has ? dayList.filter(id => id !== taskId) : [...dayList, taskId]
      return { ...prev, [todayStr]: nextList }
    })
  }

  // 5. 新增/删除配置任务
  const handleSaveCustomTask = () => {
    if (!editTaskName.trim()) return showToast('请输入任务名称')
    if (editTaskDays > settings.cycle) return showToast(`连击要求不能超过当前设定的账期（${settings.cycle}天）哦`)
    if (editTaskDays <= 0) return showToast('连续天数必须 > 0')

    const newT = {
      id: editTaskId || `ct_${Date.now()}`,
      name: editTaskName.trim(),
      requiredDays: parseInt(editTaskDays, 10),
      reward: parseFloat(editTaskReward) || 0,
      penalty: parseFloat(editTaskPenalty) || 0
    }
    
    if (editTaskId) {
      setTasks(tasks.map(t => t.id === editTaskId ? newT : t))
    } else {
      setTasks([...tasks, newT])
    }
    
    setEditTaskName('')
    setEditTaskDays(1)
    setEditTaskReward(1)
    setEditTaskPenalty(0)
    setEditTaskId(null)
    setActiveModal('set') // 返回设置面板
  }

  const removeCustomTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  // 6. 配置更新
  const updateSetting = (key, val) => {
    if (key === 'cycle' && val < Math.max(...tasks.map(t=>t.requiredDays))) {
       return showToast(`不能缩短周期！您有要求连击 ${Math.max(...tasks.map(t=>t.requiredDays))} 天的任务存在，请先修改任务`)
    }
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  // 7. 新增/删除定期产品
  const handleSaveCustomRate = () => {
    const d = parseInt(editRateDay, 10)
    const r = parseFloat(editRateValue)
    if (isNaN(d) || d <= 0) return showToast('请输入正确的锁定天数')
    if (isNaN(r) || r < 0) return showToast('请输入正确的收益率')
    
    const otherRates = (settings.depositRates || []).filter(rate => rate.day !== editRateDayOriginal)
    if (otherRates.some(rate => rate.day === d)) return showToast('该期限已经存在，请不要重复设置哦')

    const newRates = [...otherRates, { day: d, rate: r }].sort((a, b) => a.day - b.day)
    setSettings(prev => ({ ...prev, depositRates: newRates }))
    setEditRateDay('')
    setEditRateValue('')
    setEditRateDayOriginal(null)
    setActiveModal('set')
  }

  const removeCustomRate = (dayToRemove) => {
    setSettings(prev => ({ ...prev, depositRates: (prev.depositRates || []).filter(r => r.day !== dayToRemove) }))
  }


  // === 派生数据 ===
  // 我们计算动态奖励：只要当前天数的连击刚好等于 requiredDays 甚至触发超额（假设计算总达标），发放 mock 预览。
  // 更真实的场景是在发工资日统一结算任务达标次数。我们这里做面板展示。
  const currentEarnedRewards = tasks.reduce((acc, t) => {
     return getTaskStreak(t.id) >= t.requiredDays ? acc + t.reward : acc
  }, 0)
  
  const currentPenalties = tasks.reduce((acc, t) => {
     return getTaskStreak(t.id) < t.requiredDays ? acc + (t.penalty || 0) : acc
  }, 0)
  
  const nextMoney = Math.max(0, parseFloat(settings.baseMoney) + currentEarnedRewards - currentPenalties)


  return (
    <div className={`kf-wrapper theme-${settings.theme} min-h-screen pb-20 relative font-sans text-gray-800 transition-colors duration-300`}>
      {/* 嵌入局部样式表 */}
      <style>{`
        .kf-wrapper {
          --main: #9476ff;
          --second: #ff88d8;
          --card: #fff;
          --light: #f0e5ff;
          --danger: #ff528a;
          --success: #38db99;
          --bg: #fdf6fd;
          background: var(--bg);
        }
        .kf-wrapper.theme-boy {
          --main: #4daaff;
          --second: #3a8cff;
          --light: #e1f5ff;
          --danger: #ff5e5e;
          --success: #32c286;
          --bg: #f2faff;
        }
        .kf-switch {
          width: 44px; height: 24px; background: #ddd; border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s;
        }
        .kf-switch::after {
          content: ''; width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.2s;
        }
        .kf-switch.on { background: var(--main); }
        .kf-switch.on::after { left: 23px; }
        .kf-modal { display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 100; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.2s; backdrop-filter: blur(2px); }
        .kf-modal.show { opacity: 1; pointer-events: auto; }
        .kf-modal-box { background: #fff; border-radius: 20px; padding: 24px; width: 85%; max-width: 360px; max-height: 80vh; overflow-y: auto; transform: scale(0.95); transition: 0.2s; box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .kf-modal.show .kf-modal-box { transform: scale(1); }
        .kf-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ddd; margin-bottom: 12px; outline: none; transition: 0.2s; }
        .kf-input:focus { border-color: var(--main); background: #fdfdff; }
      `}</style>
      
      <div className="max-w-[480px] mx-auto p-5">
        
        {/* === Header区 === */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-[18px] font-bold text-gray-800 flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--main)] to-[var(--second)] flex items-center justify-center text-white shadow-sm text-sm">💰</div>
            现金余额：<span style={{ color: 'var(--main)' }}>¥{bank}</span>
          </div>
          <div className="flex gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-sm active:scale-90 transition-transform" onClick={() => navigate('/habit/kid-finance/stats')}>
              <span className="text-lg">📊</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-sm active:scale-90 transition-transform" onClick={() => setActiveModal('set')}>
              <span className="text-lg">⚙️</span>
            </div>
          </div>
        </div>

        {/* === 发薪大卡片 === */}
        <div className="px-6 py-6 rounded-[28px] mb-5 text-white shadow-lg overflow-hidden relative" style={{ background: 'linear-gradient(135deg, var(--main), var(--second))' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none transform translate-x-10 -translate-y-10" />
          
          <div className="opacity-90 text-[13px] font-medium flex items-center gap-1 mb-1 tracking-wide">
             下个{cycleInfo.typeName}零花钱 <span className="opacity-75">({cycleInfo.dateRange})</span>
          </div>
          <div className="text-[44px] font-black my-1 leading-none tracking-tight flex items-baseline gap-1">
            <span className="text-[20px] opacity-80 font-bold">¥</span>{nextMoney}
          </div>
          
          <div className="flex justify-between text-[13px] mt-5 pt-4 border-t border-white/20 font-semibold opacity-90">
            <div>基础零花钱：¥{settings.baseMoney}</div>
            <div className="flex gap-3">
              {currentEarnedRewards > 0 && <div>已获奖励 <span className="text-[#f7ffaf]">+ ¥{currentEarnedRewards}</span></div>}
              {currentPenalties > 0 && <div>未达标扣除 <span className="text-[#ffdfdf]">- ¥{currentPenalties}</span></div>}
            </div>
          </div>
        </div>

        {/* === 快捷操作舱 === */}
        <div className="flex gap-2.5 mt-2 mb-6">
          <button className="flex-1 py-3 bg-white rounded-2xl shadow-sm text-[14px] font-bold text-gray-700 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => setActiveModal('cost')}>
            <span className="text-[20px]">🛒</span> 花一点
          </button>
          <button className="flex-1 py-3 bg-[#fff9eb] border border-[#ffecca] rounded-2xl shadow-sm text-[14px] font-bold text-[#d28a00] flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => setActiveModal('income')}>
            <span className="text-[20px]">🧧</span> 赚一笔
          </button>
          <button className="flex-1 py-3 bg-white rounded-2xl shadow-sm text-[14px] font-bold text-gray-700 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => setActiveModal('deposit')}>
            <span className="text-[20px]">🏦</span> 去存钱
          </button>
        </div>

        {/* === 独立任务打卡区 === */}
        <div className="bg-white rounded-[24px] p-5 mb-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="text-[16px] font-black mb-4 flex items-center gap-1.5 text-gray-800 tracking-wide">
            🏆 行动换财富 ({tasks.length})
          </div>
          
          {tasks.length === 0 ? (
             <div className="text-gray-400 text-sm py-4 text-center">家长还没布置任务哦</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t, idx) => {
                const todayChecked = (taskHistory[todayStr] || []).includes(t.id)
                const streak = getTaskStreak(t.id)
                const isCompletedCycle = streak >= t.requiredDays
                return (
                  <div key={t.id} className="flex justify-between items-center py-2.5 group" onClick={() => toggleTaskCheck(t.id)}>
                    <div className="flex-1 flex gap-3">
                      <div className={`w-[26px] h-[26px] rounded-full border-[2px] transition-colors flex items-center justify-center flex-shrink-0 ${todayChecked ? 'bg-[var(--main)] border-[var(--main)]' : 'bg-gray-50 border-gray-200'}`}>
                         {todayChecked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <div className={`text-[14.5px] font-bold leading-tight ${todayChecked ? 'text-[var(--main)]' : 'text-gray-800'}`}>{t.name}</div>
                        <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                          <span className={`${isCompletedCycle ? 'text-[var(--main)]' : ''}`}>已连击 {streak}/{t.requiredDays} 天</span>
                          <span>|</span>
                          <span className={`${isCompletedCycle ? 'text-[#f5a623]' : ''}`}>达标奖励 ¥{t.reward}</span>
                          {(t.penalty > 0) && (
                            <>
                               <span>|</span>
                               <span className={`${!isCompletedCycle ? 'text-[var(--danger)]' : ''}`}>未达标扣除 ¥{t.penalty}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* === 我的理财资产库 === */}
        <div className="bg-white rounded-[24px] p-5 mb-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="text-[16px] font-black mb-4 flex items-center gap-1.5 text-gray-800 tracking-wide">
            💼 储蓄账户
          </div>
          
          {/* 活期区块 */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 mb-3 border border-gray-100 flex items-center justify-between">
             <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-[#e5f7ed] flex items-center justify-center text-[18px]">🌊</div>
                <div>
                   <div className="text-[14px] font-bold text-gray-800">活期余额</div>
                   <div className="text-[11px] text-gray-400 mt-0.5">年利率 1.5% · 随取随用</div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-[16px] font-black text-[#2ecca3]">¥{demandBank}</div>
                {demandBank > 0 && <button className="mt-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] text-gray-600 font-bold active:bg-gray-50" onClick={() => setActiveModal('withdraw')}>取出现金</button>}
             </div>
          </div>

          {/* 定期明细 */}
          {deposits.length > 0 && (
             <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                <div className="text-[12px] font-bold text-gray-500 mb-2">🔒 定期存单 ({deposits.length}笔)</div>
                {deposits.map(d => (
                  <div key={d.id} className="p-3 rounded-xl text-[13px] flex items-center justify-between bg-[var(--light)] text-gray-700">
                    <div>
                      <span className="font-bold text-[var(--main)]">{d.day}天</span>
                      <span className="mx-2 opacity-30 text-gray-900">|</span>
                      <span className="text-[11px] text-gray-500 font-semibold">收益率 {d.rate}%</span>
                    </div>
                    <div className="font-bold text-[14px]">¥{d.money}</div>
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* === 近期账单流水 === */}
        <div className="bg-white rounded-[24px] p-5 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="text-[16px] font-black mb-4 flex items-center gap-1.5 text-gray-800 tracking-wide">
            💸 近期收支明细
          </div>
          {records.length === 0 ? (
            <div className="text-gray-300 text-sm text-center py-6">这里干干净净，没有账单</div>
          ) : (
            <div className="space-y-1">
              {records.slice(0, 5).map(r => ( // 仅展示最新5笔
                <div key={r.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] ${r.type === 'income' ? 'bg-[#fff4e5]' : 'bg-gray-50'}`}>
                      {r.type === 'income' ? '🧧' : '🛒'}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-gray-800">{r.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{r.time.split(' ')[0]}</div>
                    </div>
                  </div>
                  <div className={`font-black text-[16px] ${r.type === 'income' ? 'text-[#ffb800]' : 'text-gray-800'}`}>
                    {r.type === 'income' ? '+' : '-'}¥{r.price}
                  </div>
                </div>
              ))}
              {records.length > 5 && <div className="text-center text-[12px] text-gray-400 font-medium pt-3 cursor-pointer" onClick={() => navigate('/habit/kid-finance/stats')}>查看完整账单与报表 ➔</div>}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
            <button onClick={deleteHabit} disabled={isDeleting} className="px-5 py-2 rounded-full text-[12px] font-bold text-gray-400 active:bg-gray-100 transition-colors">
              {isDeleting ? '移除中...' : '清空并移除此模块'}
            </button>
        </div>
        
      </div>

      {/* ================= 强大的弹窗层 ================= */}

      {/* 1. 记单: 消费 */}
      <div className={`kf-modal ${activeModal === 'cost' ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal(null) }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-5 text-gray-800">登记一笔消费🛒</div>
          <div className="text-[12px] text-gray-500 mb-2 font-bold">买了什么？</div>
          <input className="kf-input bg-gray-50 border-transparent focus:bg-white" placeholder="比如：冰激凌 / 游戏卡" value={costName} onChange={e => setCostName(e.target.value)} />
          <div className="text-[12px] text-gray-500 mt-2 mb-2 font-bold">花了多少钱？</div>
          <input className="kf-input bg-gray-50 border-transparent focus:bg-white text-[20px] font-bold text-gray-900" placeholder="0" type="number" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
          <button className="w-full py-3.5 bg-gray-900 text-white rounded-[14px] mt-4 font-bold active:scale-[0.98] transition-transform shadow-md" onClick={handleSaveCost}>扣除现金记录</button>
        </div>
      </div>

      {/* 2. 记单: 赚到 */}
      <div className={`kf-modal ${activeModal === 'income' ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal(null) }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-5 text-gray-800">录入辛苦钱🧧</div>
          <div className="text-[12px] text-gray-500 mb-2 font-bold">为什么得到这笔钱？</div>
          <input className="kf-input bg-[#fff9eb] border-transparent focus:bg-white" placeholder="比如：洗碗 / 考试好成绩" value={incomeName} onChange={e => setIncomeName(e.target.value)} />
          <div className="text-[12px] text-gray-500 mt-2 mb-2 font-bold">一共赚了多少？</div>
          <input className="kf-input bg-[#fff9eb] border-transparent focus:bg-white text-[20px] font-bold text-[#d28a00]" placeholder="0" type="number" min="0" value={incomePrice} onChange={e => setIncomePrice(e.target.value)} />
          <button className="w-full py-3.5 bg-[#ffb800] text-white rounded-[14px] mt-4 font-bold active:scale-[0.98] transition-transform shadow-md" onClick={handleSaveIncome}>确认为额外收入</button>
        </div>
      </div>

      {/* 3. 提取活期 */}
      <div className={`kf-modal ${activeModal === 'withdraw' ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal(null) }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-5 text-gray-800">提取活期资金🌊</div>
          <div className="text-[12px] text-gray-500 mb-2 font-bold flex justify-between">
             <span>金额</span ><span className="text-[var(--success)]">最大可取: {demandBank}</span>
          </div>
          <input className="kf-input bg-[#f2fdf7] border-transparent focus:bg-white text-[20px] font-bold text-gray-800" placeholder="0" type="number" min="0" max={demandBank} value={withdrawMoney} onChange={e => setWithdrawMoney(e.target.value)} />
          <button className="w-full py-3.5 bg-[#2ecca3] text-white rounded-[14px] mt-4 font-bold active:scale-[0.98] transition-transform shadow-md" onClick={handleWithdraw}>取出到钱包</button>
        </div>
      </div>

      {/* 4. 去存钱包含活期/定期 Segment */}
      <div className={`kf-modal ${activeModal === 'deposit' ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal(null) }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-4 text-gray-800">去银行存钱🏦</div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
            <button className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${depositType === 'demand' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hovr:text-gray-700'}`} onClick={() => setDepositType('demand')}>活期</button>
            <button className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all ${depositType === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setDepositType('fixed')}>定期死锁</button>
          </div>

          <div className="text-[12px] text-gray-500 mb-2 font-bold">存入金额 <span className="font-normal text-xs ml-1">(钱包当前: ¥{bank})</span></div>
          <input className="kf-input bg-gray-50 border-transparent text-[20px] font-bold" placeholder="0" type="number" min="0" value={depositMoney} onChange={e => setDepositMoney(e.target.value)} />
          
          {depositType === 'fixed' ? (
            <>
              <div className="text-[12px] text-gray-500 mt-2 mb-2 font-bold">选择锁定期</div>
              {(settings.depositRates && settings.depositRates.length > 0) ? (
                <select className="w-full p-3 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 outline-none mb-2" value={depositDay} onChange={e => setDepositDay(Number(e.target.value))}>
                  {settings.depositRates.map(r => (
                     <option key={r.day} value={r.day}>定期 {r.day}天 · 预估年化 {r.rate}%</option>
                  ))}
                </select>
              ) : (
                <div className="bg-[#fff0f4] text-[var(--danger)] text-[12px] p-3 rounded-xl mb-3 font-bold">目前没有可用的定期产品，请家长先去⚙️设置中添加。</div>
              )}
            </>
          ) : (
             <div className="bg-[#e5f7ed] text-[#2ecca3] text-[12px] p-3 rounded-xl mb-3 font-bold flex items-center gap-2">
                <span>💡</span> 活期存款随存随取，每日计算 0.1% 的极低收益。
             </div>
          )}
          
          <button className="w-full py-3.5 bg-[var(--main)] text-white rounded-[14px] mt-4 font-bold active:scale-[0.98] transition-transform shadow-md" onClick={handleSaveDeposit}>确认存入</button>
        </div>
      </div>

      {/* 5. 聚合家长设置面板 */}
      <div className={`kf-modal ${activeModal === 'set' ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal(null) }}>
        <div className="kf-modal-box !p-0 overflow-hidden">
          
          <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
            <span className="font-black text-[16px] text-gray-800">👑 家长管理后台</span>
            <span className="w-7 h-7 bg-white rounded-full flex justify-center items-center text-gray-400 font-bold cursor-pointer shadow-sm text-xs" onClick={() => setActiveModal(null)}>X</span>
          </div>
          
          <div className="p-5 space-y-7 pb-8">
            {/* 基础款项设定 */}
            <div>
              <div className="text-[14px] font-black text-gray-800 mb-3 flex items-center gap-1.5"><span className="text-[var(--main)]">▍</span>基础零花钱设置</div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
                 
                 <div className="flex justify-between items-center">
                   <span className="text-[13px] font-bold text-gray-600">账期维度</span>
                   <select className="bg-gray-50 border-none outline-none font-bold text-[13px] text-gray-800 p-1.5 rounded-lg" value={settings.cycle} onChange={e => updateSetting('cycle', Number(e.target.value))}>
                      <option value="7">按周 (7天)</option>
                      <option value="14">按双周 (14天)</option>
                      <option value="30">按月 (30天)</option>
                   </select>
                 </div>

                 <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                   <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-600">每期固定基础零花钱</span>
                      <span className="text-[10px] text-gray-400">保障底线金额，每期无条件发放</span>
                   </div>
                   <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg px-2">
                     <span className="text-gray-400 font-medium text-[12px]">¥</span>
                     <input className="w-12 bg-transparent outline-none font-bold text-[14px] text-gray-800 text-center" type="number" value={settings.baseMoney} onChange={e => updateSetting('baseMoney', Number(e.target.value))} />
                   </div>
                 </div>

              </div>
            </div>

            {/* 待办与规则管理 */}
            <div>
              <div className="text-[14px] font-black text-gray-800 mb-3 flex items-center gap-1.5"><span className="text-[#ffb800]">▍</span>连击任务规则配置</div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-3">
                 {tasks.map(t => (
                   <div key={t.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <div className="flex-1">
                        <div className="text-[13px] font-bold text-gray-800 mb-0.5">{t.name}</div>
                        <div className="text-[10px] text-gray-500">
                          连击要求: {t.requiredDays} 天 | 奖: ¥{t.reward} {t.penalty > 0 ? `| 惩: -¥${t.penalty}` : ''}
                        </div>
                     </div>
                     <div className="flex gap-1.5 items-center">
                       <span className="text-gray-500 font-medium text-[12px] p-2 bg-white rounded-lg cursor-pointer active:scale-95 shadow-sm border border-gray-100" onClick={() => {
                          setEditTaskId(t.id)
                          setEditTaskName(t.name)
                          setEditTaskDays(t.requiredDays)
                          setEditTaskReward(t.reward)
                          setEditTaskPenalty(t.penalty || 0)
                          setActiveModal('task_edit')
                       }}>✎ 编辑</span>
                       <span className="text-red-400 font-medium text-[12px] p-2 bg-red-50 rounded-lg cursor-pointer active:scale-95" onClick={() => removeCustomTask(t.id)}>⊗ 移除</span>
                     </div>
                   </div>
                 ))}
                 
                 <div className="pt-2">
                    <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 font-bold text-[13px] hover:border-gray-300 hover:text-gray-700 transition-colors" onClick={() => {
                       setEditTaskId(null)
                       setEditTaskName('')
                       setEditTaskDays(1)
                       setEditTaskReward(1)
                       setEditTaskPenalty(0)
                       setActiveModal('task_edit')
                    }}>+ 添加新常规任务</button>
                 </div>
              </div>
            </div>

            {/* 定期利率管理 */}
            <div>
              <div className="text-[14px] font-black text-gray-800 mb-3 flex items-center gap-1.5"><span className="text-[#ff528a]">▍</span>定期死锁理财产品配置</div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-3">
                 {(settings.depositRates || []).map(r => (
                   <div key={r.day} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                     <div className="flex-1 flex gap-3 text-[13px] font-bold text-gray-800 items-baseline">
                        <span className="w-10">锁定 {r.day} 天</span>
                        <span className="text-[11px] text-gray-400 font-medium">|</span>
                        <span className="text-[#ff528a] font-black">{r.rate}% 收益</span>
                     </div>
                     <div className="flex gap-1.5 items-center">
                       <span className="text-gray-500 text-[16px] px-2 cursor-pointer active:scale-90" onClick={() => {
                          setEditRateDayOriginal(r.day)
                          setEditRateDay(r.day)
                          setEditRateValue(r.rate)
                          setActiveModal('rate_edit')
                       }}>✎</span>
                       <span className="text-red-400 text-[16px] px-2 cursor-pointer active:scale-90" onClick={() => removeCustomRate(r.day)}>⊗</span>
                     </div>
                   </div>
                 ))}
                 
                 <div className="pt-2">
                    <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 font-bold text-[13px] hover:border-gray-300 hover:text-gray-700 transition-colors" onClick={() => {
                       setEditRateDayOriginal(null)
                       setEditRateDay('')
                       setEditRateValue('')
                       setActiveModal('rate_edit')
                    }}>+ 发布新储蓄产品</button>
                 </div>
              </div>
            </div>

            {/* 个性化 */}
            <div>
              <div className="text-[14px] font-black text-gray-800 mb-2 flex items-center gap-1.5"><span className="text-[#38db99]">▍</span>样式主题</div>
              <div className="flex flex-wrap gap-2">
                {[ { val: 'girl', label: '👧 梦幻公主' }, { val: 'boy', label: '👦 蓝色星球' } ].map(t => (
                  <button 
                    key={t.val}
                    onClick={() => updateSetting('theme', t.val)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border outline-none ${settings.theme === t.val ? 'bg-gray-900 text-white border-transparent shadow-sm' : 'border-gray-200 text-gray-600 bg-white'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 6. 单独新增/编辑任务的子面板 */}
      <div className={`kf-modal ${activeModal === 'task_edit' ? 'show' : ''}`} style={{ zIndex: 110 }} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal('set') }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-5 text-gray-800">{editTaskId ? '编辑任务✍️' : '定制新任务✍️'}</div>
          
          <div className="text-[12px] text-gray-500 mb-1.5 font-bold">任务名称</div>
          <input className="kf-input bg-gray-50 border-transparent font-bold text-[14px]" placeholder="例如：背诵一首古诗" value={editTaskName} onChange={e => setEditTaskName(e.target.value)} />
          
          <div className="flex gap-2.5">
             <div className="flex-[1.5]">
               <div className="text-[12px] text-gray-500 mb-1.5 font-bold">需连打卡(天) <span className="font-normal opacity-70">≤ {settings.cycle}</span></div>
               <input className="kf-input bg-gray-50 border-transparent font-bold text-[16px] text-center text-[var(--main)]" type="number" min="1" max={settings.cycle} value={editTaskDays} onChange={e => setEditTaskDays(e.target.value)} />
             </div>
             <div className="flex-1">
               <div className="text-[12px] text-gray-500 mb-1.5 font-bold">达标奖励</div>
               <input className="kf-input bg-[#fff9eb] border-transparent font-bold text-[16px] text-center text-[#ffb800]" type="number" min="0" value={editTaskReward} onChange={e => setEditTaskReward(e.target.value)} />
             </div>
             <div className="flex-1">
               <div className="text-[12px] text-gray-500 mb-1.5 font-bold">失败扣除</div>
               <input className="kf-input bg-[#fff0f4] border-transparent font-bold text-[16px] text-center text-[var(--danger)]" type="number" min="0" value={editTaskPenalty} onChange={e => setEditTaskPenalty(e.target.value)} />
             </div>
          </div>
          
          <div className="flex gap-2.5 mt-4">
             <button className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-[14px] font-bold active:bg-gray-200" onClick={() => setActiveModal('set')}>取消</button>
             <button className="flex-1 py-3 bg-[var(--main)] text-white rounded-[14px] font-bold shadow-md active:bg-opacity-80" onClick={handleSaveCustomTask}>{editTaskId ? '保存修改' : '添加入库'}</button>
          </div>
        </div>
      </div>

      {/* 7. 新增/编辑利率子面板 */}
      <div className={`kf-modal ${activeModal === 'rate_edit' ? 'show' : ''}`} style={{ zIndex: 110 }} onClick={(e) => { if (e.target.classList.contains('kf-modal')) setActiveModal('set') }}>
        <div className="kf-modal-box">
          <div className="text-center font-black text-[18px] mb-5 text-[#ff528a]">{editRateDayOriginal ? '修改理财产品🏦' : '定制新的理财产品🏦'}</div>
          
          <div className="flex gap-2.5">
             <div className="flex-[1.5]">
               <div className="text-[12px] text-gray-500 mb-1.5 font-bold">产品锁定天数 <span className="text-gray-400 font-normal">天</span></div>
               <input className="kf-input bg-gray-50 border-transparent font-bold text-[16px] text-center text-gray-900" type="number" min="1" placeholder="比如: 90" value={editRateDay} onChange={e => setEditRateDay(e.target.value)} />
             </div>
             <div className="flex-[1.5]">
               <div className="text-[12px] text-gray-500 mb-1.5 font-bold">对应收益率 <span className="text-gray-400 font-normal">%</span></div>
               <input className="kf-input bg-[#fff0f4] border-transparent font-bold text-[16px] text-center text-[#ff528a]" type="number" min="0" step="0.1" placeholder="比如: 3.5" value={editRateValue} onChange={e => setEditRateValue(e.target.value)} />
             </div>
          </div>
          
          <div className="flex gap-2.5 mt-4">
             <button className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-[14px] font-bold active:bg-gray-200" onClick={() => setActiveModal('set')}>取消返回</button>
             <button className="flex-1 py-3 bg-[#ff528a] text-white rounded-[14px] font-bold shadow-md active:bg-opacity-80" onClick={handleSaveCustomRate}>{editRateDayOriginal ? '保存修改' : '立刻发布产品'}</button>
          </div>
        </div>
      </div>

    </div>
  )
}
