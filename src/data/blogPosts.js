// 博客文章数据
export const blogPosts = [
  {
    id: 1,
    title: { zh: '微习惯：为什么每天1分钟比每周1小时更有效？', en: 'Micro Habits: Why 1 Minute Daily Beats 1 Hour Weekly' },
    excerpt: { 
      zh: '探索微习惯的科学原理，了解为什么从小事开始能带来持久改变。通过真实案例和数据，揭示习惯养成的底层逻辑。', 
      en: 'Explore the science behind micro habits and why starting small leads to lasting change. Real cases and data reveal the logic of habit formation.' 
    },
    content: {
      zh: `
        <h2>什么是微习惯？</h2>
        <p>微习惯是一种极其微小的积极行为，小到几乎不可能失败。比如，如果你想养成每天运动的习惯，微习惯不是"每天跑步30分钟"，而是"每天做1个俯卧撑"。</p>
        
        <h2>为什么微习惯更有效？</h2>
        <p>传统习惯养成方法往往要求我们做出巨大的改变，这需要消耗大量意志力。而微习惯的核心优势在于：</p>
        <ul>
          <li><strong>降低行动门槛</strong>：1个俯卧撑几乎不需要意志力，任何人都能做到</li>
          <li><strong>建立身份认同</strong>：每天完成微习惯，你会逐渐认同自己是一个"会运动的人"</li>
          <li><strong>形成正向循环</strong>：完成微习惯后，你往往会超额完成（做了1个俯卧撑后，通常会做更多）</li>
          <li><strong>避免失败感</strong>：即使状态不好，完成微习惯也不会有挫败感</li>
        </ul>
        
        <h2>科学依据</h2>
        <p>神经科学研究表明，习惯的形成需要大脑建立新的神经通路。微习惯通过频繁的重复，能够更快地强化这些神经连接。每天1分钟的行为，比每周1小时的集中训练，更能激活大脑的奖励系统。</p>
        
        <h2>如何开始？</h2>
        <p>使用小习惯App，你可以轻松设置微习惯：</p>
        <ol>
          <li>选择一个你想养成的习惯</li>
          <li>将其缩小到几乎不可能失败的程度</li>
          <li>每天完成，让AI教练帮你追踪进度</li>
          <li>享受超额完成的成就感</li>
        </ol>
        
        <h2>真实案例</h2>
        <p>用户Shelly从"每天走8000步"缩小到"每天走100步"，结果3个月后不仅养成了运动习惯，还成功减重12斤。这就是微习惯的力量。</p>
      `,
      en: `
        <h2>What are Micro Habits?</h2>
        <p>Micro habits are extremely small positive behaviors that are so tiny you almost can't fail. For example, if you want to build an exercise habit, a micro habit isn't "run 30 minutes daily" but "do 1 push-up daily".</p>
        
        <h2>Why Micro Habits Work Better</h2>
        <p>Traditional habit-building methods often require massive changes that drain willpower. Micro habits excel because:</p>
        <ul>
          <li><strong>Lower barrier</strong>: 1 push-up requires almost no willpower</li>
          <li><strong>Build identity</strong>: Completing micro habits daily makes you identify as someone who exercises</li>
          <li><strong>Create momentum</strong>: After 1 push-up, you often do more</li>
          <li><strong>Avoid failure</strong>: Even on bad days, completing a micro habit feels like success</li>
        </ul>
        
        <h2>The Science</h2>
        <p>Neuroscience shows habits form by building new neural pathways. Micro habits strengthen these connections faster through frequent repetition. One minute daily activates the brain's reward system more effectively than one hour weekly.</p>
        
        <h2>How to Start</h2>
        <p>With Tiny Habits App, you can easily set micro habits:</p>
        <ol>
          <li>Choose a habit you want to build</li>
          <li>Shrink it to an almost impossible-to-fail size</li>
          <li>Complete daily, let AI coach track your progress</li>
          <li>Enjoy the satisfaction of exceeding your goal</li>
        </ol>
        
        <h2>Real Case</h2>
        <p>User Shelly shrunk "walk 8000 steps daily" to "walk 100 steps daily". Three months later, she not only built an exercise habit but also lost 6kg. That's the power of micro habits.</p>
      `
    },
    category: 'habit',
    date: '2024-01-15',
    readTime: { zh: '5分钟', en: '5 min' },
    image: 'https://plus.unsplash.com/premium_photo-1661284853300-cecb2f4c73d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TWljcm8lMjBIYWJpdHN8ZW58MHx8MHx8fDA%3D',
    featured: true
  },
  {
    id: 2,
    title: { zh: '番茄工作法：如何用25分钟提升专注力', en: 'Pomodoro Technique: Boost Focus in 25 Minutes' },
    excerpt: { 
      zh: '详细介绍番茄工作法的使用技巧，结合小习惯App的计时器功能，帮助你在工作和学习中保持高效专注。', 
      en: 'Learn how to use the Pomodoro Technique effectively with Tiny Habits timer to stay focused and productive.' 
    },
    content: {
      zh: `
        <h2>什么是番茄工作法？</h2>
        <p>番茄工作法是一种时间管理方法，由弗朗西斯科·西里洛在1990年代发明。核心是将工作时间分割成25分钟的工作块（称为"番茄"），每个番茄后休息5分钟。</p>
        
        <h2>为什么有效？</h2>
        <p>人类大脑的专注力是有限的。研究表明，大多数人能够保持高度专注的时间大约在20-30分钟之间。番茄工作法正是利用这一规律：</p>
        <ul>
          <li><strong>时间限制降低压力</strong>：知道只需要专注25分钟，心理压力更小</li>
          <li><strong>休息恢复精力</strong>：短暂休息让大脑恢复，保持长期高效</li>
          <li><strong>增强时间感知</strong>：明确的时间块让你更好地规划任务</li>
        </ul>
        
        <h2>如何使用小习惯App实践番茄工作法？</h2>
        <p>小习惯App内置了专业的番茄钟功能：</p>
        <ol>
          <li>打开小习惯App，选择"专注计时器"</li>
          <li>设置25分钟倒计时</li>
          <li>开始专注工作，期间不要看手机</li>
          <li>时间到后，休息5分钟</li>
          <li>完成4个番茄后，进行15-30分钟的长休息</li>
        </ol>
        
        <h2>进阶技巧</h2>
        <ul>
          <li><strong>任务清单</strong>：在开始前列出要完成的任务</li>
          <li><strong>环境准备</strong>：清理桌面，关闭通知</li>
          <li><strong>记录数据</strong>：追踪每天完成的番茄数，建立成就感</li>
        </ul>
      `,
      en: `
        <h2>What is the Pomodoro Technique?</h2>
        <p>The Pomodoro Technique is a time management method invented by Francesco Cirillo in the 1990s. It breaks work into 25-minute focused intervals (called "pomodoros") followed by 5-minute breaks.</p>
        
        <h2>Why It Works</h2>
        <p>Human attention span is limited. Research shows most people can maintain high focus for 20-30 minutes. The Pomodoro Technique leverages this:</p>
        <ul>
          <li><strong>Time limits reduce stress</strong>: Knowing you only need to focus for 25 minutes reduces pressure</li>
          <li><strong>Breaks restore energy</strong>: Short breaks let your brain recover for sustained productivity</li>
          <li><strong>Better time awareness</strong>: Clear time blocks help you plan tasks better</li>
        </ul>
        
        <h2>Using Tiny Habits App for Pomodoro</h2>
        <p>Tiny Habits App has a built-in Pomodoro timer:</p>
        <ol>
          <li>Open Tiny Habits App, select "Focus Timer"</li>
          <li>Set a 25-minute countdown</li>
          <li>Focus on work, don't check your phone</li>
          <li>Take a 5-minute break when time's up</li>
          <li>After 4 pomodoros, take a 15-30 minute long break</li>
        </ol>
        
        <h2>Advanced Tips</h2>
        <ul>
          <li><strong>Task list</strong>: List tasks before starting</li>
          <li><strong>Environment prep</strong>: Clear desk, turn off notifications</li>
          <li><strong>Track data</strong>: Record daily pomodoros for motivation</li>
        </ul>
      `
    },
    category: 'productivity',
    date: '2024-01-10',
    readTime: { zh: '6分钟', en: '6 min' },
    image: 'https://plus.unsplash.com/premium_photo-1677109898965-7ae03cdbc4d4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG9tb2Rvcm8lMjB0aW1lcnxlbnwwfHwwfHx8MA%3D%3D',
    featured: false
  },
  {
    id: 3,
    title: { zh: '时间管理的5个黄金法则', en: '5 Golden Rules of Time Management' },
    excerpt: { 
      zh: '从优先级排序到任务分解，掌握时间管理的核心技巧，让你的每一天都更有价值。', 
      en: 'Master time management from prioritization to task breakdown, making every day more valuable.' 
    },
    content: {
      zh: `
        <h2>法则一：二八定律</h2>
        <p>80%的结果来自20%的努力。识别并专注于那些能产生最大价值的关键任务。</p>
        
        <h2>法则二：时间块管理</h2>
        <p>将相似的任务集中处理，减少上下文切换的成本。比如，把所有邮件回复安排在固定时间段。</p>
        
        <h2>法则三：任务分解</h2>
        <p>将大任务拆解成小步骤，每个步骤都应该能在30分钟内完成。这样既降低心理阻力，又便于追踪进度。</p>
        
        <h2>法则四：设置截止时间</h2>
        <p>帕金森定律告诉我们：工作会填满分配给它的时间。为每个任务设置明确的截止时间，提高效率。</p>
        
        <h2>法则五：定期回顾</h2>
        <p>每周回顾你的时间使用情况，找出时间浪费的源头，持续优化你的时间管理系统。</p>
      `,
      en: `
        <h2>Rule 1: The 80/20 Principle</h2>
        <p>80% of results come from 20% of effort. Identify and focus on tasks that deliver the most value.</p>
        
        <h2>Rule 2: Time Blocking</h2>
        <p>Group similar tasks together to reduce context switching. For example, batch all email replies in a fixed time slot.</p>
        
        <h2>Rule 3: Task Breakdown</h2>
        <p>Break large tasks into small steps, each completable in 30 minutes. This reduces resistance and makes progress trackable.</p>
        
        <h2>Rule 4: Set Deadlines</h2>
        <p>Parkinson's Law: work expands to fill the time available. Set clear deadlines for each task to boost efficiency.</p>
        
        <h2>Rule 5: Regular Review</h2>
        <p>Review your time usage weekly, identify time wasters, and continuously optimize your time management system.</p>
      `
    },
    category: 'time',
    date: '2024-01-05',
    readTime: { zh: '8分钟', en: '8 min' },
    image: 'https://images.unsplash.com/photo-1761058556617-ddd0f3b9795e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGltZSUyMG1hbmFnZW1lbnQlMjBjYWxlbmRhcnxlbnwwfHwwfHx8MA%3D%3D',
    featured: false
  },
  {
    id: 4,
    title: { zh: '从0到1：如何养成运动习惯', en: 'From Zero to One: Building Exercise Habits' },
    excerpt: { 
      zh: '分享一个上班族如何从每天5个深蹲开始，最终养成规律运动习惯的真实故事。', 
      en: 'A real story of how an office worker started with 5 squats daily and built a consistent exercise routine.' 
    },
    content: {
      zh: `
        <h2>真实故事：从5个深蹲到5公里</h2>
        <p>张伟是一名程序员，长期久坐导致腰背疼痛。他尝试过很多次健身，但都因为"没时间"而放弃。直到他遇到了微习惯方法。</p>
        
        <h2>第一步：设置微习惯</h2>
        <p>张伟将目标从"每天去健身房1小时"缩小到"每天做5个深蹲"。这个目标小到几乎不可能失败，即使加班到很晚也能完成。</p>
        
        <h2>第二步：超额完成</h2>
        <p>完成5个深蹲后，张伟通常会想："既然都做了，不如再做5个？"这种超额完成的感觉让他很有成就感。</p>
        
        <h2>第三步：逐步扩展</h2>
        <p>一个月后，张伟的微习惯变成了"每天做20个深蹲"。三个月后，他开始加入其他运动。半年后，他已经能轻松跑5公里了。</p>
        
        <h2>关键启示</h2>
        <ul>
          <li>从小开始，不要一开始就设定大目标</li>
          <li>利用超额完成的动力</li>
          <li>用数据追踪进度，看到进步更有动力</li>
        </ul>
      `,
      en: `
        <h2>Real Story: From 5 Squats to 5km</h2>
        <p>James is a programmer who suffered back pain from long hours of sitting. He tried fitness many times but gave up due to "no time". Until he discovered micro habits.</p>
        
        <h2>Step 1: Set Micro Habit</h2>
        <p>James shrunk his goal from "gym for 1 hour daily" to "5 squats daily". This goal was so small it was almost impossible to fail, even after overtime.</p>
        
        <h2>Step 2: Exceed the Goal</h2>
        <p>After 5 squats, James often thought: "Since I'm already here, why not do 5 more?" This feeling of exceeding goals was very motivating.</p>
        
        <h2>Step 3: Gradually Expand</h2>
        <p>After one month, James's micro habit became "20 squats daily". After three months, he added other exercises. After six months, he could easily run 5km.</p>
        
        <h2>Key Insights</h2>
        <ul>
          <li>Start small, don't set big goals initially</li>
          <li>Leverage the momentum of exceeding goals</li>
          <li>Track progress with data to stay motivated</li>
        </ul>
      `
    },
    category: 'fitness',
    date: '2024-01-01',
    readTime: { zh: '7分钟', en: '7 min' },
    image: 'https://images.unsplash.com/photo-1714646442330-9068099f5521?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGhvbWUlMjB3b3Jrb3V0fGVufDB8fDB8fHww',
    featured: false
  },
  {
    id: 5,
    title: { zh: '冥想入门：每天10分钟改变你的生活', en: 'Meditation 101: 10 Minutes Daily to Transform Your Life' },
    excerpt: { 
      zh: '初学者友好的冥想指南，从呼吸练习到正念训练，用最简单的方式开始你的冥想之旅。', 
      en: 'Beginner-friendly meditation guide, from breathing exercises to mindfulness training, start your journey the simplest way.' 
    },
    content: {
      zh: `
        <h2>为什么冥想？</h2>
        <p>科学研究表明，每天10分钟的冥想可以显著降低压力、提高专注力、改善睡眠质量。对于习惯养成来说，冥想还能增强自控力。</p>
        
        <h2>如何开始？</h2>
        <p>初学者可以从简单的呼吸冥想开始：</p>
        <ol>
          <li>找一个安静的地方，坐直或躺下</li>
          <li>闭上眼睛，专注于呼吸</li>
          <li>当思绪飘走时，温柔地将注意力拉回呼吸</li>
          <li>从5分钟开始，逐渐增加到10-15分钟</li>
        </ol>
        
        <h2>常见误区</h2>
        <ul>
          <li><strong>误区1：必须完全清空大脑</strong> - 实际上，冥想是观察思绪，而不是消除它们</li>
          <li><strong>误区2：需要特殊姿势</strong> - 只要舒适，任何姿势都可以</li>
          <li><strong>误区3：必须每天很长时间</strong> - 每天10分钟就足够产生效果</li>
        </ul>
        
        <h2>结合小习惯App</h2>
        <p>在小习惯App中设置"每天冥想10分钟"的微习惯，用计时器功能帮助你保持专注。追踪你的冥想天数，建立连续记录，让冥想成为生活的一部分。</p>
      `,
      en: `
        <h2>Why Meditate?</h2>
        <p>Research shows 10 minutes of daily meditation significantly reduces stress, improves focus, and enhances sleep. For habit building, meditation also strengthens self-control.</p>
        
        <h2>How to Start</h2>
        <p>Beginners can start with simple breathing meditation:</p>
        <ol>
          <li>Find a quiet place, sit straight or lie down</li>
          <li>Close eyes, focus on breathing</li>
          <li>When thoughts wander, gently bring attention back to breath</li>
          <li>Start with 5 minutes, gradually increase to 10-15 minutes</li>
        </ol>
        
        <h2>Common Misconceptions</h2>
        <ul>
          <li><strong>Myth 1: Must clear mind completely</strong> - Actually, meditation is about observing thoughts, not eliminating them</li>
          <li><strong>Myth 2: Need special posture</strong> - Any comfortable position works</li>
          <li><strong>Myth 3: Must meditate long daily</strong> - 10 minutes daily is enough to see benefits</li>
        </ul>
        
        <h2>With Tiny Habits App</h2>
        <p>Set a "meditate 10 minutes daily" micro habit in Tiny Habits App. Use the timer to stay focused. Track your meditation days, build streaks, and make meditation part of your life.</p>
      `
    },
    category: 'mindfulness',
    date: '2023-12-28',
    readTime: { zh: '9分钟', en: '9 min' },
    image: 'https://plus.unsplash.com/premium_photo-1674675647905-db8438e251dc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bWVkaXRhdGlvbiUyMGF0JTIwaG9tZXxlbnwwfHwwfHx8MA%3D%3D',
    featured: false
  },
  {
    id: 6,
    title: { zh: '自律的本质：不是意志力，而是系统', en: 'The Essence of Self-Discipline: Systems, Not Willpower' },
    excerpt: { 
      zh: '深入探讨自律的真正含义，揭示为什么建立系统比依赖意志力更可靠，更持久。', 
      en: 'Explore what self-discipline really means and why building systems beats relying on willpower.' 
    },
    content: {
      zh: `
        <h2>意志力的局限</h2>
        <p>很多人认为自律就是靠意志力，但科学研究表明，意志力是一种有限的资源。当你用意志力抵抗诱惑时，它会逐渐消耗，最终导致失败。</p>
        
        <h2>系统的力量</h2>
        <p>真正的自律不是靠意志力硬撑，而是建立一套系统，让好习惯自动运行：</p>
        <ul>
          <li><strong>环境设计</strong>：让好习惯更容易执行，坏习惯更难执行</li>
          <li><strong>触发机制</strong>：将新习惯与已有习惯绑定（习惯叠加）</li>
          <li><strong>降低门槛</strong>：使用微习惯，让行动几乎不需要意志力</li>
          <li><strong>追踪反馈</strong>：用数据可视化看到进步，增强动力</li>
        </ul>
        
        <h2>如何建立系统？</h2>
        <p>以早起为例：</p>
        <ol>
          <li><strong>环境设计</strong>：把手机放在另一个房间，必须起床才能关闹钟</li>
          <li><strong>习惯叠加</strong>：起床后立即喝一杯水（绑定已有习惯）</li>
          <li><strong>降低门槛</strong>：不要求早起后立即运动，只要求起床</li>
          <li><strong>追踪反馈</strong>：在小习惯App中记录早起天数，看到连续记录</li>
        </ol>
        
        <h2>关键洞察</h2>
        <p>自律不是关于你有多强的意志力，而是关于你设计了多好的系统。好的系统让好习惯变得容易，坏习惯变得困难。</p>
      `,
      en: `
        <h2>The Limits of Willpower</h2>
        <p>Many think self-discipline is about willpower, but research shows willpower is a finite resource. When you resist temptation, it depletes, eventually leading to failure.</p>
        
        <h2>The Power of Systems</h2>
        <p>True self-discipline isn't about willpower, but building systems that make good habits automatic:</p>
        <ul>
          <li><strong>Environment design</strong>: Make good habits easier, bad habits harder</li>
          <li><strong>Triggers</strong>: Link new habits to existing ones (habit stacking)</li>
          <li><strong>Lower barriers</strong>: Use micro habits that require almost no willpower</li>
          <li><strong>Track feedback</strong>: Visualize progress with data to boost motivation</li>
        </ul>
        
        <h2>How to Build Systems</h2>
        <p>Take waking early as an example:</p>
        <ol>
          <li><strong>Environment design</strong>: Put phone in another room, must get up to turn off alarm</li>
          <li><strong>Habit stacking</strong>: Drink water immediately after waking (link to existing habit)</li>
          <li><strong>Lower barriers</strong>: Don't require exercise immediately, just getting up</li>
          <li><strong>Track feedback</strong>: Record early wake days in Tiny Habits App, see streaks</li>
        </ol>
        
        <h2>Key Insight</h2>
        <p>Self-discipline isn't about how strong your willpower is, but how well you design your systems. Good systems make good habits easy and bad habits hard.</p>
      `
    },
    category: 'self-discipline',
    date: '2023-12-25',
    readTime: { zh: '10分钟', en: '10 min' },
    image: 'https://images.unsplash.com/photo-1660145177383-e6e2c22adb5c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdGl2ZSUyMHdvcmtzcGFjZXxlbnwwfHwwfHx8MA%3D%3D',
    featured: false
  },
  {
    id: 7,
    title: { 
      zh: '用微习惯落地原子习惯：从理论到实战', 
      en: 'From Theory to Practice: Using Micro Habits to Implement Atomic Habits' 
    },
    excerpt: { 
      zh: '很多人看完《原子习惯》热血沸腾，但落地却很难。这篇文章教你如何用“微习惯”的极小起点，把原子习惯的四大法则真正用在生活里。', 
      en: 'Many people feel excited after reading "Atomic Habits" but struggle to apply it. This article shows how to use tiny micro habits to implement the four laws of Atomic Habits in real life.' 
    },
    content: {
      zh: `
        <h2>原子习惯 VS 微习惯：它们在说同一件事</h2>
        <p>《原子习惯》强调：<strong>小改变 × 持续 × 复利</strong>。BJ Fogg 的“微习惯”方法则强调：<strong>小到不可能失败</strong>。两者的核心，其实都是：不要一开始就追求完美的行为，而是先让行为“发生起来”。</p>

        <h2>原子习惯的四大法则，如何用微习惯来落地？</h2>
        <p>《原子习惯》提出了行为改变的四个法则：提示、渴望、反应、奖励。我们可以用微习惯为每一条配备一个具体做法：</p>
        <ul>
          <li><strong>让它显而易见（提示）</strong>：把牙线放在牙刷旁边；把跑鞋放在床边。</li>
          <li><strong>让它有吸引力（渴望）</strong>：一边走路一边听喜欢的播客；运动后允许自己喝一杯喜欢的咖啡。</li>
          <li><strong>让它轻而易举（反应）</strong>：目标不是“跑 5 公里”，而是“换上运动鞋，走出门 1 分钟”。</li>
          <li><strong>让它令人满意（奖励）</strong>：在小习惯 App 里勾掉当天的任务，看到连续打卡的记录。</li>
        </ul>

        <h2>三个可以直接照抄的微习惯设计</h2>
        <ol>
          <li><strong>阅读习惯</strong>：不是“每天读 30 页”，而是“每天只读 1 页”。完成后在 App 里打卡。</li>
          <li><strong>早睡习惯</strong>：不是“11 点前睡觉”，而是“11 点前关掉手机，躺到床上”。真正睡着几点先不管。</li>
          <li><strong>写作习惯</strong>：不是“每天写 1000 字”，而是“每天打开文档，写 1 句废话也可以”。</li>
        </ol>

        <h2>为什么微习惯更容易坚持？</h2>
        <p>因为微习惯绕开了大脑中负责“评估成本”的那一部分。当你想到“写 1000 字”，大脑会觉得累；当你想到“只写一句话”，大脑会觉得：算了，就写一下吧。这样你更容易开始，而一旦开始，就很容易超额完成。</p>

        <h2>用小习惯 App 落地你的原子习惯</h2>
        <p>你可以在小习惯 App 中：</p>
        <ol>
          <li>为每一个目标只设置一个<strong>荒谬小</strong>的起点（1 页、1 句、1 分钟）。</li>
          <li>用“习惯叠加”的方式，绑定到已有行为（刷牙后、吃完晚饭后、关电脑前）。</li>
          <li>用打卡和数据可视化，看到自己的连续记录，体验到真正的“习惯复利”。</li>
        </ol>
      `,
      en: `
        <h2>Atomic Habits vs Micro Habits: Same Core Idea</h2>
        <p>"Atomic Habits" emphasizes <strong>small changes × consistency × compounding</strong>. BJ Fogg's "tiny habits" focus on making actions <strong>so small you can't fail</strong>. Both share the same core: don't chase perfect behavior at the start, just make the behavior happen.</p>

        <h2>Using Micro Habits to Apply the Four Laws</h2>
        <p>"Atomic Habits" introduces four laws of behavior change: cue, craving, response, reward. Micro habits let you implement each law with concrete practice:</p>
        <ul>
          <li><strong>Make it obvious (cue)</strong>: Put floss next to your toothbrush; place running shoes by your bed.</li>
          <li><strong>Make it attractive (craving)</strong>: Listen to your favorite podcast while walking; reward yourself with a coffee after exercise.</li>
          <li><strong>Make it easy (response)</strong>: The goal isn't "run 5km", but "put on shoes and walk outside for 1 minute".</li>
          <li><strong>Make it satisfying (reward)</strong>: Tick off today's habit in the app and watch your streak grow.</li>
        </ul>

        <h2>Three Ready-to-Use Micro Habit Designs</h2>
        <ol>
          <li><strong>Reading</strong>: Not "30 pages a day", but "1 page a day". Then mark it done in the app.</li>
          <li><strong>Sleeping earlier</strong>: Not "asleep by 11pm", but "phone off and in bed by 11pm". Sleep time can improve later.</li>
          <li><strong>Writing</strong>: Not "1000 words a day", but "open the document and write 1 sentence, even if it's bad".</li>
        </ol>

        <h2>Why Micro Habits Are Easier to Stick To</h2>
        <p>Micro habits bypass the brain's "cost evaluation". "Write 1000 words" feels heavy; "write one sentence" feels easy. That makes starting easier, and once you've started, you're likely to do more.</p>

        <h2>Implementing Your Atomic Habits with Tiny Habits App</h2>
        <p>In Tiny Habits App you can:</p>
        <ol>
          <li>Set an <strong>absurdly small</strong> starting point for each goal (1 page, 1 sentence, 1 minute).</li>
          <li>Use habit stacking to attach it to existing behaviors (after brushing teeth, after dinner, before shutting down your laptop).</li>
          <li>Track streaks and visualize progress to feel the true "compound interest" of habits.</li>
        </ol>
      `
    },
    category: 'habit',
    date: '2024-02-01',
    readTime: { zh: '9分钟', en: '9 min' },
    image: 'https://images.unsplash.com/photo-1614813231574-843cb1fb940b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QXRvbWljJTIwSGFiaXRzfGVufDB8fDB8fHww',
    featured: true
  },
  {
    id: 8,
    title: { 
      zh: 'BJ Fogg 行为模型：B=MAP，帮你设计不会失败的好习惯', 
      en: 'BJ Fogg Behavior Model: B=MAP, Design Habits That Don’t Fail' 
    },
    excerpt: { 
      zh: '行为=动机×能力×提示。这篇文章用 BJ Fogg 的行为模型拆解你为什么总是坚持不下去，并给出 3 个按图索骥的微习惯模板。', 
      en: 'Behavior = Motivation × Ability × Prompt. This article uses BJ Fogg’s model to explain why habits fail and gives three plug-and-play micro habit templates.' 
    },
    content: {
      zh: `
        <h2>什么是 B=MAP 行为模型？</h2>
        <p>行为（Behavior）只有在同时满足三个条件时才会发生：<strong>动机（Motivation）</strong>、<strong>能力（Ability）</strong> 和 <strong>提示（Prompt）</strong>。任意一项缺失，行为就不会持续。</p>

        <h2>为什么你总是坚持不下去？</h2>
        <ul>
          <li><strong>只有动机，没有能力</strong>：你很想早起，但晚上刷手机到 2 点。</li>
          <li><strong>有能力，没有提示</strong>：你会冥想，但每天都“忘记做”。</li>
          <li><strong>有提示，但能力门槛太高</strong>：App 提醒你运动，但你给自己设的是“跑 5 公里”。</li>
        </ul>

        <h2>用微习惯同时解决 MAP 三个维度</h2>
        <ol>
          <li><strong>降低能力门槛</strong>：把习惯缩小到 30 秒内能完成，比如“只做 2 个俯卧撑”。</li>
          <li><strong>提前设计好提示</strong>：用“如果-那么”的形式绑定触发点：“如果我刷完牙，那么我就做 2 个俯卧撑。”</li>
          <li><strong>用情绪当奖励</strong>：每次完成后，刻意给自己一点小庆祝，让大脑知道“这件事是好的”。</li>
        </ol>

        <h2>三个基于 B=MAP 的微习惯模板</h2>
        <ul>
          <li><strong>提升专注</strong>：如果我坐到书桌前，那么我就先专注 1 分钟不看手机。</li>
          <li><strong>开始运动</strong>：如果我下班回家脱鞋，那么我就做 3 个深蹲。</li>
          <li><strong>改善心情</strong>：如果我泡好咖啡，那么我就写下今天一件值得感恩的小事。</li>
        </ul>

        <h2>在小习惯 App 里如何配置？</h2>
        <p>你可以为每个习惯单独设置：</p>
        <ol>
          <li>描述中写清楚“如果…那么…”的触发逻辑。</li>
          <li>把目标设得足够小，完成率要接近 100%。</li>
          <li>用提醒和小组件保持“提示”在线，但不要太吵。</li>
        </ol>
        <p>当你理解了 B=MAP，你就不再骂自己“不够自律”，而是开始像产品经理一样，<strong>重新设计自己的行为系统</strong>。</p>
      `,
      en: `
        <h2>What is the B=MAP Model?</h2>
        <p>A behavior only happens when three elements come together: <strong>Motivation</strong>, <strong>Ability</strong>, and a <strong>Prompt</strong>. If any one is missing, the behavior won’t stick.</p>

        <h2>Why Your Habits Keep Failing</h2>
        <ul>
          <li><strong>Motivation without ability</strong>: You want to wake up early but scroll your phone until 2am.</li>
          <li><strong>Ability without prompt</strong>: You know how to meditate but keep “forgetting” to do it.</li>
          <li><strong>Prompt with too high ability bar</strong>: The app reminds you to exercise, but your goal is “run 5km”.</li>
        </ul>

        <h2>Using Micro Habits to Cover All MAP Elements</h2>
        <ol>
          <li><strong>Lower the ability bar</strong>: Shrink the habit to something you can do in 30 seconds, like “2 push-ups”.</li>
          <li><strong>Pre-design prompts</strong>: Use “if-then” triggers: “If I finish brushing my teeth, then I do 2 push-ups.”</li>
          <li><strong>Use emotion as reward</strong>: Celebrate a bit after each completion so your brain tags the behavior as positive.</li>
        </ol>

        <h2>Three MAP-Based Micro Habit Templates</h2>
        <ul>
          <li><strong>Improve focus</strong>: If I sit at my desk, then I focus for 1 minute without checking my phone.</li>
          <li><strong>Start exercising</strong>: If I take off my shoes after work, then I do 3 squats.</li>
          <li><strong>Lift mood</strong>: If I pour my coffee, then I write one thing I’m grateful for today.</li>
        </ul>

        <h2>How to Configure This in Tiny Habits App</h2>
        <p>For each habit, you can:</p>
        <ol>
          <li>Write the “if-then” trigger directly into the habit description.</li>
          <li>Set the goal so small that your completion rate is near 100%.</li>
          <li>Use gentle reminders and widgets to keep prompts visible without being noisy.</li>
        </ol>
        <p>Once you understand B=MAP, you stop blaming yourself for “not being disciplined enough” and start <strong>redesigning your behavior system like a product manager</strong>.</p>
      `
    },
    category: 'self-discipline',
    date: '2024-02-05',
    readTime: { zh: '8分钟', en: '8 min' },
    image: 'https://images.unsplash.com/photo-1619251598810-b086ea2c030a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEF0b21pYyUyMEhhYml0c3xlbnwwfHwwfHx8MA%3D%3D',
    featured: false
  },
  {
    id: 9,
    title: { 
      zh: '让习惯自动发生：环境设计与习惯叠加的实战指南', 
      en: 'Make Habits Happen Automatically: A Practical Guide to Environment Design & Habit Stacking' 
    },
    excerpt: { 
      zh: '靠毅力坚持很累，靠环境和流程就轻松多了。这篇文章教你用环境设计和习惯叠加，让好习惯变成“顺手就做”的默认选项。', 
      en: 'Willpower is exhausting; environment and routines are easier. This article teaches you to use environment design and habit stacking so good habits become your default choice.' 
    },
    content: {
      zh: `
        <h2>为什么只靠意志力总是失败？</h2>
        <p>当一个习惯每次都需要你“想一想、挣扎一下”才能开始，它就很难长期存在。真正可持续的好习惯，都是被<strong>环境</strong>和<strong>流程</strong>托起来的，而不是被意志力硬撑着。</p>

        <h2>环境设计：让好习惯变容易，坏习惯变麻烦</h2>
        <ul>
          <li><strong>把阻力移到坏习惯那边</strong>：想少刷短视频，就把 App 移到第二页文件夹里，并关掉自动登录。</li>
          <li><strong>把助力放在好习惯这边</strong>：想晨跑，就提前一晚把衣服和鞋子放在床边。</li>
          <li><strong>用“视觉提示”替代“脑子记”</strong>：在书桌上放一本已经翻开的书，在厨房台面放好水杯。</li>
        </ul>

        <h2>习惯叠加：在旧习惯的“钩子”上挂新习惯</h2>
        <p>习惯叠加的公式是：<strong>在我完成【旧习惯】之后，我立刻做【新习惯】</strong>。</p>
        <ul>
          <li>刷牙后 → 做 5 次深呼吸。</li>
          <li>泡好咖啡后 → 打开小习惯 App 看一下今天的任务。</li>
          <li>下班关电脑后 → 写下明天最重要的 3 件事。</li>
        </ul>

        <h2>一个完整的“早起仪式”示例</h2>
        <ol>
          <li>前一晚把手机放在远离床的地方（环境设计）。</li>
          <li>早上闹钟响 → 起床走过去关（被迫起床）。</li>
          <li>关闹钟后 → 立刻喝一杯水（习惯叠加 1）。</li>
          <li>喝完水 → 打开小习惯 App，勾掉“早起+喝水”（习惯叠加 2 + 奖励）。</li>
          <li>如果状态不错，再选择多加 5 分钟拉伸或冥想（可选超额完成）。</li>
        </ol>

        <h2>在小习惯 App 中落地你的“自动化习惯系统”</h2>
        <p>你可以这样设置：</p>
        <ol>
          <li>习惯名称里写清楚触发场景，比如“刷牙后做 5 下深呼吸”。</li>
          <li>把每一步都做得非常小，让它更像一个“顺手动作”而不是“任务”。</li>
          <li>用打卡记录整个“流程链条”，而不是单个孤立行为。</li>
        </ol>
        <p>当环境和流程都站在你这边时，<strong>好习惯会变成“默认选项”，而不是“需要努力争取的选择”</strong>。</p>
      `,
      en: `
        <h2>Why Willpower Alone Keeps Failing</h2>
        <p>If every habit requires you to "think, struggle, then start", it won’t last. Sustainable habits are carried by <strong>environment</strong> and <strong>routines</strong>, not held up by willpower alone.</p>

        <h2>Environment Design: Make Good Habits Easy, Bad Habits Hard</h2>
        <ul>
          <li><strong>Move friction to bad habits</strong>: To watch less short videos, move the app to a folder on page two and turn off auto-login.</li>
          <li><strong>Move support to good habits</strong>: To run in the morning, lay out clothes and shoes the night before.</li>
          <li><strong>Use visual cues instead of memory</strong>: Put an open book on your desk; place a water cup on the kitchen counter.</li>
        </ul>

        <h2>Habit Stacking: Hook New Habits onto Old Ones</h2>
        <p>The formula: <strong>After I do [existing habit], I immediately do [new habit].</strong></p>
        <ul>
          <li>After brushing teeth → take 5 deep breaths.</li>
          <li>After making coffee → open Tiny Habits App to check today’s tasks.</li>
          <li>After shutting down your work laptop → write down the top 3 tasks for tomorrow.</li>
        </ul>

        <h2>A Complete “Morning Ritual” Example</h2>
        <ol>
          <li>Place your phone away from the bed the night before (environment design).</li>
          <li>Alarm rings → you must get up to turn it off.</li>
          <li>After turning off alarm → drink a glass of water (habit stack 1).</li>
          <li>After drinking water → open Tiny Habits App and tick “wake up + water” (habit stack 2 + reward).</li>
          <li>If you feel good, optionally add 5 minutes of stretching or meditation (optional overachievement).</li>
        </ol>

        <h2>Implementing Your “Automatic Habit System” in Tiny Habits App</h2>
        <p>You can:</p>
        <ol>
          <li>Write the trigger scenario into the habit name, e.g. “5 deep breaths after brushing teeth”.</li>
          <li>Keep each step tiny so it feels like a “natural move” instead of a “task”.</li>
          <li>Track the whole chain as a routine instead of isolated behaviors.</li>
        </ol>
        <p>When environment and routines are on your side, <strong>good habits become the default, not something you must fight for</strong>.</p>
      `
    },
    category: 'habit',
    date: '2024-02-10',
    readTime: { zh: '10分钟', en: '10 min' },
    image: 'https://plus.unsplash.com/premium_photo-1673548916457-400cca78a210?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QXRvbWljJTIwSGFiaXRzfGVufDB8fDB8fHww',
    featured: false
  },
  {
    id: 10,
    title: { 
      zh: '如何用积分奖励系统培养孩子好习惯，而不是“用奖品威胁”', 
      en: 'How to Use a Points Reward System to Build Kids’ Habits (Without Overusing Prizes)' 
    },
    excerpt: { 
      zh: '很多家长一提到培养孩子的习惯，就想到“奖励”和“惩罚”。这篇文章会用小习惯 Tiny Habits Tracker 的积分系统为例，聊聊如何通过适当激励、亲子约定和长期反馈，帮孩子养成自律，而不是变成“没有奖励就不做事”。', 
      en: 'Many parents think of rewards and punishments when building kids’ habits. Using Tiny Habits Tracker’s points system as an example, this article shows how to use gentle incentives, clear agreements and long-term feedback to raise self-disciplined kids instead of reward-dependent ones.' 
    },
    content: {
      zh: `
        <h2>为什么培养孩子习惯不能“全靠奖励”？</h2>
        <p>在搜索“如何培养孩子好习惯不靠打骂”的时候，你可能已经看到很多建议：多鼓励、少批评、用奖励代替惩罚。但如果<strong>所有事情都要有奖品</strong>，孩子很容易变成：没有奖励就不愿意做事。</p>
        <p>真正科学的儿童习惯养成方法，是在<strong>外在激励</strong>和<strong>内在动机</strong>之间找到平衡——既让孩子感到被肯定，又慢慢把“我为了奖励去做”变成“我因为这是对自己好而去做”。</p>

        <h2>小习惯 Tiny Habits Tracker：用积分代替“即时大礼”</h2>
        <p>小习惯（Tiny Habits Tracker）内置了一个简单好用的<strong>亲子积分奖励系统</strong>：</p>
        <ul>
          <li>每天完成约定的习惯（比如按时刷牙、写完作业、睡前自己收拾房间），孩子就可以在 App 里<strong>获得对应积分</strong>。</li>
          <li>积分不是马上兑换，而是<strong>累计到一定数额</strong>，再和家长一起选择奖励。</li>
          <li>奖励可以是<strong>体验型</strong>（比如去迪士尼乐园、周末亲子露营），也可以是孩子特别想要的礼物（球鞋、玩具、绘本）。</li>
        </ul>
        <p>这种“先积分、再兑换”的方式，比起每次做完就立刻给奖品，更像一个<strong>长期目标</strong>，也更接近成年人的世界（工作拿绩效、储蓄攒利息）。</p>

        <h2>家长和孩子如何一起设计“积分规则”？</h2>
        <p>为了让积分奖励系统真正帮助孩子建立自律，而不是变成讨价还价工具，建议你在使用前和孩子一起做三件事：</p>
        <ol>
          <li><strong>先选 3 个最重要的习惯，而不是 30 个</strong>  
            从“刷牙、写作业、整理书包、练琴、阅读、运动……”里，选出 2–3 件你们当前最在意的事。习惯太多，孩子会觉得永远完成不了。</li>
          <li><strong>给每个习惯设置清晰、可量化的标准</strong>  
            比如“睡前自己刷牙 2 分钟”“晚饭后 30 分钟内坐到书桌前写作业”“每天读书 10 分钟并在小习惯里打卡”。</li>
          <li><strong>和孩子一起决定“多少分换什么”</strong>  
            比如：100 分换一次电影院家庭观影，300 分换一次迪士尼，500 分可以选择一双心仪的球鞋。过程要让孩子<strong>参与决策</strong>，而不是单向宣布。</li>
        </ol>

        <h2>长尾问题：如何防止孩子对奖励“上瘾”？</h2>
        <p>在“用积分奖励孩子好习惯”的过程中，很多家长会遇到这些困惑：</p>
        <ul>
          <li>孩子习惯变好了，但一停奖励就立刻“打回原形”？</li>
          <li>孩子只愿意做有积分的事，不愿意做日常家务？</li>
          <li>积分越设越高，奖品越来越贵，家长压力很大？</li>
        </ul>
        <p>要避免这些问题，可以在小习惯 App 的使用中刻意设计几个阶段：</p>
        <ol>
          <li><strong>第 1 阶段：用积分帮孩子“开始行动”</strong>  
            这一阶段的重点是<strong>让行为发生</strong>，比如每天按时写作业、按顺序完成睡前流程，孩子每完成一次就能看到积分上涨，感受到正向反馈。</li>
          <li><strong>第 2 阶段：逐步减少对物质奖励的强调</strong>  
            当孩子已经做到“基本稳定”时，可以开始加入更多<strong>精神性奖励</strong>（贴纸、排行榜、成就徽章），并且在对话中多强调“你真的越来越自律了”。</li>
          <li><strong>第 3 阶段：把“奖励对象”从结果变成过程</strong>  
            比如不再只在“分数达标时”庆祝，而是在孩子“主动开始写作业”“自己提醒刷牙”时及时表扬，帮助他把自豪感和行为本身绑定。</li>
        </ol>

        <h2>实操示例：用积分系统培养 7–12 岁孩子的学习与生活习惯</h2>
        <p>下面是一个可以直接参考的“亲子习惯积分表”，特别适合在 Google 上经常被搜索的场景：<strong>如何培养小学生自律、如何让孩子主动写作业、如何用正向激励代替吼叫</strong>。</p>
        <ul>
          <li><strong>学习类习惯</strong>：按时坐到书桌前（5 分）、当天作业完成并在 App 中打卡（10 分）、额外阅读 15 分钟（5 分）。</li>
          <li><strong>生活类习惯</strong>：睡前自己收拾房间 5 分钟（5 分）、早起后自己叠被子（5 分）、饭前洗手不提醒（5 分）。</li>
          <li><strong>品格类习惯</strong>：主动帮家人做家务（10 分）、在学校帮助同学（家长回家后沟通记录，10 分）。</li>
        </ul>
        <p>你可以在小习惯 Tiny Habits Tracker 中把这些习惯添加为每日任务，让孩子每天打开 App 勾选，一方面获得积分，一方面看到自己连续打卡的天数。</p>

        <h2>把“奖励”变成一次次亲子对话的机会</h2>
        <p>真正高质量的亲子积分奖励系统，并不是简单地“刷牙=1 分，写作业=2 分”，而是把每一次兑换奖励，都变成一次<strong>复盘和鼓励</strong>：</p>
        <ul>
          <li>一起回顾这段时间孩子坚持了哪些事情；</li>
          <li>请孩子自己说说：哪一个习惯对他最有帮助；</li>
          <li>讨论下一个阶段要继续保持什么、可以尝试新增什么小目标。</li>
        </ul>
        <p>当孩子逐渐从“为了礼物而坚持”，走向“为了成为更好的自己而坚持”，你就真正用好了一套既温和又有边界的积分奖励系统。</p>

        <h2>小结：奖励是辅助，自律才是终点</h2>
        <p>培养孩子的习惯，永远不应该只依赖奖惩。<strong>奖励只是一个启动器</strong>，真正让孩子受益一生的，是他在一个个小习惯中练出来的自律感、胜任感和自我认同。</p>
        <p>如果你正在寻找“如何科学地培养孩子好习惯”的方法，不妨从今天开始，和孩子一起在小习惯 Tiny Habits Tracker 里，搭建你们自己的亲子积分系统——从一件小事开始，但朝着很长的未来走。</p>
      `,
      en: `
        <h2>Why Kids’ Habits Shouldn’t Rely 100% on Rewards</h2>
        <p>When parents search for “how to build good habits for kids without yelling or punishment”, they are usually told to “use rewards instead”. But if <strong>every behavior must be paid with a prize</strong>, kids quickly learn: no reward, no action.</p>
        <p>Healthy habit building for children means balancing <strong>external rewards</strong> and <strong>internal motivation</strong> – using incentives at the beginning, then slowly shifting towards “I do this because it’s good for me”.</p>

        <h2>Using Tiny Habits Tracker Points Instead of One-Off Prizes</h2>
        <p>Tiny Habits Tracker (小习惯) has a built-in <strong>points reward system for families</strong>:</p>
        <ul>
          <li>Kids earn points every time they complete agreed routines: brushing teeth, finishing homework, tidying their room before bed.</li>
          <li>Points are <strong>saved and accumulated</strong> instead of triggering an instant gift each time.</li>
          <li>Rewards can be <strong>experiences</strong> (Disney trip, weekend camping) or specific gifts kids really want (sneakers, toys, books).</li>
        </ul>
        <p>This “collect points → redeem later” model is closer to real life (salary and bonuses, savings and interest) and works better for long-term habit building than constant small prizes.</p>

        <h2>Designing the Rules Together with Your Child</h2>
        <ol>
          <li><strong>Start with 2–3 key habits, not everything at once</strong> – focus on what matters most now: homework, bedtime routine, or morning routine.</li>
          <li><strong>Make each habit concrete and measurable</strong> – “brush teeth for 2 minutes before bed”, “sit at desk within 30 minutes after dinner”, “read for 10 minutes and tick it in the app”.</li>
          <li><strong>Decide the points and rewards together</strong> – for example: 100 points for a movie night, 300 points for a theme park trip, 500 points for a pair of sneakers.</li>
        </ol>

        <h2>Avoiding Common Problems with Kids’ Reward Systems</h2>
        <p>Many parents worry that a points system will make kids addicted to rewards. To avoid this, you can plan three stages:</p>
        <ol>
          <li><strong>Stage 1: Use points to help them start</strong> – focus on making the behavior happen regularly.</li>
          <li><strong>Stage 2: Shift towards emotional and symbolic rewards</strong> – badges, streaks, praise and recognition.</li>
          <li><strong>Stage 3: Reward the process, not just the outcome</strong> – celebrate when kids take initiative, not only when they “hit the target”.</li>
        </ol>

        <h2>Practical Example: A Simple Points Table for 7–12 Year Olds</h2>
        <p>For SEO friendly long-tail topics like “how to build self-discipline in primary school kids” or “positive parenting reward system”, here is a simple structure:</p>
        <ul>
          <li><strong>Study habits</strong>: on-time homework start, daily reading, daily review.</li>
          <li><strong>Life habits</strong>: tidying room, making bed, washing hands before meals.</li>
          <li><strong>Character habits</strong>: helping family, being kind at school, taking responsibility.</li>
        </ul>
        <p>You can set these as daily habits in Tiny Habits Tracker so your child can tick them off, see their streak, and watch points grow.</p>

        <h2>From Rewards to Real Self-Discipline</h2>
        <p>Rewards are a <strong>tool</strong>, not the final goal. The real win is when your child begins to say “I want to do this because it makes me proud”, not just “what do I get for it?”.</p>
        <p>If you are looking for a gentle, science-based way to build your child’s routines, start today by setting up a small points system in Tiny Habits Tracker – one small habit at a time, towards a much bigger future.</p>
      `
    },
    category: 'habit',
    date: '2025-12-02',
    readTime: { zh: '11分钟', en: '11 min' },
    image: 'https://images.unsplash.com/photo-1613186420419-868111e7ac07?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFyZW50JTIwYW5kJTIwY2hpbGR8ZW58MHx8MHx8fDA%3D',
    featured: true
  }
]

// 根据ID获取文章
export const getPostById = (id) => {
  return blogPosts.find(post => post.id === parseInt(id))
}

// 根据分类获取文章
export const getPostsByCategory = (category) => {
  if (category === 'all') return blogPosts
  return blogPosts.filter(post => post.category === category)
}

