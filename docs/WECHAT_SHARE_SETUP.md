# 微信分享配置说明

本文说明如何配置微信相关能力，使「分享到微信」的网页符合微信规范，并在微信内打开时展示正确卡片。封装已做好，便于后续扩展抖音等平台。

---

## 一、网页在微信内分享需遵守的原则

微信会抓取你分享的链接并生成「卡片」。请保证：

1. **HTTPS**：分享链接必须为 `https://`。
2. **OG 标签**：页面需有完整的 Open Graph 标签，微信爬虫会读取：
   - `og:title`：标题（必填）
   - `og:description`：描述（必填）
   - `og:image`：图片，**必须为绝对 URL、HTTPS**；建议尺寸 **300×300** 或 **500×500** 或 **1.91:1（如 1200×630）**，不大于 5MB
   - `og:url`：当前页完整 URL，与用户打开的地址一致
3. **同一链接**：用户点击卡片进入的 URL 与 `og:url` 一致，避免重定向到其它域名（否则可能被微信拦截或限流）。

本站已在 `index.html` 和 `SEO` 组件中为各页设置了 `og:*`，只要每个可分享页都使用 `SEO` 并传入 `title/description/image`，即符合上述原则。

若要在**微信内置浏览器内**自定义「分享给朋友」「分享到朋友圈」的卡片文案（而非用爬虫抓到的默认内容），需要配置 **微信公众平台** 并使用 **JS-SDK**（见下文）。

---

## 二、微信公众平台配置（网页 JS-SDK，用于自定义分享卡片）

适用于：**在微信内打开的 H5 页面**，希望用户点击右上角「…」→「分享给朋友/分享到朋友圈」时，显示你指定的标题、描述、图片。

### 1. 注册与账号类型

