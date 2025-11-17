# 项目结构说明

## 📂 完整目录结构

```
website/
│
├── public/                          # 静态资源目录
│   ├── assets/                      # 图片资源（需要手动添加）
│   │   ├── app-screenshot.png      # App 截图
│   │   ├── chart-student.png       # 学生图表
│   │   ├── chart-parent.png        # 家长图表
│   │   ├── chart-worker.png        # 上班族图表
│   │   └── qrcode-ios.png         # iOS 二维码
│   └── favicon.svg                 # 网站图标 ✅
│
├── src/                            # 源代码目录
│   ├── components/                 # React 组件
│   │   ├── Hero.jsx               # 首屏 Banner ✅
│   │   ├── Features.jsx           # 功能亮点 ✅
│   │   ├── UserStories.jsx        # 用户故事 ✅
│   │   ├── Charts.jsx             # 数据图表 ✅
│   │   ├── Testimonials.jsx       # 用户评价 ✅
│   │   ├── Download.jsx           # 下载区域 ✅
│   │   └── Footer.jsx             # 页脚 ✅
│   │
│   ├── App.jsx                    # 主应用组件 ✅
│   ├── main.jsx                   # 入口文件 ✅
│   └── index.css                  # 全局样式 ✅
│
├── index.html                      # HTML 模板 ✅
├── package.json                    # 项目依赖 ✅
├── vite.config.js                 # Vite 配置 ✅
├── tailwind.config.js             # TailwindCSS 配置 ✅
├── postcss.config.js              # PostCSS 配置 ✅
├── netlify.toml                   # Netlify 部署配置 ✅
├── .gitignore                     # Git 忽略文件 ✅
│
├── README.md                      # 项目说明 ✅
├── DEPLOYMENT.md                  # 部署指南 ✅
├── ASSETS_CHECKLIST.md           # 资源清单 ✅
└── PROJECT_STRUCTURE.md          # 本文件 ✅
```

---

## 🎯 各模块功能说明

### 1. Hero 区域 (`Hero.jsx`)

**功能**: 首屏展示，吸引用户注意力

**包含元素**:
- 主标题："小习惯 · 更轻松地养成习惯"
- 副标题：产品定位
- 下载按钮（App Store + Android）
- 统计数据（用户数、打卡数、评分）
- App 截图展示
- 背景装饰效果

**动画效果**:
- 淡入动画 (fade-in)
- 手机浮动动画 (float)

---

### 2. Features 区域 (`Features.jsx`)

**功能**: 展示 App 的 6 大核心功能

**功能列表**:
1. 微习惯法则 - 降低行动门槛
2. AI 智能教练 - 个性化建议
3. 专注计时器 - 番茄钟功能
4. 戒除坏习惯 - 记录和可视化
5. 游戏化养成 - 虚拟植物
6. 多端同步 - CloudKit

**设计特点**:
- 卡片式布局
- 图标 + 标题 + 描述
- 悬浮效果
- 渐进式动画

---

### 3. UserStories 区域 (`UserStories.jsx`)

**功能**: 展示 3 个真实用户使用场景

**用户类型**:
1. **大学生** - 提升专注力
   - 目标：学习效率
   - 方案：番茄钟
   - 效果：成绩提升

2. **全职妈妈** - 培养孩子习惯
   - 目标：阅读和整理
   - 方案：微习惯
   - 效果：主动完成

3. **上班族** - 减肥健身
   - 目标：体重管理
   - 方案：运动打卡
   - 效果：减重成功

**展示形式**:
- 左右交替布局
- 用户信息 + 故事 + 数据
- 图表占位（可替换为真实图表）

---

### 4. Charts 区域 (`Charts.jsx`)

**功能**: 用数据可视化展示 App 效果

**图表类型**:
1. **折线图** - 连续坚持天数
   - 展示用户坚持曲线
   - 82% 用户坚持 90 天

2. **环形图** - 习惯完成率
   - 已完成：85%
   - 进行中：10%
   - 已放弃：5%

3. **柱状图** - 习惯类型分布
   - 运动健身、学习阅读等
   - 展示用户偏好

**技术实现**:
- 使用 Recharts 库
- 响应式设计
- 真实模拟数据

---

### 5. Testimonials 区域 (`Testimonials.jsx`)

**功能**: 展示用户真实评价

**包含内容**:
- 6 条用户评价
- 用户头像（emoji 占位）
- 5 星评分
- 用户身份标签
- 亮点标签

**用户类型**:
- 产品经理、妈妈、程序员
- 自由职业者、大学生、小白领

**App Store 评分展示**:
- 4.8 分
- 10,000+ 评价

---

### 6. Download 区域 (`Download.jsx`)

