# 🧪 多语言功能测试

## ✅ 已更新的组件

- ✅ **Hero.jsx** - 首屏区域（完全支持多语言）
- ✅ **Features.jsx** - 功能亮点（完全支持多语言）
- ⚠️ **其他组件** - 待更新

---

## 🔍 测试步骤

### 1. 启动开发服务器

```bash
cd /Users/yezhidong/Documents/code/habit/website
npm run dev
```

### 2. 打开浏览器

访问 http://localhost:5173

### 3. 测试语言切换

#### 查看初始状态
- 页面应该显示中文内容
- 右上角有语言切换按钮（地球图标 🌍 + "EN"）

#### 点击切换按钮
- 按钮文字变为 "中文"
- Hero 区域的内容立即切换为英文：
  - "小习惯" → "Tiny Habits"
  - "更轻松地养成习惯" → "Build Habits Effortlessly"
  - "App Store 下载" → "Download on App Store"
  - 等等

- Features 区域的内容也切换为英文：
  - "为什么选择小习惯？" → "Why Choose Tiny Habits?"
  - "微习惯法则" → "Micro Habits Method"
  - 等等

#### 再次点击切换按钮
- 按钮文字变回 "EN"
- 所有内容切换回中文

#### 刷新页面
- 语言保持在上次选择的状态
- 说明 localStorage 保存成功

---

## 📊 当前翻译覆盖

### ✅ 已完成（可以测试）

| 组件 | 状态 | 可测试内容 |
|------|------|-----------|
| Hero | ✅ 完成 | 标题、描述、按钮、统计数据 |
| Features | ✅ 完成 | 标题、6个功能的标题和描述 |

### ⚠️ 待完成（暂时还是中文）

| 组件 | 状态 |
|------|------|
| UserStories | ⚠️ 待更新 |
| Charts | ⚠️ 待更新 |
| Testimonials | ⚠️ 待更新 |
| Download | ⚠️ 待更新 |
| Footer | ⚠️ 待更新 |

---

## 🎯 预期效果

### 中文模式
```
小习惯
更轻松地养成习惯
基于微习惯方法 + AI 教练的极简习惯养成工具
每天 1 分钟也能坚持，让改变从微小开始

[App Store 下载] [Android 下载（Coming Soon）]

100K+          500万+         4.8
活跃用户       习惯打卡       用户评分

为什么选择小习惯？
六大核心功能，让习惯养成更科学、更有趣

微习惯法则
每天 1 分钟也能坚持，降低行动门槛...
```

### 英文模式
```
Tiny Habits
Build Habits Effortlessly
Minimalist habit tracker powered by Micro Habits Method + AI Coach
Even 1 minute a day counts. Start small, achieve big.

[Download on App Store] [Android (Coming Soon)]

100K+          500万+         4.8
Active Users   Habit Check-ins  User Rating

Why Choose Tiny Habits?
Six core features to make habit building scientific and fun

Micro Habits Method
Even 1 minute a day works. Lower the barrier...
```

---

## 🐛 故障排查

### 问题 1: 点击按钮没反应

**检查**:
1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 确认 LanguageProvider 已包裹 App

**解决**:
```bash
# 重启开发服务器
# 按 Ctrl+C 停止
npm run dev
```

### 问题 2: 内容没有切换

**可能原因**:
- 组件还没有更新为使用多语言
- 目前只有 Hero 和 Features 支持多语言

**确认方法**:
- 滚动到 Hero 区域（首屏）
- 滚动到 Features 区域（功能亮点）
- 这两个区域应该能正常切换

### 问题 3: 显示翻译 key 而不是文本

**示例**: 显示 "hero.title" 而不是 "小习惯"

**原因**: translations.js 中缺少对应的翻译

**检查**:
```bash
# 查看 translations.js 文件
cat src/i18n/translations.js | grep "hero.title"
```

---

## ✅ 测试检查清单

- [ ] 开发服务器正常启动
- [ ] 页面正常加载
- [ ] 右上角显示语言切换按钮
- [ ] 点击按钮，按钮文字改变（EN ↔ 中文）
- [ ] Hero 区域内容切换（中文 ↔ 英文）
- [ ] Features 区域内容切换（中文 ↔ 英文）
- [ ] 刷新页面，语言保持不变
- [ ] 控制台无错误信息

---

## 📝 下一步

### 如果测试成功 ✅

继续更新其他组件：
1. UserStories.jsx
2. Charts.jsx
3. Testimonials.jsx
4. Download.jsx
5. Footer.jsx

参考 `I18N_UPDATE_COMPONENTS.md` 获取更新方法。

### 如果测试失败 ❌

1. 查看浏览器控制台错误
2. 检查文件是否正确保存
3. 重启开发服务器
4. 查看 `I18N_GUIDE.md` 故障排查部分

---

## 🎉 成功标志

当你看到以下效果时，说明多语言功能正常工作：

1. ✅ 右上角有语言切换按钮
2. ✅ 点击按钮，Hero 标题从"小习惯"变为"Tiny Habits"
3. ✅ 功能标题从"微习惯法则"变为"Micro Habits Method"
4. ✅ 刷新页面，语言保持不变

---

## 📞 需要帮助？

- 查看 `I18N_GUIDE.md` - 完整使用指南
- 查看 `I18N_COMPLETE.md` - 功能说明
- 检查浏览器控制台错误信息

---

祝测试顺利！🚀

