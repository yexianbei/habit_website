# 📊 阅读统计功能 - 快速配置清单

## ✅ 已完成的代码实现

所有代码已经实现完成，包括：
- ✅ Netlify Function API (`netlify/functions/view-count.js`)
- ✅ 前端工具函数 (`src/utils/viewCounter.js`)
- ✅ 阅读数显示组件 (`src/components/ViewCount.jsx`)
- ✅ 博客文章页面集成 (`src/pages/BlogPost.jsx`)
- ✅ 博客列表页面集成 (`src/components/Blog.jsx`)
- ✅ Airtable 依赖已添加到 `package.json`

---

## 🚀 你需要做的配置（3步，约15分钟）

### 步骤 1: 安装依赖（1分钟）

```bash
cd /Users/mac/Documents/code/habit_website
npm install
```

这会安装 `airtable` 包。

---

### 步骤 2: 配置 Airtable（10分钟）

按照 `AIRTABLE_SETUP_GUIDE.md` 文档操作：

1. **创建 Airtable 账号和数据库**
   - 访问 https://airtable.com 注册账号
   - 创建新的 Base，命名为 `Blog Statistics`
   - 创建 Table，命名为 `ViewCounts`

2. **配置字段**
   - `postId` (Number, 必填)
   - `title` (Single line text, 可选)
   - `viewCount` (Number, 默认0)
   - `lastViewed` (Date & Time)

3. **获取 API 信息**
   - API Key：访问 https://airtable.com/api
   - Base ID：在 API 文档页面找到
   - Table 名称：`ViewCounts`

📖 **详细步骤请查看：`AIRTABLE_SETUP_GUIDE.md`**

---

### 步骤 3: 配置 Netlify 环境变量（5分钟）

1. **登录 Netlify**
   - 访问 https://app.netlify.com/
   - 选择你的网站

2. **添加环境变量**
   - 进入：**Site configuration** → **Environment variables**
   - 添加以下三个变量：

   ```
   AIRTABLE_API_KEY = 你的API_Key
   AIRTABLE_BASE_ID = 你的Base_ID
   AIRTABLE_TABLE_NAME = ViewCounts
   ```

3. **重新部署**
   - 添加完环境变量后，Netlify 会自动重新部署
   - 或手动触发：**Deploys** → **Trigger deploy**

---

## 🎯 配置完成后

1. **推送代码到 Git**
   ```bash
   git add .
   git commit -m "Add blog view counter feature"
   git push
   ```

2. **等待 Netlify 自动部署完成**

3. **测试功能**
   - 访问任意博客文章
   - 查看阅读数是否显示
   - 检查 Airtable 是否有记录

---

## 📋 配置检查清单

在开始之前，确认你已经准备好：

- [ ] 有 Airtable 账号（或准备注册）
- [ ] 有 Netlify 账号（已有）
- [ ] 可以访问 Netlify 控制台

配置过程中，你需要记录：

- [ ] Airtable API Key
- [ ] Airtable Base ID
- [ ] Table 名称（默认：`ViewCounts`）

---

## 📚 详细文档

- **完整配置指南**：`AIRTABLE_SETUP_GUIDE.md`
- **实现方案说明**：`BLOG_VIEW_COUNTER_IMPLEMENTATION.md`

---

## ❓ 遇到问题？

1. 查看 `AIRTABLE_SETUP_GUIDE.md` 的"故障排除"部分
2. 检查 Netlify 部署日志
3. 查看浏览器控制台错误信息

---

## 🎉 完成配置后

阅读统计功能就会自动工作：
- ✅ 每次访问文章时自动记录
- ✅ 在文章页面显示阅读数
- ✅ 在博客列表显示阅读数
- ✅ 数据存储在 Airtable，所有用户共享

**开始配置吧！** 🚀


