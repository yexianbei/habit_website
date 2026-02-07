# Airtable 配置指南

本指南将帮助你配置 Airtable 数据库，实现博客阅读统计功能。

---

## 📋 配置步骤

### 步骤 1: 创建 Airtable 账号和数据库（5分钟）

1. **访问 Airtable**
   - 打开 https://airtable.com
   - 点击 "Sign up for free" 注册账号（可以使用 Google 账号快速注册）

2. **创建新的 Base**
   - 登录后，点击左上角的 "+" 号
   - 选择 "Start from scratch"
   - 将 Base 命名为：`Blog Statistics` 或 `博客统计`

3. **创建 Table**
   - 默认会有一个 Table 1，重命名为：`ViewCounts`
   - 或者删除默认的 Table，创建一个新的 Table 命名为 `ViewCounts`

---

### 步骤 2: 配置 Table 字段（5分钟）

在 `ViewCounts` Table 中，你需要创建以下字段：

#### 字段配置表

| 字段名 | 字段类型 | 说明 | 配置 |
|--------|---------|------|------|
| **postId** | Number | 文章ID（唯一标识） | 必填 ✅ |
| **title** | Single line text | 文章标题（方便查看） | 可选 |
| **viewCount** | Number | 阅读次数 | 默认值：0 |
| **lastViewed** | Date | 最后访问时间 | 格式：Date & Time |

#### 详细配置步骤

1. **创建 postId 字段**
   - 点击表格右侧的 "+" 添加新字段
   - 字段名称：`postId`
   - 字段类型：选择 `Number`
   - ✅ 勾选 "This field is required"（必填）

2. **创建 title 字段（可选）**
   - 字段名称：`title`
   - 字段类型：选择 `Single line text`
   - 用于存储文章标题，方便在 Airtable 中查看

3. **创建 viewCount 字段**
   - 字段名称：`viewCount`
   - 字段类型：选择 `Number`
   - 默认值：`0`

4. **创建 lastViewed 字段**
   - 字段名称：`lastViewed`
   - 字段类型：选择 `Date`
   - 在选项中选择 "Include time" ✅

#### 最终字段结构应该类似这样：

```
ViewCounts Table
├── postId (Number, 必填)
├── title (Single line text, 可选)
├── viewCount (Number, 默认0)
└── lastViewed (Date & Time)
```

---

### 步骤 3: 获取 API 密钥和 Base ID（5分钟）

1. **获取 API Key**
   - 访问 https://airtable.com/api
   - 点击你创建的 Base（Blog Statistics）
   - 在页面顶部找到 "Authentication" 部分
   - 复制 **Personal access token**（API Key），格式类似：`patXXXXXXXXXXXXXX.XXXXXXXXXX`
   - 💡 如果没有 Personal access token，点击 "Create token" 创建一个
     - Token 名称：`Blog View Counter`
     - Scopes：选择 `data.records:read` 和 `data.records:write`
     - Access：选择你的 Base

2. **获取 Base ID**
   - 在同一页面（API 文档页面）
   - 在页面顶部找到 Base ID，格式类似：`appXXXXXXXXXXXXXX`
   - 复制这个 Base ID

3. **记录 Table 名称**
   - Table 名称就是：`ViewCounts`（我们刚才创建的）

---

### 步骤 4: 在 Netlify 配置环境变量（5分钟）

1. **登录 Netlify**
   - 访问 https://app.netlify.com/
   - 登录你的账号

2. **进入站点设置**
   - 在站点列表中找到你的网站
   - 点击站点名称进入详情页
   - 左侧菜单选择：**Site configuration** → **Environment variables**

3. **添加环境变量**
   点击 "Add a variable"，依次添加以下三个环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `AIRTABLE_API_KEY` | 你的 API Key | 从步骤3获取 |
   | `AIRTABLE_BASE_ID` | 你的 Base ID | 从步骤3获取 |
   | `AIRTABLE_TABLE_NAME` | `ViewCounts` | Table名称（可选，默认就是这个） |

   **示例**：
   ```
   AIRTABLE_API_KEY = patXXXXXXXXXXXXXX.XXXXXXXXXX
   AIRTABLE_BASE_ID = appXXXXXXXXXXXXXX
   AIRTABLE_TABLE_NAME = ViewCounts
   ```

4. **保存并重新部署**
   - 添加完环境变量后，Netlify 会自动触发重新部署
   - 如果没有自动部署，可以手动触发：
     - 进入 "Deploys" 标签
     - 点击 "Trigger deploy" → "Deploy site"

---

### 步骤 5: 安装依赖并测试（5分钟）

1. **安装 Airtable 依赖**
   在项目根目录运行：
   ```bash
   npm install airtable
   ```

