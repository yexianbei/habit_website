# 小习惯 App 官方网站

这是"小习惯 App"的官方展示网站，基于 React + Vite + TailwindCSS 构建。

## 📋 项目结构

```
website/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Hero.jsx        # 顶部 Banner 区域
│   │   ├── Features.jsx    # 功能亮点
│   │   ├── UserStories.jsx # 用户故事
│   │   ├── Charts.jsx      # 数据图表
│   │   ├── Testimonials.jsx # 用户评价
│   │   ├── Download.jsx    # 下载区域
│   │   └── Footer.jsx      # 页脚
│   ├── App.jsx             # 主应用组件
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局样式
├── public/                  # 静态资源目录
│   └── assets/             # 图片资源（需要添加）
├── index.html              # HTML 模板
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # TailwindCSS 配置
├── postcss.config.js       # PostCSS 配置
└── netlify.toml            # Netlify 部署配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd website
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看网站

### 3. 构建生产版本

```bash
npm run build
```

构建产物会生成在 `dist` 目录

### 4. 预览生产版本

```bash
npm run preview
```

## 📦 部署到 Netlify

### 方式一：通过 Git 自动部署（推荐）

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 登录 [Netlify](https://www.netlify.com/)
3. 点击 "Add new site" → "Import an existing project"
4. 选择你的 Git 仓库
5. Netlify 会自动识别配置（已在 netlify.toml 中配置）
6. 点击 "Deploy site"

### 方式二：手动部署

1. 构建项目：
```bash
npm run build
```

2. 登录 Netlify，将 `dist` 目录拖拽到部署区域

## 🖼️ 图片资源

请将以下图片添加到 `public/assets/` 目录：

### 必需图片：
- `app-screenshot.png` - App 主界面截图（用于 Hero 区域）
- `chart-student.png` - 学生用户故事图表
- `chart-parent.png` - 家长用户故事图表
- `chart-worker.png` - 上班族用户故事图表
- `qrcode-ios.png` - iOS 下载二维码
- `favicon.svg` - 网站图标

### 可选图片：
- 更多 App 功能截图
- 用户真实头像（替换 emoji）

## 🎨 自定义配置

### 修改主题色

编辑 `tailwind.config.js`：

```javascript
theme: {
  extend: {
    colors: {
      primary: '#FFCE00',  // 修改主色调
      dark: '#1a1a1a',     // 修改深色
    },
  },
}
```

### 修改内容

所有文案内容都在对应的组件文件中，可以直接编辑：

- `src/components/Hero.jsx` - 首屏标题和描述
- `src/components/Features.jsx` - 功能特点
- `src/components/UserStories.jsx` - 用户故事
- `src/components/Testimonials.jsx` - 用户评价

### 修改下载链接

编辑 `src/components/Download.jsx`，将 App Store 链接替换为真实链接：

```javascript
<a href="https://apps.apple.com/app/your-app-id" ...>
```

## 📊 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **样式**: TailwindCSS 3
- **图表**: Recharts 2
- **图标**: Lucide React

## 🔧 常见问题

### 1. 图表不显示？

确保已安装 recharts：
```bash
npm install recharts
```

### 2. 样式不生效？

检查 TailwindCSS 配置是否正确，确保 `content` 路径包含所有组件文件。

### 3. 部署后页面空白？

检查 `vite.config.js` 中的 `base` 配置是否正确。

## 📝 待办事项

- [ ] 添加真实的 App 截图
- [ ] 替换占位图表为真实数据
- [ ] 添加 App Store 真实下载链接
- [ ] 添加 Google Analytics 统计代码
- [ ] 优化 SEO（meta 标签、sitemap）
- [ ] 添加深色模式支持（可选）
- [ ] 添加多语言支持（可选）

## 📄 许可证

Copyright © 2024 小习惯 App. All rights reserved.

## 📮 联系方式

- 邮箱: support@xiaoguanxi.com
- 网站: https://xiaoguanxi.com

---

Made with ❤️ for better habits

