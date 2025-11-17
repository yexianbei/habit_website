# 🚀 快速启动指南

## 第一步：安装依赖

```bash
cd /Users/yezhidong/Documents/code/habit/website
npm install
```

等待依赖安装完成（大约 1-2 分钟）

---

## 第二步：启动开发服务器

```bash
npm run dev
```

看到以下输出表示启动成功：

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

在浏览器中打开 http://localhost:5173 查看网站

---

## 第三步：查看效果

网站包含以下模块：

1. ✅ **Hero 区域** - 首屏展示
2. ✅ **Features** - 6 大功能亮点
3. ✅ **User Stories** - 3 个真实用户故事
4. ✅ **Charts** - 数据可视化图表
5. ✅ **Testimonials** - 用户评价
6. ✅ **Download** - 下载引导
7. ✅ **Footer** - 页脚信息

---

## 第四步：自定义内容（可选）

### 修改文案

所有文案都在对应的组件文件中：

```bash
src/components/Hero.jsx         # 首屏标题
src/components/Features.jsx     # 功能描述
src/components/UserStories.jsx  # 用户故事
src/components/Testimonials.jsx # 用户评价
```

### 修改颜色

编辑 `tailwind.config.js`：

```javascript
colors: {
  primary: '#FFCE00',  // 主色调
  dark: '#1a1a1a',     // 深色
}
```

### 添加图片

1. 将图片放入 `public/assets/` 目录
2. 参考 `ASSETS_CHECKLIST.md` 了解需要哪些图片
3. 按照说明替换占位图

---

## 第五步：构建生产版本

```bash
npm run build
```

构建完成后，产物在 `dist` 目录

### 预览生产版本

```bash
npm run preview
```

---

## 第六步：部署到 Netlify

### 方式一：Git 自动部署（推荐）

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub
git remote add origin https://github.com/your-username/xiaoguanxi-website.git
git push -u origin main

# 3. 在 Netlify 导入仓库
# 访问 https://app.netlify.com/
# 点击 "Add new site" → "Import an existing project"
# 选择你的仓库，点击 "Deploy site"
```

### 方式二：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 登录 Netlify
# 访问 https://app.netlify.com/

# 3. 拖拽 dist 目录到部署区域
```

详细步骤请查看 `DEPLOYMENT.md`

---

## 📋 检查清单

部署前请确认：

- [ ] 已安装依赖
- [ ] 本地可以正常运行
- [ ] 已准备好图片资源（或保持占位图）
- [ ] 已更新 App Store 下载链接（在 `src/components/Download.jsx`）
- [ ] 已测试移动端显示效果
- [ ] 已构建生产版本无错误

---

## 🐛 常见问题

### Q1: npm install 失败？

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 yarn
yarn install
```

### Q2: 端口 5173 被占用？

**解决方案**:
```bash
# Vite 会自动使用下一个可用端口
# 或手动指定端口
npm run dev -- --port 3000
```

### Q3: 图表不显示？

**解决方案**:
- 确保已安装 recharts：`npm install recharts`
- 检查浏览器控制台是否有错误
- 尝试重启开发服务器

### Q4: 样式不生效？

**解决方案**:
- 确保 TailwindCSS 正确配置
- 检查 `tailwind.config.js` 中的 content 路径
- 重启开发服务器

---

## 📚 更多文档

- **README.md** - 项目总览
- **DEPLOYMENT.md** - 详细部署指南
- **ASSETS_CHECKLIST.md** - 图片资源清单
- **PROJECT_STRUCTURE.md** - 项目结构说明

---

## 🎉 完成！

现在你已经成功运行了"小习惯 App"官方网站！

下一步：
1. 自定义内容和样式
2. 添加真实图片
3. 部署到 Netlify
4. 分享给用户

祝你的 App 大获成功！🚀

---

需要帮助？
- 📧 Email: support@xiaoguanxi.com
- 💬 查看文档或提交 Issue

