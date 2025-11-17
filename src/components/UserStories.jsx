import React from 'react'
import { GraduationCap, Heart, Briefcase } from 'lucide-react'

const stories = [
  {
    icon: GraduationCap,
    role: '大学生',
    name: '小李',
    age: 21,
    goal: '提升专注力，提高学习效率',
    challenge: '总是忍不住刷手机，注意力难以集中',
    solution: '使用小习惯的番茄钟功能，每天完成 4 次 25 分钟专注学习',
    result: '坚持 60 天后，期末成绩从班级中游提升到前 10%',
    stats: {
      days: 60,
      sessions: 240,
      hours: 100
    },
    chartType: '专注时长折线图',
    chartPlaceholder: '/assets/chart-student.png',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Heart,
    role: '全职妈妈',
    name: '王女士',
    age: 35,
    goal: '培养孩子的阅读和整理习惯',
    challenge: '孩子总是拖延，不愿意主动完成任务',
    solution: '为孩子设置「每天阅读 10 分钟」「睡前整理书包」等微习惯',
    result: '30 天后，孩子开始主动阅读，房间也变得整洁有序',
    stats: {
      days: 30,
      habits: 3,
      completion: 92
    },
    chartType: '打卡热力图',
    chartPlaceholder: '/assets/chart-parent.png',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Briefcase,
    role: '上班族',
    name: '张先生',
    age: 28,
    goal: '减肥健身，改善身体状态',
    challenge: '工作忙碌，经常加班，没时间运动',
    solution: '设置「每天走 8000 步」「喝 8 杯水」「睡前拉伸 5 分钟」',
    result: '3 个月减重 12 斤，体脂率下降 5%，精神状态明显改善',
    stats: {
      days: 90,
      weight: -12,
      bodyFat: -5
    },
    chartType: '体重变化折线图',
    chartPlaceholder: '/assets/chart-worker.png',
    color: 'from-green-500 to-emerald-500'
  }
]

const UserStories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">真实用户故事</h2>
          <p className="section-subtitle">
            看看他们如何通过小习惯改变生活
          </p>
        </div>

        <div className="space-y-20">
          {stories.map((story, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* 内容区 */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${story.color} rounded-2xl flex items-center justify-center text-white`}>
                    <story.icon size={32} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{story.name}</div>
                    <div className="text-gray-600">{story.role} · {story.age}岁</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-primary mb-2">🎯 目标</div>
                    <div className="text-lg">{story.goal}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-red-500 mb-2">😰 挑战</div>
                    <div className="text-gray-600">{story.challenge}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-blue-500 mb-2">💡 解决方案</div>
                    <div className="text-gray-600">{story.solution}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-green-500 mb-2">✨ 效果</div>
                    <div className="text-lg font-medium">{story.result}</div>
                  </div>
                </div>

                {/* 数据统计 */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {Object.entries(story.stats).map(([key, value], i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {typeof value === 'number' && value > 0 ? '+' : ''}{value}
                        {key === 'completion' ? '%' : ''}
                        {key === 'weight' ? '斤' : ''}
                        {key === 'bodyFat' ? '%' : ''}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {key === 'days' && '坚持天数'}
                        {key === 'sessions' && '完成次数'}
                        {key === 'hours' && '专注时长'}
                        {key === 'habits' && '习惯数量'}
                        {key === 'completion' && '完成率'}
                        {key === 'weight' && '体重变化'}
                        {key === 'bodyFat' && '体脂变化'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 图表区 */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="card">
                  <div className="text-sm font-semibold text-gray-500 mb-4">
                    {story.chartType}
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-5xl mb-4">📊</div>
                      <div className="text-gray-600 font-medium">图表占位</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {story.chartPlaceholder}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserStories

