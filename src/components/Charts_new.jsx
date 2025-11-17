import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useLanguage } from '../i18n/LanguageContext'

const Charts = () => {
  const { t, language } = useLanguage()
  
  // 模拟数据 - 根据语言动态生成
  const streakData = language === 'zh' ? [
    { day: '第1天', count: 1 },
    { day: '第7天', count: 7 },
    { day: '第14天', count: 14 },
    { day: '第21天', count: 21 },
    { day: '第30天', count: 28 },
    { day: '第60天', count: 55 },
    { day: '第90天', count: 82 }
  ] : [
    { day: 'Day 1', count: 1 },
    { day: 'Day 7', count: 7 },
    { day: 'Day 14', count: 14 },
    { day: 'Day 21', count: 21 },
    { day: 'Day 30', count: 28 },
    { day: 'Day 60', count: 55 },
    { day: 'Day 90', count: 82 }
  ]

  const completionData = [
    { name: t('charts.completionChart.labels.completed'), value: 85, color: '#FFCE00' },
    { name: t('charts.completionChart.labels.inProgress'), value: 10, color: '#60A5FA' },
    { name: t('charts.completionChart.labels.abandoned'), value: 5, color: '#E5E7EB' }
  ]

  const categoryData = language === 'zh' ? [
    { category: '运动健身', count: 3200 },
    { category: '学习阅读', count: 2800 },
    { category: '健康饮食', count: 2400 },
    { category: '早睡早起', count: 2000 },
    { category: '戒除坏习惯', count: 1500 }
  ] : [
    { category: 'Fitness', count: 3200 },
    { category: 'Reading', count: 2800 },
    { category: 'Healthy Diet', count: 2400 },
    { category: 'Sleep Early', count: 2000 },
    { category: 'Break Habits', count: 1500 }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('charts.title')}</h2>
          <p className="section-subtitle">
            {t('charts.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* 折线图：连续坚持天数 */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-2">{t('charts.streakChart.title')}</h3>
            <p className="text-gray-600 mb-6">{t('charts.streakChart.subtitle')}</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FFCE00" 
                  strokeWidth={3}
                  dot={{ fill: '#FFCE00', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-500">
              💪 {t('charts.streakChart.insight')}
            </div>
          </div>

          {/* 环形图：习惯完成率 */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-2">{t('charts.completionChart.title')}</h3>
            <p className="text-gray-600 mb-6">{t('charts.completionChart.subtitle')}</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-500">
              ✨ {t('charts.completionChart.insight')}
            </div>
          </div>

          {/* 柱状图：习惯类型分布 */}
          <div className="card lg:col-span-2">
            <h3 className="text-2xl font-bold mb-2">{t('charts.categoryChart.title')}</h3>
            <p className="text-gray-600 mb-6">{t('charts.categoryChart.subtitle')}</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="#FFCE00" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-500">
              🏃 {t('charts.categoryChart.insight')}
            </div>
          </div>
        </div>

        {/* 统计亮点 */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
            <div className="text-4xl font-bold text-primary mb-2">82%</div>
            <div className="text-gray-700">{t('charts.highlights.retention')}</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">3.5</div>
            <div className="text-gray-700">{t('charts.highlights.avgHabits')}</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
            <div className="text-4xl font-bold text-green-600 mb-2">25{language === 'zh' ? '分钟' : 'min'}</div>
            <div className="text-gray-700">{t('charts.highlights.dailyTime')}</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <div className="text-4xl font-bold text-purple-600 mb-2">500{language === 'zh' ? '万+' : 'M+'}</div>
            <div className="text-gray-700">{t('charts.highlights.totalCheckins')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Charts

