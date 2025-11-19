// 多语言翻译配置

export const translations = {
  zh: {
    // Hero 区域
    hero: {
      title: '小习惯',
      subtitle: '更轻松地养成习惯',
      description: '基于微习惯方法 + AI 教练的极简习惯养成工具',
      tagline: '每天 1 分钟也能坚持，让改变从微小开始',
      downloadIOS: 'App Store 下载',
      downloadAndroid: 'Android 下载（Coming Soon）',
      stats: {
        users: '活跃用户',
        checkins: '习惯打卡',
        rating: '用户评分'
      },
      scrollHint: '向下滚动探索更多'
    },

    // Features 区域
    features: {
      title: '为什么选择小习惯？',
      subtitle: '六大核心功能，让习惯养成更科学、更有趣',
      items: [
        {
          title: '微习惯法则',
          description: '每天 1 分钟也能坚持，降低行动门槛，让习惯养成变得轻而易举'
        },
        {
          title: 'AI 智能教练',
          description: '根据你的完成情况自动调整计划，提供个性化建议和鼓励'
        },
        {
          title: '专注计时器',
          description: '番茄钟、正计时、倒计时，学习、减肥、阅读都适用'
        },
        {
          title: '戒除坏习惯',
          description: '记录触发时间和场景，可视化查看已经多久没做，强化戒断动力'
        },
        {
          title: '游戏化养成',
          description: '完成习惯获得营养值，养成虚拟植物，让坚持变得更有趣'
        },
        {
          title: '多端同步',
          description: '基于 CloudKit 的无缝同步，iPhone、iPad、Mac 数据实时同步'
        }
      ]
    },

    // User Stories 区域
    userStories: {
      title: '真实用户故事',
      subtitle: '看看他们如何通过小习惯改变生活',
      labels: {
        goal: '目标',
        challenge: '挑战',
        solution: '解决方案',
        result: '效果'
      },
      stats: {
        days: '坚持天数',
        sessions: '完成次数',
        hours: '专注时长',
        habits: '习惯数量',
        completion: '完成率',
        weight: '体重变化',
        bodyFat: '体脂变化'
      },
      stories: [
        {
          role: '上班族',
          name: 'Shelly',
          goal: '减肥健身，改善身体状态',
          challenge: '工作忙碌，经常加班，没时间运动',
          solution: '设置「每天走 8000 步」「喝 8 杯水」「睡前拉伸 5 分钟」',
          result: '3 个月减重 12 斤，体脂率下降 5%，精神状态明显改善',
          chartType: '体重变化折线图'
        },
        {
          role: '全职妈妈',
          name: '王女士',
          goal: '培养孩子的阅读和整理习惯',
          challenge: '孩子总是拖延，不愿意主动完成任务',
          solution: '为孩子设置「每天阅读 10 分钟」「睡前整理书包」等微习惯',
          result: '30 天后，孩子开始主动阅读，房间也变得整洁有序',
          chartType: '打卡热力图'
        },
        {
          role: '大学生',
          name: '小李',
          goal: '提升专注力，提高学习效率',
          challenge: '总是忍不住刷手机，注意力难以集中',
          solution: '使用小习惯的番茄钟功能，每天完成 4 次 25 分钟专注学习',
          result: '坚持 60 天后，期末成绩从班级中游提升到前 10%',
          chartType: '专注时长折线图'
        }
      ]
    },

    // Charts 区域
    charts: {
      title: '数据驱动改变',
      subtitle: '可视化你的进步，让坚持看得见',
      streakChart: {
        title: '连续坚持天数',
        subtitle: '平均用户坚持曲线',
        insight: '使用微习惯法则，82% 的用户能坚持超过 90 天'
      },
      completionChart: {
        title: '习惯完成率',
        subtitle: '用户习惯完成情况分布',
        insight: '85% 的高完成率，远超传统习惯养成方式',
        labels: {
          completed: '已完成',
          inProgress: '进行中',
          abandoned: '已放弃'
        }
      },
      categoryChart: {
        title: '最受欢迎的习惯类型',
        subtitle: '不同习惯类型的用户数量（单位：人）',
        insight: '运动健身是最受欢迎的习惯类型，其次是学习阅读'
      },
      highlights: {
        retention: '90天留存率',
        avgHabits: '平均习惯数',
        dailyTime: '日均使用时长',
        totalCheckins: '累计打卡次数'
      }
    },

    // Testimonials 区域
    testimonials: {
      title: '用户真实评价',
      subtitle: '10 万+ 用户的共同选择',
      appStoreRating: 'App Store 评分',
      basedOn: '基于 10,000+ 用户评价',
      items: [
        {
          name: '李明',
          role: '产品经理',
          content: '我以前从来坚持不了早睡，试过各种方法都失败了。用了小习惯的微习惯法则，从每天提前 5 分钟上床开始，现在已经坚持 60 天了！真的太神奇了。',
          highlight: '坚持 60 天早睡'
        },
        {
          name: '王芳',
          role: '全职妈妈',
          content: '孩子每天主动阅读 10 分钟，我简直不敢相信！以前怎么催都不愿意看书，现在用小习惯的游戏化功能，他每天都抢着去完成任务。',
          highlight: '孩子主动阅读'
        },
        {
          name: '张伟',
          role: '程序员',
          content: '作为一个长期久坐的程序员，我用小习惯养成了每天运动的习惯。从每天 5 个深蹲开始，现在已经能跑 5 公里了。AI 教练的建议非常贴心。',
          highlight: '从 5 个深蹲到 5 公里'
        },
        {
          name: '刘娜',
          role: '自由职业者',
          content: '专注计时器太好用了！以前总是拖延，现在用番茄钟工作，效率提升了至少 50%。而且界面很简洁，不会让人分心。',
          highlight: '效率提升 50%'
        },
        {
          name: '陈浩',
          role: '大学生',
          content: '戒掉了刷短视频的习惯！每次想刷的时候就打开小习惯记录一下，看到自己已经坚持了这么多天，就不想破功了。现在有更多时间学习了。',
          highlight: '成功戒除短视频'
        },
        {
          name: '赵敏',
          role: '小白领',
          content: '减肥成功了！用小习惯记录每天的运动和饮食，3 个月减了 15 斤。数据可视化让我清楚地看到自己的进步，特别有成就感。',
          highlight: '3 个月减重 15 斤'
        }
      ]
    },

    // Download 区域
    download: {
      title: '现在就开始你的下一次改变',
      subtitle: '加入 10 万+ 用户，用微习惯改变生活',
      downloadIOS: '从 App Store 下载',
      downloadAndroid: 'Android 版（即将推出）',
      scanIOS: '扫码下载 iOS 版',
      scanAndroid: 'Android 版（即将推出）',
      features: [
        {
          title: '隐私安全',
          description: '数据加密，不会泄露隐私'
        },
        {
          title: '云端同步',
          description: '多设备无缝同步数据'
        }
      ]
    },

    // Footer 区域
    footer: {
      description: '基于微习惯方法 + AI 教练的极简习惯养成工具。让改变从微小开始，让坚持变得轻松。',
      quickLinks: '快速链接',
      legal: '法律信息',
      links: {
        features: '功能特点',
        stories: '用户故事',
        charts: '数据统计',
        download: '立即下载',
        privacy: '隐私政策',
        terms: '用户协议',
        contact: '联系我们'
      },
      copyright: '保留所有权利。',
      madeWith: 'Made with ❤️ for better habits',
      icp: 'ICP备案号：京ICP备xxxxxxxx号'
    },

    // 通用
    common: {
      readMore: '了解更多',
      learnMore: '查看详情',
      comingSoon: 'Coming Soon',
      placeholder: '占位图',
      chartPlaceholder: '图表占位'
    }
  },

  en: {
    // Hero Section
    hero: {
      title: 'Tiny Habits',
      subtitle: 'Build Habits Effortlessly',
      description: 'Minimalist habit tracker powered by Micro Habits Method + AI Coach',
      tagline: 'Even 1 minute a day counts. Start small, achieve big.',
      downloadIOS: 'Download on App Store',
      downloadAndroid: 'Android (Coming Soon)',
      stats: {
        users: 'Active Users',
        checkins: 'Habit Check-ins',
        rating: 'User Rating'
      },
      scrollHint: 'Scroll to explore more'
    },

    // Features Section
    features: {
      title: 'Why Choose Tiny Habits?',
      subtitle: 'Six core features to make habit building scientific and fun',
      items: [
        {
          title: 'Micro Habits Method',
          description: 'Even 1 minute a day works. Lower the barrier, make habit building effortless'
        },
        {
          title: 'AI Smart Coach',
          description: 'Auto-adjust plans based on your progress, provide personalized suggestions'
        },
        {
          title: 'Focus Timer',
          description: 'Pomodoro, countdown, stopwatch - perfect for study, fitness, reading'
        },
        {
          title: 'Break Bad Habits',
          description: 'Track triggers and visualize how long you\'ve stayed clean'
        },
        {
          title: 'Gamification',
          description: 'Earn nutrients to grow virtual plants, make persistence fun'
        },
        {
          title: 'Multi-Device Sync',
          description: 'Seamless CloudKit sync across iPhone, iPad, and Mac'
        }
      ]
    },

    // User Stories Section
    userStories: {
      title: 'Real User Stories',
      subtitle: 'See how they changed their lives with Tiny Habits',
      labels: {
        goal: 'Goal',
        challenge: 'Challenge',
        solution: 'Solution',
        result: 'Result'
      },
      stats: {
        days: 'Days',
        sessions: 'Sessions',
        hours: 'Hours',
        habits: 'Habits',
        completion: 'Completion',
        weight: 'Weight',
        bodyFat: 'Body Fat'
      },
      stories: [
        {
          role: 'Office Worker',
          name: 'Shelly',
          goal: 'Lose weight and improve fitness',
          challenge: 'Busy work schedule, frequent overtime, no time for exercise',
          solution: 'Set "8000 steps daily", "8 glasses of water", "5-min stretch before bed"',
          result: 'Lost 6kg in 3 months, body fat down 5%, much better energy',
          chartType: 'Weight Change Chart'
        },
        {
          role: 'Stay-at-home Mom',
          name: 'Sarah',
          goal: 'Build reading and organizing habits for kids',
          challenge: 'Kids always procrastinate, unwilling to complete tasks',
          solution: 'Set micro habits: "Read 10 min daily", "Organize before bed"',
          result: 'After 30 days, kids started reading proactively and keeping room tidy',
          chartType: 'Check-in Heatmap'
        },
        {
          role: 'College Student',
          name: 'Alex',
          goal: 'Improve focus and study efficiency',
          challenge: 'Always distracted by phone, hard to concentrate',
          solution: 'Use Pomodoro timer, complete 4 sessions of 25-min focused study daily',
          result: 'After 60 days, grades improved from average to top 10%',
          chartType: 'Focus Time Chart'
        }
      ]
    },

    // Charts Section
    charts: {
      title: 'Data-Driven Change',
      subtitle: 'Visualize your progress, make persistence visible',
      streakChart: {
        title: 'Consecutive Days',
        subtitle: 'Average user persistence curve',
        insight: 'With Micro Habits Method, 82% users persist over 90 days'
      },
      completionChart: {
        title: 'Habit Completion Rate',
        subtitle: 'User habit completion distribution',
        insight: '85% high completion rate, far exceeding traditional methods',
        labels: {
          completed: 'Completed',
          inProgress: 'In Progress',
          abandoned: 'Abandoned'
        }
      },
      categoryChart: {
        title: 'Most Popular Habit Types',
        subtitle: 'Number of users by habit type',
        insight: 'Fitness is the most popular, followed by reading'
      },
      highlights: {
        retention: '90-day Retention',
        avgHabits: 'Avg Habits',
        dailyTime: 'Daily Usage',
        totalCheckins: 'Total Check-ins'
      }
    },

    // Testimonials Section
    testimonials: {
      title: 'User Reviews',
      subtitle: 'Trusted by 100K+ users',
      appStoreRating: 'App Store Rating',
      basedOn: 'Based on 10,000+ reviews',
      items: [
        {
          name: 'David',
          role: 'Product Manager',
          content: 'I could never stick to early sleep. Tried everything and failed. With Tiny Habits micro method, starting with 5 min earlier bedtime, I\'ve persisted for 60 days! Amazing.',
          highlight: '60 days early sleep'
        },
        {
          name: 'Emma',
          role: 'Stay-at-home Mom',
          content: 'My kid reads 10 minutes daily proactively now! Unbelievable! Used to resist no matter how I urged. Now with gamification, he rushes to complete tasks.',
          highlight: 'Proactive reading'
        },
        {
          name: 'James',
          role: 'Programmer',
          content: 'As a sedentary programmer, I built daily exercise habit with Tiny Habits. Started with 5 squats, now running 5km. AI coach suggestions are very thoughtful.',
          highlight: '5 squats to 5km'
        },
        {
          name: 'Sophia',
          role: 'Freelancer',
          content: 'Focus timer is amazing! Used to procrastinate, now using Pomodoro, efficiency up 50%+. Interface is clean, no distractions.',
          highlight: '50% efficiency boost'
        },
        {
          name: 'Ryan',
          role: 'College Student',
          content: 'Quit short videos! When tempted, I open Tiny Habits to log. Seeing my streak, I don\'t want to break it. Now have more time to study.',
          highlight: 'Quit short videos'
        },
        {
          name: 'Olivia',
          role: 'Office Worker',
          content: 'Lost weight successfully! Tracked exercise and diet with Tiny Habits, lost 7.5kg in 3 months. Data visualization shows my progress clearly, very fulfilling.',
          highlight: '7.5kg in 3 months'
        }
      ]
    },

    // Download Section
    download: {
      title: 'Start Your Next Change Now',
      subtitle: 'Join 100K+ users, change your life with micro habits',
      downloadIOS: 'Download on App Store',
      downloadAndroid: 'Android (Coming Soon)',
      scanIOS: 'Scan to Download iOS',
      scanAndroid: 'Android (Coming Soon)',
      features: [
        {
          title: 'Privacy First',
          description: 'Encrypted data, no privacy leaks'
        },
        {
          title: 'Cloud Sync',
          description: 'Seamless sync across devices'
        }
      ]
    },

    // Footer Section
    footer: {
      description: 'Minimalist habit tracker powered by Micro Habits Method + AI Coach. Start small, make persistence easy.',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      links: {
        features: 'Features',
        stories: 'Stories',
        charts: 'Data',
        download: 'Download',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contact: 'Contact Us'
      },
      copyright: 'All rights reserved.',
      madeWith: 'Made with ❤️ for better habits',
      icp: 'ICP: 京ICP备xxxxxxxx号'
    },

    // Common
    common: {
      readMore: 'Read More',
      learnMore: 'Learn More',
      comingSoon: 'Coming Soon',
      placeholder: 'Placeholder',
      chartPlaceholder: 'Chart Placeholder'
    }
  }
}

