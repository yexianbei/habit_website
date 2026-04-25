import { useState, useEffect, useMemo } from 'react'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { getKidFinanceDashboardApi } from '../../utils/kidFinanceApi'

const DAYS_OF_WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function KidFinanceStats() {
  const { isInApp, setTitle, showToast } = useNativeBridge()

  // 全局状态
  const [currentDate, setCurrentDate] = useState(new Date()) // 用于月选择
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' | 'report'
  const [calTab, setCalTab] = useState('expense') // 'expense' | 'income' | 'net' | 'balance'
  
  // 数据
  const [records, setRecords] = useState([])
  const [bank, setBank] = useState(0)

  useEffect(() => {
    document.title = '报表统计'
    if (isInApp) setTitle('报表统计')

    getKidFinanceDashboardApi()
      .then((data) => {
        const allR = Array.isArray(data?.records) ? data.records : []
        const processed = allR.map((r) => {
          const sourceDate = r.occurredAt ? new Date(Number(r.occurredAt) * 1000) : new Date(String(r.time || '').replace(/年|月/g, '-').replace(/日/g, ''))
          const validDate = Number.isNaN(sourceDate.getTime()) ? new Date() : sourceDate
          return {
            ...r,
            type: r.type || 'expense',
            timestamp: validDate.getTime(),
            dateObj: validDate,
            formatDate: `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, '0')}-${String(validDate.getDate()).padStart(2, '0')}`,
          }
        })
        setRecords(processed)
        setBank(Number(data?.bank || 0))
      })
      .catch((e) => {
        console.error(e)
        showToast('加载统计数据失败')
      })
  }, [isInApp, setTitle, showToast])

  // 本月数据筛选
  const maxDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}`
  
  const monthlyRecords = useMemo(() => {
    return records.filter(r => r.formatDate.startsWith(currentMonthPrefix))
  }, [records, currentMonthPrefix])

  // 根据每一天聚合数据
  const dailyDataMap = useMemo(() => {
    const map = {}
    for (let i = 1; i <= maxDaysInMonth; i++) {
      const key = `${currentMonthPrefix}-${String(i).padStart(2, '0')}`
      map[key] = { expense: 0, income: 0, net: 0, balance: 0 }
    }
    
    // 逆向累推每日结余：(非常简化的实现方式：从今天实时结余逆推)
    // 实际上真正的记账日结不应基于逆推，此处仅通过聚合收支处理简化逻辑
    // 为了不复杂化且符合小学生理财，当前【结余】定义为该月的净流动结余。
    // 我们按照从小到大先排序一下时间
    const sorted = [...monthlyRecords].sort((a, b) => a.timestamp - b.timestamp)
    
    sorted.forEach(r => {
      const key = r.formatDate
      if (map[key]) {
        if (r.type === 'expense') {
          map[key].expense += r.price
        } else {
           map[key].income += r.price
        }
        map[key].net = map[key].income - map[key].expense
      }
    })
    
    // 更新累计结余
    let curBal = 0
    Object.keys(map).sort().forEach(k => {
      curBal += map[k].net
      map[k].balance = curBal
    })
    
    return map
  }, [monthlyRecords, maxDaysInMonth, currentMonthPrefix, bank])

  // 求出本月最大极值用于颜色深度映射
  const maxValues = useMemo(() => {
    let mE = 0, mI = 0, mN = 0, mB = 0;
    Object.values(dailyDataMap).forEach(d => {
       if (d.expense > mE) mE = d.expense
       if (d.income > mI) mI = d.income
       if (Math.abs(d.net) > mN) mN = Math.abs(d.net)
       if (d.balance > mB) mB = d.balance
    })
    return { expense: mE, income: mI, net: mN, balance: mB }
  }, [dailyDataMap])

  // 日历生成：处理1号前补空位
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    // JS里周日是0。我们将展示周一为首。
    const prefixBlanks = firstDay === 0 ? 6 : firstDay - 1
    
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    const cells = []
    
    // 补齐上月底
    for (let i = prefixBlanks; i > 0; i--) {
      cells.push({ day: prevMonthDays - i + 1, isCurrentMonth: false })
    }
    
    // 放入本月
    for (let i = 1; i <= maxDaysInMonth; i++) {
      const key = `${currentMonthPrefix}-${String(i).padStart(2, '0')}`
      cells.push({ day: i, isCurrentMonth: true, dt: dailyDataMap[key] })
    }
    
    // 补齐下月头
    const suffixBlanks = 42 - cells.length
    for (let i = 1; i <= suffixBlanks; i++) {
        cells.push({ day: i, isCurrentMonth: false })
    }
    return cells
  }, [currentDate, maxDaysInMonth, currentMonthPrefix, dailyDataMap])

  // 获取当前项色阶
  const getCellBg = (item) => {
    if (!item.isCurrentMonth || !item.dt) return '#ffffff'
    const dt = item.dt
    
    // 简化色盘，仅通过透明度或简单混色
    if (calTab === 'expense' && dt.expense > 0) {
      const alpha = Math.max(0.1, dt.expense / (maxValues.expense || 1))
      return `rgba(255, 119, 168, ${alpha})` // Red
    }
    if (calTab === 'income' && dt.income > 0) {
      const alpha = Math.max(0.1, dt.income / (maxValues.income || 1))
      return `rgba(98, 232, 181, ${alpha + 0.1})` // Green
    }
    if (calTab === 'net' && dt.net !== 0) {
       if (dt.net < 0) return `rgba(255, 119, 168, ${Math.max(0.1, Math.abs(dt.net) / (maxValues.net||1))})`
       return `rgba(98, 232, 181, ${Math.max(0.2, dt.net / (maxValues.net||1))})`
    }
    if (calTab === 'balance' && dt.balance > 0) {
       const alpha = Math.max(0.1, dt.balance / (maxValues.balance || 1))
       return `rgba(255, 184, 0, ${alpha})` // Amber
    }
    return '#fdfdfd'
  }

  // 获取当前展示值
  const getCellValue = (item) => {
    if (!item.isCurrentMonth || !item.dt) return ''
    let val = 0
    if (calTab === 'expense') val = item.dt.expense > 0 ? -item.dt.expense : 0
    if (calTab === 'income') val = item.dt.income
    if (calTab === 'net') val = item.dt.net
    if (calTab === 'balance') val = item.dt.balance
    
    if (val === 0 && calTab !== 'balance') return ''
    return val > 0 && calTab !== 'expense' ? `+${val.toFixed(0)}` : val.toFixed(0)
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  // === 图表与汇总计算 ===
  const totalExpense = monthlyRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.price, 0)
  const totalIncome = monthlyRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.price, 0)
  
  const avgExpense = maxDaysInMonth ? (totalExpense / maxDaysInMonth).toFixed(2) : 0

  const pieData = useMemo(() => {
    const expenses = monthlyRecords.filter(r => r.type === 'expense')
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.name] = (acc[curr.name] || 0) + curr.price
      return acc
    }, {})
    // 将分组转成数组，保留前5
    const arr = Object.keys(grouped).map(k => ({ name: k, value: grouped[k] })).sort((a,b) => b.value - a.value)
    if (arr.length > 5) {
      const top = arr.slice(0, 4)
      const otherValue = arr.slice(4).reduce((sum, item) => sum + item.value, 0)
      top.push({ name: '其他', value: otherValue })
      return top
    }
    return arr
  }, [monthlyRecords])

  const COLORS = ['#334155', '#64748b', '#0f766e', '#0369a1', '#6d28d9', '#94a3b8']

  const barData = useMemo(() => {
     return Object.keys(dailyDataMap).map(dateStr => {
        const d = new Date(dateStr).getDate()
        return {
          name: `${d}日`,
          支出: dailyDataMap[dateStr].expense,
          收入: dailyDataMap[dateStr].income
        }
     })
  }, [dailyDataMap])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <FloatingBackButton />

      <div className="pt-14 pb-6 px-5">
         <div className="text-center text-slate-900 text-2xl font-semibold tracking-wide mb-1">
            日历报表
         </div>
         <div className="text-center text-slate-500 text-sm font-medium tracking-wide mb-6">
            日历统计模式，对收支了如指掌
         </div>

         <div className="flex justify-center mb-2">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="w-[220px] rounded-full">
                <TabsTrigger className="rounded-full" value="report">报表</TabsTrigger>
                <TabsTrigger className="rounded-full" value="calendar">日历</TabsTrigger>
              </TabsList>
            </Tabs>
         </div>
         
         <div className="flex justify-between items-center text-slate-700 mt-5 px-2">
            <Button variant="ghost" size="sm" className="text-base font-semibold px-2" onClick={prevMonth}>
              {currentDate.getFullYear()}年{currentDate.getMonth()+1}月 ▾
            </Button>
            <Button variant="ghost" size="sm" className="text-sm px-2" onClick={nextMonth}>
              下月 ▾
            </Button>
         </div>
      </div>

      <div className="mx-4 mb-3 grid grid-cols-3 gap-2">
        <Card className="p-3 rounded-2xl">
          <div className="text-[11px] text-slate-500">现金余额</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">¥{bank.toFixed(2)}</div>
        </Card>
        <Card className="p-3 rounded-2xl">
          <div className="text-[11px] text-slate-500">月收入</div>
          <div className="text-sm font-semibold text-emerald-600 mt-1">¥{totalIncome.toFixed(2)}</div>
        </Card>
        <Card className="p-3 rounded-2xl">
          <div className="text-[11px] text-slate-500">月支出</div>
          <div className="text-sm font-semibold text-rose-500 mt-1">¥{totalExpense.toFixed(2)}</div>
        </Card>
      </div>

      <Card className="mx-4 min-h-[500px] overflow-hidden rounded-[28px]">
        
        {viewMode === 'calendar' ? (
          <div className="p-5">
             <Tabs value={calTab} onValueChange={setCalTab}>
               <TabsList className="mb-4 h-10 rounded-xl border-none shadow-none p-0 bg-transparent justify-start gap-2">
                 <TabsTrigger className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900" value="expense">支出</TabsTrigger>
                 <TabsTrigger className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900" value="income">收入</TabsTrigger>
                 <TabsTrigger className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900" value="net">收支</TabsTrigger>
                 <TabsTrigger className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900" value="balance">结余</TabsTrigger>
               </TabsList>
             </Tabs>

             <div className="grid grid-cols-7 mb-2 text-center text-xs text-slate-500 font-medium">
                {DAYS_OF_WEEK.map(v => <div key={v} className="pb-2">{v}</div>)}
             </div>

             <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {calendarGrid.map((item, idx) => (
                   <div 
                     key={idx} 
                     className="flex flex-col items-center justify-center py-2 rounded-xl h-[56px] transition-colors"
                     style={{
                        background: getCellBg(item),
                        opacity: item.isCurrentMonth ? 1 : 0.3,
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.01)'
                     }}
                   >
                     <span className={`text-[15px] font-semibold ${!item.isCurrentMonth ? 'text-slate-300' : 'text-slate-800'}`}>
                        {item.day}
                     </span>
                     {item.isCurrentMonth && (
                       <span className="text-[9px] -mt-0.5 text-slate-600 font-semibold tracking-tighter" style={{transform: 'scale(0.85)'}}>
                          {getCellValue(item)}
                       </span>
                     )}
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="p-5 pb-8">
            <h3 className="font-semibold text-slate-900 text-base mb-6">消费类目分布 (饼图)</h3>
            <div className="w-full flex justify-center -ml-4 mb-8">
              {pieData.length > 0 ? (
                <PieChart width={300} height={200}>
                   <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={5}>
                      {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Tooltip />
                </PieChart>
              ) : (
                <div className="text-slate-300 h-[200px] flex items-center text-sm">暂无消费数据</div>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-2 mb-8">
              {pieData.map((e, index) => (
                <div key={index} className="flex justify-between w-[80%] text-[13px] text-slate-600 border-b border-slate-100 pb-1">
                   <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS[index % COLORS.length]}}></div>
                     {e.name}
                   </div>
                   <div className="font-bold">¥{e.value}</div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-slate-900 text-base mb-6">每日统计 (柱状图)</h3>
             <div className="w-full h-[220px] -ml-4 pr-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)'}} />
                    <Bar dataKey="支出" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={10} />
                    <Bar dataKey="收入" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={10} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}
        
        {viewMode === 'calendar' && (
           <div className="border-t border-slate-100 flex justify-center items-center py-5 text-sm text-slate-600 gap-8 bg-slate-50/60 mt-2">
              <div>月收入: <span className="text-emerald-600 font-semibold ml-1">¥{totalIncome.toFixed(2)}</span></div>
              <div>日均支出: <span className="text-rose-500 font-semibold ml-1">¥{avgExpense}</span></div>
           </div>
        )}
      </Card>

    </div>
  )
}