- 打开 [微信公众平台](https://mp.weixin.qq.com/) 并登录。
- 使用 **服务号** 或 **认证后的订阅号**（未认证订阅号无 JS 接口安全域名等能力）。

### 2. 设置 JS 接口安全域名

1. 进入 **设置与开发** → **公众号设置** → **功能设置**。
2. 找到 **JS接口安全域名**，点击「设置」。
3. 填写你的网页域名，例如：`tinyhabits.top`（不要加 `https://` 或 `www`；若用 `www.tinyhabits.top` 则填 `www.tinyhabits.top`）。
4. 按页面提示下载「验证文件」，将文件放到网站**根目录**（如 `https://tinyhabits.top/xxx.txt` 可访问），保存配置。

### 3. 获取 AppID 与 AppSecret

1. 进入 **设置与开发** → **基本配置**。
2. 记录 **开发者 ID(AppID)**。
3. 在 **AppSecret** 一栏点击「重置」并保存（仅显示一次，用于后端生成签名）。

### 4. 后端签名接口（必须由你方实现）

微信 JS-SDK 要求对当前页面 URL 做签名，**签名必须在后端完成**（不能把 AppSecret 放在前端）。

**签名算法（与微信官方文档一致）：**

1. 用 AppID 和 AppSecret 获取 `access_token`（或使用中控服务缓存）。
2. 用 `access_token` 调用 `https://api.weixin.qq.com/cgi-bin/ticket/getjsapi_ticket` 获取 `jsapi_ticket`。
3. 对以下参数按**字典序**排序后拼接成字符串，再做 **SHA1** 得到 `signature`：
   - `jsapi_ticket=<ticket>`
   - `noncestr=<随机串>`
   - `timestamp=<时间戳，秒>`
   - `url=<当前页完整 URL，不含 # 及后面内容>`

**后端需提供 GET 接口**，例如：

```text
GET /api/wechat-js-config?url=https://tinyhabits.top/blog/xxx
```

**返回 JSON 示例：**

```json
{
  "appId": "wx1234567890abcdef",
  "timestamp": 1700000000,
  "nonceStr": "abc123",
  "signature": "sha1后的十六进制字符串"
}
```

前端会请求该接口并传入「当前页完整 URL」（与微信要求一致），你方后端用同一 `url` 参与签名。

### 5. 前端环境变量

在项目根目录的 `.env` 或 `.env.production` 中配置你部署好的签名接口地址：

```bash
# 微信 JS-SDK 签名接口（可选）。不配置则微信内分享卡片使用页面 og 抓取结果
VITE_WECHAT_JS_SDK_API=https://你的域名/api/wechat-js-config
```

配置并重新构建后，在微信内打开任意已接入 `useWechatShare` / `setWechatShareConfig` 的页面，分享卡片会使用 JS-SDK 设置的自定义标题、描述、图片。

---

## 三、微信开放平台配置（App 内分享到微信）

适用于：**小习惯 App** 内点击「分享」时，调起微信 App 的「发送给朋友/分享到朋友圈」。

### 1. 注册与创建应用

1. 打开 [微信开放平台](https://open.weixin.qq.com/) 并登录。
2. 进入 **管理中心** → **移动应用**，若已有「小习惯」应用则直接使用，否则「创建移动应用」并填写应用信息，提交审核。
3. 审核通过后，在应用详情中查看 **AppID**（开放平台分配，与公众平台 AppID 不同）。

### 2. 配置分享

1. 在应用详情中进入 **接口信息**（或 **能力**）。
2. 申请 **分享到微信/朋友圈** 等能力（若列表中有）。
3. 在 **开发信息** 中配置 **应用签名**（Android）和 **Bundle ID / Universal Links**（iOS），与微信要求一致。

### 3. 客户端实现

- **Android**：集成微信开放 SDK，在分享时调起微信并传入链接、标题、描述、缩略图等。
- **iOS**：同上，使用微信提供的 SDK。

H5 侧已通过 NativeBridge 的 `ui.share` 将 `title/url/text/imageUrl` 传给原生，原生收到后调微信 SDK 即可。无需在开放平台再配置「网页」域名。

---

## 四、前端使用方式（已封装）

### 1. 在任意页面设置微信分享卡片（微信内打开时生效）

```js
import { useWechatShare } from '../hooks/useShare'

// 方式 A：使用当前页面的 og 标签（推荐，与 SEO 一致）
function MyPage() {
  useWechatShare()
  return <div>...</div>
}

// 方式 B：覆盖标题/描述/图片
function MyPage() {
  useWechatShare({
    title: '自定义标题',
    description: '自定义描述',
    imgUrl: 'https://tinyhabits.top/xxx.png',
  })
  return <div>...</div>
}
```

### 2. 触发分享按钮（复制链接 / 系统分享 / App 内原生分享）

```js
import { useShare } from '../hooks/useShare'

function ShareButton() {
  const { triggerShare } = useShare()
  return <button onClick={() => triggerShare()}>分享</button>
}
```

- 在 **App 内**：会调原生 `ui.share`，由原生决定是否调起微信等。
- 在 **普通浏览器**：优先 `navigator.share`，不支持则复制链接并提示「可粘贴到微信、抖音等分享」。

### 3. 扩展其他平台

分享逻辑在 `src/utils/share/` 下：

- `detect.js`：环境检测（可加 `isDouyin()` 等）。
- `wechat.js`：微信 JSSDK。
- `index.js`：统一入口 `setWechatShareConfig`、`triggerShare`。

后续可增加 `share/douyin.js`、在 `triggerShare` 中按平台分支，或增加 `shareToDouyin(config)` 等，保持同一套 `ShareConfig` 结构即可。

---

## 五、小结

| 场景                 | 配置位置           | 作用说明 |
|----------------------|--------------------|----------|
| 链接在微信内打开、分享卡片 | 微信**公众**平台   | JS 接口安全域名 + AppID/AppSecret；后端签名接口；前端 `VITE_WECHAT_JS_SDK_API` |
| App 内点击分享到微信 | 微信**开放**平台   | 移动应用 AppID、应用签名/Bundle ID；原生集成微信 SDK，H5 调 `ui.share` |

网页侧只要保证 **HTTPS + 完整 og 标签 + 可选 JS-SDK 签名接口**，即可符合微信分享原则并便于后续扩展其他平台。
