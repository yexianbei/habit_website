import React from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: '李明',
    role: '产品经理',
    avatar: '👨‍💼',
    rating: 5,
    content: '我以前从来坚持不了早睡，试过各种方法都失败了。用了小习惯的微习惯法则，从每天提前 5 分钟上床开始，现在已经坚持 60 天了！真的太神奇了。',
    highlight: '坚持 60 天早睡'
  },
  {
    name: '王芳',
    role: '全职妈妈',
    avatar: '👩',
    rating: 5,
    content: '孩子每天主动阅读 10 分钟，我简直不敢相信！以前怎么催都不愿意看书，现在用小习惯的游戏化功能，他每天都抢着去完成任务。',
    highlight: '孩子主动阅读'
  },
  {
    name: '张伟',
    role: '程序员',
    avatar: '👨‍💻',
    rating: 5,
    content: '作为一个长期久坐的程序员，我用小习惯养成了每天运动的习惯。从每天 5 个深蹲开始，现在已经能跑 5 公里了。AI 教练的建议非常贴心。',
    highlight: '从 5 个深蹲到 5 公里'
  },
  {
    name: '刘娜',
    role: '自由职业者',
    avatar: '👩‍🎨',
    rating: 5,
    content: '专注计时器太好用了！以前总是拖延，现在用番茄钟工作，效率提升了至少 50%。而且界面很简洁，不会让人分心。',
    highlight: '效率提升 50%'
  },
  {
    name: '陈浩',
    role: '大学生',
    avatar: '👨‍🎓',
    rating: 5,
    content: '戒掉了刷短视频的习惯！每次想刷的时候就打开小习惯记录一下，看到自己已经坚持了这么多天，就不想破功了。现在有更多时间学习了。',
    highlight: '成功戒除短视频'
  },
  {
    name: '赵敏',
    role: '小白领',
    avatar: '👩‍💼',
    rating: 5,
    content: '减肥成功了！用小习惯记录每天的运动和饮食，3 个月减了 15 斤。数据可视化让我清楚地看到自己的进步，特别有成就感。',
    highlight: '3 个月减重 15 斤'
  }
]

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title">用户真实评价</h2>
          <p className="section-subtitle">
            10 万+ 用户的共同选择
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 头像和信息 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-yellow-300 rounded-full flex items-center justify-center text-3xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>

              {/* 评分 */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#FFCE00" stroke="#FFCE00" />
                ))}
              </div>

              {/* 评价内容 */}
              <p className="text-gray-700 leading-relaxed mb-4">
                "{testimonial.content}"
              </p>

              {/* 亮点标签 */}
              <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                ✨ {testimonial.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* App Store 评分展示 */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-6xl font-bold text-primary">4.8</div>
              <div className="text-left">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} fill="#FFCE00" stroke="#FFCE00" />
                  ))}
                </div>
                <div className="text-gray-600 mt-1">App Store 评分</div>
              </div>
            </div>
            <div className="text-gray-500">基于 10,000+ 用户评价</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