2. **本地测试（可选）**
   - 创建 `.env` 文件（用于本地开发，不要提交到 Git）
   ```bash
   AIRTABLE_API_KEY=你的API_Key
   AIRTABLE_BASE_ID=你的Base_ID
   AIRTABLE_TABLE_NAME=ViewCounts
   ```

   ⚠️ **注意**：`.env` 文件已经在 `.gitignore` 中，不会被提交

3. **测试 Netlify Function**
   - 部署后，访问你的网站
   - 打开任意一篇博客文章
   - 检查浏览器控制台是否有错误
   - 查看 Airtable 的 ViewCounts 表，应该能看到新记录

---

## ✅ 验证配置

### 检查清单

- [ ] Airtable Base 已创建
- [ ] ViewCounts Table 已创建
- [ ] 所有字段已正确配置
- [ ] API Key 已获取
- [ ] Base ID 已获取
- [ ] Netlify 环境变量已配置
- [ ] 依赖已安装（`npm install airtable`）
- [ ] 代码已部署

### 测试步骤

1. **访问博客文章**
   - 打开网站，访问任意一篇博客文章
   - 等待几秒钟，让统计记录完成

2. **检查 Airtable**
   - 登录 Airtable
   - 打开 Blog Statistics Base
   - 查看 ViewCounts 表
   - 应该能看到一条新记录，postId 对应文章ID，viewCount 为 1

3. **检查前端显示**
   - 刷新文章页面
   - 应该在元信息区域看到阅读数显示
   - 例如：`👁️ 1 次阅读` 或 `👁️ 1 views`

4. **测试多次访问**
   - 刷新页面多次
   - 检查 Airtable 中的 viewCount 是否递增

---

## 🔧 故障排除

### 问题 1: 阅读数没有记录

**可能原因**：
- 环境变量未正确配置
- API Key 权限不足
- Table 名称不匹配

**解决方法**：
1. 检查 Netlify 环境变量是否正确
2. 检查 API Key 是否包含 `data.records:read` 和 `data.records:write` 权限
3. 确认 Table 名称是 `ViewCounts`（大小写敏感）

### 问题 2: 前端显示错误

**可能原因**：
- Netlify Function 路径错误
- CORS 问题

**解决方法**：
1. 打开浏览器开发者工具，查看 Network 标签
2. 检查 `/.netlify/functions/view-count` 请求是否成功
3. 查看 Console 是否有错误信息

### 问题 3: 环境变量不生效

**可能原因**：
- 环境变量添加后未重新部署
- 变量名拼写错误

**解决方法**：
1. 确认变量名完全正确（区分大小写）
2. 在 Netlify 控制台手动触发重新部署
3. 检查部署日志，确认环境变量已加载

---

## 📊 查看统计数据

### 在 Airtable 中查看

1. 登录 Airtable
2. 打开 Blog Statistics Base
3. 查看 ViewCounts 表
4. 可以看到所有文章的阅读统计

### 按阅读数排序

在 Airtable 中：
1. 点击 `viewCount` 字段标题
2. 选择 "Sort descending"
3. 可以看到最受欢迎的文章

### 创建视图（可选）

可以创建不同的视图：
- **All Posts** - 所有文章
- **Most Viewed** - 按阅读数排序
- **Recent Activity** - 按最后访问时间排序

---

## 💰 费用说明

### Airtable 免费版限制

- ✅ **每月 5,000 条记录**（对于博客统计足够使用）
- ✅ **每 Base 最多 5 个 Table**
- ✅ **每 Table 最多 1,200 行**

### 对于你的博客

假设有 100 篇文章：
- 每条记录代表一篇文章的统计
- 100 篇文章 = 100 条记录
- 远远低于 5,000 条限制 ✅

### 如果超出限制

如果未来文章数量很多，可以考虑：
1. 升级 Airtable Plus（$12/月，50,000 条记录）
2. 迁移到其他方案（FaunaDB、Upstash Redis 等）

---

## 📝 后续优化（可选）

### 1. 添加防刷机制

当前实现每次访问都会计数，可以添加：
- IP 去重（同一 IP 24小时内只计数一次）
- Cookie 去重
- 用户代理检测

### 2. 添加统计图表

在 Airtable 中创建视图，展示：
- 最受欢迎的文章
- 阅读趋势
- 按分类统计

### 3. 数据导出

定期导出统计数据：
- CSV 格式
- 用于数据分析

---

## 🎉 完成！

配置完成后，你的博客阅读统计功能就可以正常工作了！

如果遇到任何问题，请检查：
1. Netlify 部署日志
2. 浏览器控制台错误
3. Airtable API 文档

---

**配置完成后，记得测试一下功能是否正常！**

---

## 📞 需要帮助？

如果配置过程中遇到问题：
1. 检查本文档的"故障排除"部分
2. 查看 Netlify Function 日志
3. 查看 Airtable API 文档：https://airtable.com/api


