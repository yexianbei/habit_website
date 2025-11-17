# 图片资源清单

## 📸 需要准备的图片资源

请将以下图片添加到 `public/assets/` 目录中。

### 1. Hero 区域（首屏）

#### app-screenshot.png
- **用途**: 首屏展示的 App 主界面截图
- **尺寸建议**: 750 x 1500 px（iPhone 屏幕比例）
- **格式**: PNG（带透明背景更佳）
- **位置**: 放在手机外框中展示
- **内容建议**: App 的主界面，展示习惯列表或打卡界面

---

### 2. 用户故事图表

#### chart-student.png
- **用途**: 学生用户故事 - 专注时长折线图
- **尺寸建议**: 1200 x 675 px（16:9 比例）
- **格式**: PNG
- **内容建议**: 
  - 横轴：日期（60天）
  - 纵轴：专注时长（分钟）
  - 展示逐渐上升的趋势

#### chart-parent.png
- **用途**: 家长用户故事 - 打卡热力图
- **尺寸建议**: 1200 x 675 px（16:9 比例）
- **格式**: PNG
- **内容建议**:
  - GitHub 风格的热力图
  - 30天的打卡记录
  - 用颜色深浅表示完成情况

#### chart-worker.png
- **用途**: 上班族用户故事 - 体重变化折线图
- **尺寸建议**: 1200 x 675 px（16:9 比例）
- **格式**: PNG
- **内容建议**:
  - 横轴：日期（90天）
  - 纵轴：体重（kg）
  - 展示下降趋势

---

### 3. 下载区域

#### qrcode-ios.png
- **用途**: App Store 下载二维码
- **尺寸建议**: 400 x 400 px
- **格式**: PNG
- **内容**: 指向 App Store 的二维码
- **生成方式**: 使用在线二维码生成器，输入 App Store 链接

#### qrcode-android.png（可选）
- **用途**: Android 下载二维码
- **尺寸建议**: 400 x 400 px
- **格式**: PNG
- **说明**: 目前标记为 Coming Soon，可以暂时不准备

---

### 4. 其他可选资源

#### app-screenshot-2.png, app-screenshot-3.png...
- **用途**: 更多 App 功能截图
- **尺寸建议**: 750 x 1500 px
- **用途**: 可以添加到页面中展示更多功能

#### logo.png
- **用途**: 高清 Logo
- **尺寸建议**: 512 x 512 px
- **格式**: PNG（带透明背景）
- **用途**: 用于社交媒体分享、SEO 等

---

## 🎨 图片制作建议

### 工具推荐

1. **截图工具**:
   - macOS: 自带截图工具（Cmd + Shift + 4）
   - 第三方: CleanShot X, Xnapper

2. **图表制作**:
   - 在线工具: Figma, Canva
   - 代码生成: 使用 Python matplotlib 或 JavaScript Chart.js

3. **图片压缩**:
   - 在线工具: TinyPNG (https://tinypng.com/)
   - 命令行: ImageOptim, pngquant

4. **二维码生成**:
   - 在线工具: QR Code Generator (https://www.qr-code-generator.com/)
   - 草料二维码: https://cli.im/

### 设计规范

- **色彩**: 与 App 主题色保持一致（主色：#FFCE00）
- **风格**: 简洁、现代、清晰
- **质量**: 使用高分辨率图片（至少 2x）
- **格式**: 优先使用 PNG（支持透明）或 WebP（更小体积）
- **命名**: 使用小写字母和连字符，如 `app-screenshot.png`

---

## 📁 文件结构

完成后的 `public/assets/` 目录应该如下：

```
public/
└── assets/
    ├── app-screenshot.png      ✅ 必需
    ├── chart-student.png       ✅ 必需
    ├── chart-parent.png        ✅ 必需
    ├── chart-worker.png        ✅ 必需
    ├── qrcode-ios.png         ✅ 必需
    ├── qrcode-android.png     ⭕ 可选
    ├── app-screenshot-2.png   ⭕ 可选
    ├── app-screenshot-3.png   ⭕ 可选
    └── logo.png               ⭕ 可选
```

---

## 🔄 替换占位图

### 1. Hero 区域

在 `src/components/Hero.jsx` 中：

```jsx
// 找到这段代码
<div className="w-full h-full bg-gradient-to-br from-primary/20 to-yellow-100 flex items-center justify-center">
  {/* 占位图 */}
</div>

// 替换为
<img 
  src="/assets/app-screenshot.png" 
  alt="小习惯 App 界面" 
  className="w-full h-full object-cover"
/>
```

### 2. 用户故事图表

在 `src/components/UserStories.jsx` 中：

```jsx
// 找到这段代码
<div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
  {/* 占位图 */}
</div>

// 替换为
<img 
  src={story.chartPlaceholder} 
  alt={story.chartType} 
  className="w-full h-full object-cover rounded-2xl"
/>
```

### 3. 下载二维码

在 `src/components/Download.jsx` 中：

```jsx
// 找到这段代码
<div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
  {/* 占位图 */}
</div>

// 替换为
<img 
  src="/assets/qrcode-ios.png" 
  alt="iOS 下载二维码" 
  className="w-48 h-48 rounded-2xl"
/>
```

---

## ✅ 完成检查

- [ ] 所有必需图片已准备
- [ ] 图片已压缩优化
- [ ] 图片已放入 `public/assets/` 目录
- [ ] 代码中的占位图已替换为真实图片
- [ ] 本地预览确认图片正确显示
- [ ] 图片文件名与代码中引用一致

---

## 💡 临时方案

如果暂时没有真实图片，可以：

1. **使用占位图服务**:
   ```jsx
   <img src="https://placehold.co/750x1500/FFCE00/1a1a1a?text=App+Screenshot" />
   ```

2. **使用 Unsplash**:
   ```jsx
   <img src="https://source.unsplash.com/750x1500/?mobile,app" />
   ```

3. **保持当前占位设计**:
   - 当前的占位设计已经很美观
   - 可以先上线，后续再替换真实图片

---

需要帮助？请查看 README.md 或联系开发团队。

