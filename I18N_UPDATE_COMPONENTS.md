# 🔄 组件多语言更新指南

## 快速更新所有组件

由于组件较多，这里提供每个组件需要更新的关键部分。

---

## 📝 更新步骤

### 1. Hero.jsx

在文件顶部添加：
```jsx
import { useLanguage } from '../i18n/LanguageContext'
```

在组件内添加：
```jsx
const { t } = useLanguage()
```

替换所有硬编码文本为：
```jsx
{t('hero.title')}
{t('hero.subtitle')}
{t('hero.description')}
// ... 等等
```

**参考**: `Hero_i18n.jsx` 已经是完整的多语言版本

---

### 2. Features.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const Features = () => {
  const { t, tArray } = useLanguage()
  const features = tArray('features.items')
  
  return (
    <section>
      <h2>{t('features.title')}</h2>
      <p>{t('features.subtitle')}</p>
      
      {features.map((feature, index) => (
        <div key={index}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </section>
  )
}
```

---

### 3. UserStories.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const UserStories = () => {
  const { t, tArray } = useLanguage()
  const stories = tArray('userStories.stories')
  
  return (
    <section>
      <h2>{t('userStories.title')}</h2>
      <p>{t('userStories.subtitle')}</p>
      
      {stories.map((story, index) => (
        <div key={index}>
          <div>{story.role}</div>
          <div>{story.name}</div>
          <div>
            <div>{t('userStories.labels.goal')}</div>
            <div>{story.goal}</div>
          </div>
          {/* ... 其他字段 */}
        </div>
      ))}
    </section>
  )
}
```

---

### 4. Charts.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const Charts = () => {
  const { t } = useLanguage()
  
  // 更新图表数据标签
  const completionData = [
    { name: t('charts.completionChart.labels.completed'), value: 85 },
    { name: t('charts.completionChart.labels.inProgress'), value: 10 },
    { name: t('charts.completionChart.labels.abandoned'), value: 5 }
  ]
  
  return (
    <section>
      <h2>{t('charts.title')}</h2>
      <p>{t('charts.subtitle')}</p>
      {/* ... 图表组件 */}
    </section>
  )
}
```

---

### 5. Testimonials.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const Testimonials = () => {
  const { t, tArray } = useLanguage()
  const testimonials = tArray('testimonials.items')
  
  return (
    <section>
      <h2>{t('testimonials.title')}</h2>
      <p>{t('testimonials.subtitle')}</p>
      
      {testimonials.map((testimonial, index) => (
        <div key={index}>
          <div>{testimonial.name}</div>
          <div>{testimonial.role}</div>
          <p>"{testimonial.content}"</p>
          <div>{testimonial.highlight}</div>
        </div>
      ))}
    </section>
  )
}
```

---

### 6. Download.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const Download = () => {
  const { t, tArray } = useLanguage()
  const features = tArray('download.features')
  
  return (
    <section>
      <h2>{t('download.title')}</h2>
      <p>{t('download.subtitle')}</p>
      
      <a href="#">{t('download.downloadIOS')}</a>
      <button>{t('download.downloadAndroid')}</button>
      
      {features.map((feature, index) => (
        <div key={index}>
          <div>{feature.title}</div>
          <div>{feature.description}</div>
        </div>
      ))}
    </section>
  )
}
```

---

### 7. Footer.jsx

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  
  return (
    <footer>
      <p>{t('footer.description')}</p>
      
      <h3>{t('footer.quickLinks')}</h3>
      <ul>
        <li><a href="#">{t('footer.links.features')}</a></li>
        <li><a href="#">{t('footer.links.stories')}</a></li>
        {/* ... 其他链接 */}
      </ul>
      
      <div>{t('footer.copyright')}</div>
      <div>{t('footer.madeWith')}</div>
    </footer>
  )
}
```

---

## 🚀 批量更新脚本

如果你想一次性更新所有组件，可以：

### 方法 1: 手动更新（推荐）

按照上面的示例，逐个更新组件文件。

### 方法 2: 使用提供的示例

我已经创建了 `Hero_i18n.jsx` 作为完整示例，可以参考它来更新其他组件。

---

## ✅ 更新检查清单

更新每个组件后，检查：

- [ ] 导入了 `useLanguage`
- [ ] 使用了 `t()` 或 `tArray()` 函数
- [ ] 所有硬编码文本都已替换
- [ ] 翻译 key 正确（在 translations.js 中存在）
- [ ] 组件正常渲染
- [ ] 切换语言时内容正确更新

---

## 🧪 测试

更新完成后：

1. 启动开发服务器：
```bash
npm run dev
```

2. 在浏览器中测试：
   - 点击右上角语言切换按钮
   - 检查所有页面内容是否正确切换
   - 刷新页面，确认语言偏好已保存

3. 检查控制台：
   - 确保没有错误
   - 确保没有缺失的翻译警告

---

## 📦 完整示例

查看 `Hero_i18n.jsx` 获取完整的多语言组件示例。

---

## 💡 提示

### 渐进式更新

可以先更新一个组件，测试通过后再更新其他组件：

1. 更新 Hero 组件
2. 测试语言切换
3. 更新 Features 组件
4. 继续测试
5. ... 依次更新

### 保留备份

更新前可以备份原文件：

```bash
cp src/components/Hero.jsx src/components/Hero.backup.jsx
```

---

## 🎯 优先级

建议按以下顺序更新：

1. ✅ Hero（首屏，最重要）
2. ✅ Features（核心功能）
3. ✅ Download（下载引导）
4. UserStories（用户故事）
5. Testimonials（用户评价）
6. Charts（数据图表）
7. Footer（页脚）

---

需要帮助？查看 `I18N_GUIDE.md` 获取详细说明。

