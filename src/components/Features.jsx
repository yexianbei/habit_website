import React from 'react'
import { 
  Target, 
  Brain, 
  Timer, 
  Ban, 
  Sprout, 
  Cloud 
} from 'lucide-react'

const features = [
  {
    icon: Target,
    title: '微习惯法则',
    description: '每天 1 分钟也能坚持，降低行动门槛，让习惯养成变得轻而易举',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Brain,
    title: 'AI 智能教练',
    description: '根据你的完成情况自动调整计划，提供个性化建议和鼓励',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Timer,
    title: '专注计时器',
    description: '番茄钟、正计时、倒计时，学习、减肥、阅读都适用',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Ban,
    title: '戒除坏习惯',
    description: '记录触发时间和场景，可视化查看已经多久没做，强化戒断动力',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Sprout,
    title: '游戏化养成',
    description: '完成习惯获得营养值，养成虚拟植物，让坚持变得更有趣',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Cloud,
    title: '多端同步',
    description: '基于 CloudKit 的无缝同步，iPhone、iPad、Mac 数据实时同步',
    color: 'bg-indigo-100 text-indigo-600'
  }
]

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title">为什么选择小习惯？</h2>
          <p className="section-subtitle">
            六大核心功能，让习惯养成更科学、更有趣
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