**功能**: 引导用户下载 App

**包含元素**:
- 大标题："现在就开始你的下一次改变"
- App Store 下载按钮
- Android 下载按钮（Coming Soon）
- iOS 二维码
- Android 二维码（占位）
- 3 个特性标签（免费、安全、同步）

**视觉效果**:
- 黄色渐变背景
- 背景模糊装饰
- 卡片式二维码展示

---

### 7. Footer 区域 (`Footer.jsx`)

**功能**: 页脚信息和链接

**包含内容**:
- Logo 和简介
- 社交媒体链接（微信、微博、小红书）
- 快速链接（功能、故事、下载等）
- 法律信息（隐私政策、用户协议）
- 联系方式
- 版权信息
- 备案号（占位）

---

## 🎨 设计系统

### 颜色方案

```css
主色：#FFCE00 (primary)     - 明亮黄色
深色：#1a1a1a (dark)        - 深灰黑色
白色：#FFFFFF               - 纯白
灰色：#9CA3AF, #E5E7EB     - 文字和边框
```

### 字体大小

```css
标题：text-4xl ~ text-7xl
副标题：text-xl ~ text-2xl
正文：text-base ~ text-lg
小字：text-sm ~ text-xs
```

### 间距系统

```css
组件间距：py-20 (80px)
卡片内边距：p-6 ~ p-8
元素间距：gap-4 ~ gap-12
```

### 圆角

```css
按钮：rounded-full
卡片：rounded-2xl ~ rounded-3xl
图片：rounded-2xl
```

### 阴影

```css
卡片：shadow-lg
悬浮：shadow-2xl
按钮：shadow-xl
```

---

## 🎬 动画效果

### 1. 淡入动画 (fade-in)
```css
@keyframes fadeIn {
  0% { opacity: 0 }
  100% { opacity: 1 }
}
```

### 2. 上滑动画 (slide-up)
```css
@keyframes slideUp {
  0% { transform: translateY(30px); opacity: 0 }
  100% { transform: translateY(0); opacity: 1 }
}
```

### 3. 浮动动画 (float)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-20px) }
}
```

### 4. 悬浮效果
```css
hover:shadow-2xl
hover:-translate-y-2
hover:scale-105
```

---

## 📱 响应式设计

### 断点

```css
sm: 640px   - 小屏手机
md: 768px   - 平板
lg: 1024px  - 笔记本
xl: 1280px  - 桌面
```

### 布局适配

- **移动端**: 单列布局
- **平板**: 2 列网格
- **桌面**: 3 列网格

### 字体适配

```jsx
<h1 className="text-5xl md:text-7xl">
  // 移动端 5xl，桌面端 7xl
</h1>
```

---

## 🔧 技术栈详解

### React 18
- 函数式组件
- Hooks（useState, useEffect）
- 组件化开发

### Vite 5
- 快速开发服务器
- 热模块替换 (HMR)
- 优化的生产构建

### TailwindCSS 3
- 实用优先的 CSS 框架
- 响应式设计
- 自定义主题

### Recharts 2
- React 图表库
- 响应式图表
- 丰富的图表类型

### Lucide React
- 现代图标库
- Tree-shakable
- 一致的设计风格

---

## 📊 性能优化

### 1. 代码分割
- Vite 自动进行代码分割
- 按需加载组件

### 2. 图片优化
- 使用 WebP 格式
- 压缩图片大小
- 懒加载图片

### 3. CSS 优化
- TailwindCSS 自动清除未使用的样式
- 生产构建自动压缩

### 4. 缓存策略
- Netlify 自动配置缓存
- 静态资源长期缓存

---

## 🔍 SEO 优化

### Meta 标签（在 index.html）

```html
<meta name="description" content="小习惯 - 基于微习惯方法 + AI 教练的极简习惯养成工具" />
<meta name="keywords" content="习惯养成,微习惯,AI教练,打卡,专注计时" />
<meta property="og:title" content="小习惯 · 更轻松地养成习惯" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/assets/logo.png" />
```

### 语义化 HTML
- 使用 `<section>`, `<header>`, `<footer>`
- 正确的标题层级（h1, h2, h3）
- Alt 文本描述图片

---

## 🚀 下一步

1. ✅ 安装依赖：`npm install`
2. ✅ 启动开发：`npm run dev`
3. 📸 准备图片资源（见 ASSETS_CHECKLIST.md）
4. 🎨 替换占位图为真实图片
5. 🔗 更新 App Store 下载链接
6. 📊 添加 Google Analytics（可选）
7. 🚀 部署到 Netlify（见 DEPLOYMENT.md）

---

有问题？请查看 README.md 或 DEPLOYMENT.md

