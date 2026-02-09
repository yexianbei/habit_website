export const mockDecks = [
  {
    id: 'english-101',
    title: '英语四级核心词',
    desc: '高频考点词汇',
    icon: '📚',
    total: 50,
    due: 12,
    color: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-200'
  },
  {
    id: 'law-civil',
    title: '民法典法条',
    desc: '物权编重点',
    icon: '⚖️',
    total: 120,
    due: 25,
    color: 'from-rose-500 to-orange-500',
    shadow: 'shadow-orange-200'
  },
  {
    id: 'history-cn',
    title: '中国近代史',
    desc: '重要事件年代',
    icon: '🏯',
    total: 30,
    due: 5,
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-200'
  },
  {
    id: 'code-js',
    title: 'JavaScript 基础',
    desc: 'ES6+ 核心概念',
    icon: '💻',
    total: 45,
    due: 8,
    color: 'from-amber-400 to-yellow-500',
    shadow: 'shadow-yellow-200'
  }
];

export const mockCards = {
  'english-101': [
    { id: 1, front: 'Abandon', back: 'vt. 放弃，抛弃' },
    { id: 2, front: 'Ability', back: 'n. 能力，才干' },
    { id: 3, front: 'Abnormal', back: 'adj. 反常的，变态的' },
    { id: 4, front: 'Absolute', back: 'adj. 绝对的，完全的' },
    { id: 5, front: 'Absorb', back: 'vt. 吸收；同化' }
  ],
  'law-civil': [
    { id: 1, front: '物权法定原则', back: '物权的种类和内容，由法律规定。' },
    { id: 2, front: '不动产物权变动', back: '不动产物权的设立、变更、转让和消灭，经依法登记，发生效力；未经登记，不发生效力，但法律另有规定的除外。' }
  ],
  'history-cn': [
    { id: 1, front: '鸦片战争爆发时间', back: '1840年' },
    { id: 2, front: '辛亥革命时间', back: '1911年' }
  ],
  'code-js': [
    { id: 1, front: 'Closure (闭包)', back: '一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包。' },
    { id: 2, front: 'Hoisting (变量提升)', back: 'JavaScript 引擎在执行代码之前，会将变量和函数的声明移动 to the top of their scope。' }
  ]
};
