import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNativeBridge } from '../../utils/useNativeBridge'
import FloatingBackButton from '../../components/FloatingBackButton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

const LOCAL_STORAGE_KEY = 'kid_finance_data_v1'
const DAYS_OF_WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function KidFinanceStats() {
  const navigate = useNavigate()
  const { isInApp, setTitle, callNative, showToast } = useNativeBridge()

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

    try {
      const dataStr = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (dataStr) {
        const data = JSON.parse(dataStr)
        const allR = data.records || []
        // 清洗数据，添加时间戳，未设类型的默认为支出
        const processed = allR.map(r => {
           // 处理中文格式时间，转为标准 Date
           const cleanTime = r.time.replace(/年|月/g, '-').replace(/日/g, '')
           const d = new Date(cleanTime)
           const validDate = isNaN(d.getTime()) ? new Date() : d
           return {
             ...r,
             type: r.type || 'expense',
             timestamp: validDate.getTime(),
             dateObj: validDate,
             formatDate: `${validDate.getFullYear()}-${String(validDate.getMonth()+1).padStart(2, '0')}-${String(validDate.getDate()).padStart(2, '0')}`
           }
        })
        setRecords(processed)
        setBank(data.bank || 0)
      }
    } catch (e) {
      console.error(e)
    }
  }, [isInApp, setTitle])

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
    let runningBalance = 0;
    
    // 我们按照从小到大先排序一下时间
    const sorted = [...monthlyRecords].sort((a, b) => a.timestamp - b.timestamp)
    
    sorted.forEach(r => {
      const key = r.formatDate
      if (map[key]) {
        if (r.type === 'expense') {
          map[key].expense += r.price
          runningBalance -= r.price
        } else {
           map[key].income += r.price
           runningBalance += r.price
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

  const COLORS = ['#ff77a8', '#9476ff', '#5cd6a3', '#ffc107', '#4daaff', '#ccc']

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
    <div className="min-h-screen bg-[#AECDBE] font-sans pb-10">
      <FloatingBackButton />

      {/* 头部导航：类似 App 风格的绿底背景中嵌入 Toggle */}
      <div className="pt-14 pb-8 px-5">
         <div className="text-center text-white text-[28px] font-bold tracking-wide mb-2 opacity-90 drop-shadow-sm">
            日历报表
         </div>
         <div className="text-center text-white/80 text-[14px] font-medium tracking-wider mb-8">
            日历统计模式，对收支了如指掌
         </div>

         <div className="flex justify-center mb-2">
            <div className="bg-[#9ABEA9] p-1 rounded-full flex w-[220px] shadow-inner border border-[#a2c5b1]">
              <button 
                className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${viewMode === 'report' ? 'bg-[#5e7d6b] text-white shadow-md' : 'text-[#5e7d6b] hover:text-[#4d6a59]'}`}
                onClick={() => setViewMode('report')}
              >
                报表
              </button>
              <button 
                className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${viewMode === 'calendar' ? 'bg-[#5e7d6b] text-white shadow-md' : 'text-[#5e7d6b] hover:text-[#4d6a59]'}`}
                onClick={() => setViewMode('calendar')}
              >
                日历
              </button>
            </div>
         </div>
         
         <div className="flex justify-between items-center text-[#3c5545] mt-6 px-2">
            <div className="flex items-center gap-2 cursor-pointer p-1 active:opacity-60" onClick={prevMonth}>
               <span className="text-[17px] font-bold">{currentDate.getFullYear()}年{currentDate.getMonth()+1}月 ▾</span>
            </div>
            <div className="flex items-center gap-1.5 text-[15px] cursor-pointer p-1 active:opacity-60" onClick={nextMonth}>
              <span>下月 ▾</span>
            </div>
         </div>
      </div>

      {/* 主面板容器 */}
      <div className="bg-white rounded-[32px] mx-4 shadow-xl shadow-[#8fb09f]/40 min-h-[500px] overflow-hidden">
        
        {viewMode === 'calendar' ? (
          <div className="p-5">
             <div className="flex gap-4 border-b border-gray-100 pb-3 mb-4 text-[15px] pl-1 font-bold text-gray-500 relative">
               {['expense', 'income', 'net', 'balance'].map((tab, i) => {
                 const labels = { expense: '支出', income: '收入', net: '收支', balance: '结余' }
                 return (
                   <div 
                     key={tab} 
                     className={`cursor-pointer transition-colors relative ${calTab === tab ? 'text-[#ff7b7b]' : ''} hover:text-gray-800`}
                     onClick={() => setCalTab(tab)}
                   >
                     {labels[tab]}
                     {calTab === tab && <div className="absolute -bottom-3 left-[15%] right-[15%] h-0.5 bg-[#ff7b7b] rounded-full"></div>}
                   </div>
                 )
               })}
               <div className="ml-auto text-gray-400">设置</div>
             </div>

             {/* 表头星期 */}
             <div className="grid grid-cols-7 mb-2 text-center text-[12px] text-gray-500 font-medium">
                {DAYS_OF_WEEK.map(v => <div key={v} className="pb-2">{v}</div>)}
             </div>

             {/* 日历网格 */}
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
                     <span className={`text-[15px] font-bold ${!item.isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}`}>
                        {item.day}
                     </span>
                     {item.isCurrentMonth && (
                       <span className="text-[9px] -mt-0.5 text-gray-600 font-semibold tracking-tighter" style={{transform: 'scale(0.85)'}}>
                          {getCellValue(item)}
                       </span>
                     )}
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="p-5 pb-8">
            <h3 className="font-bold text-[#3c5545] text-[17px] mb-6">消费类目分布 (饼图)</h3>
            <div className="w-full flex justify-center -ml-4 mb-8">
              {pieData.length > 0 ? (
                <PieChart width={300} height={200}>
                   <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={5}>
                      {pieData.map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Tooltip />
                </PieChart>
              ) : (
                <div className="text-gray-300 h-[200px] flex items-center text-sm">暂无消费数据</div>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-2 mb-8">
              {pieData.map((e, index) => (
                <div key={index} className="flex justify-between w-[80%] text-[13px] text-gray-600 border-b border-gray-50 pb-1">
                   <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS[index % COLORS.length]}}></div>
                     {e.name}
                   </div>
                   <div className="font-bold">¥{e.value}</div>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-[#3c5545] text-[17px] mb-6">每日统计 (柱状图)</h3>
             <div className="w-full h-[220px] -ml-4 pr-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f0f0f0'}} contentStyle={{borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="支出" fill="#ff7b7b" radius={[4, 4, 0, 0]} maxBarSize={10} />
                    <Bar dataKey="收入" fill="#62e8b5" radius={[4, 4, 0, 0]} maxBarSize={10} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}
        
        {/* 底部汇总（仅月历下显示） */}
        {viewMode === 'calendar' && (
           <div className="border-t border-gray-100 flex justify-center items-center py-5 text-[14px] text-gray-600 gap-8 bg-gray-50/50 mt-2">
              <div>月收入: <span className="text-[#62e8b5] font-bold ml-1">¥{totalIncome.toFixed(2)}</span></div>
              <div>日均支出: <span className="text-[#ff7b7b] font-bold ml-1">¥{avgExpense}</span></div>
           </div>
        )}
      </div>

    </div>
  )
}
