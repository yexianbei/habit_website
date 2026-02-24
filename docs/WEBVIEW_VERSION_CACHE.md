# WebView 版本号与本地缓存对接说明

适用于在 **Android、iOS、鸿蒙** 客户端内通过 WebView 加载本站 H5 时，按版本号使用本地缓存：同版本走缓存（加载更快、断网可用），版本升级后自动拉取最新资源。

---

## 一、服务端约定

### 1. 版本接口

- **URL**：`{H5 根地址}/version.json`  
  例如：`https://tinyhabits.top/version.json`
- **方法**：GET
- **响应**：JSON，建议**不要缓存**（服务端已设置 `Cache-Control: no-cache`），以便每次校验都拿到最新版本。

示例：

```json
{
  "version": "1.0.0",
  "buildTime": "2025-02-23T12:00:00.000Z"
}
```

| 字段        | 说明 |
|-------------|------|
| `version`   | 前端版本号，与 `package.json` 的 `version` 一致，发版时随构建更新。 |
| `buildTime` | 构建时间（ISO 8601），可选，用于排查问题。 |

### 2. 页面 URL 与缓存

- 站点对页面响应设置了**可缓存**（如 `max-age=86400`）。
- 客户端应使用**带版本号的查询参数**加载页面，例如：  
  `https://tinyhabits.top/habit/period/intro?v=1.0.0`
- 同一 `?v=xxx` 的 URL 可被 HTTP 缓存/WebView 缓存复用，实现「同版本用缓存」；版本号变更后改用新的 `?v=新版本`，自然请求到新资源。

---

## 二、客户端推荐流程

1. **取当前线上版本**  
   请求 `{baseUrl}/version.json`，且**禁止使用本地缓存**（见下文各平台说明），解析出 `version`。

2. **与本地保存的「上次使用的 H5 版本」比较**  
   - 若本地无记录，或 `version.json` 中的 `version` 与本地不同 → 视为**需要更新**：  
     - 可选：清理 WebView 缓存（或仅清理该域名下的缓存），避免旧资源干扰。  
     - 使用 `{baseUrl}{path}?v={当前 version}` 加载页面（如 `.../habit/period/intro?v=1.0.0`）。  
     - 将当前 `version` 写入本地存储，作为下次比较的「上次使用的 H5 版本」。  
   - 若 `version` 与本地一致 → 视为**同版本**：  
     - 直接使用 `{baseUrl}{path}?v={本地保存的 version}` 加载。  
     - 此时可优先使用缓存（如 WebView 的「缓存优先」策略），实现快速打开和断网可用。

3. **WebView 缓存策略**  
   - **同版本**：建议优先用缓存（如 Android `LOAD_CACHE_ELSE_NETWORK`），未命中再走网络。  
   - **新版本**：建议先清缓存再加载，或使用「网络优先」确保拿到新资源。

---

## 三、各平台要点

### Android

- **请求 version.json**：使用 `OkHttp` 等时，可设置 `CacheControl.FORCE_NETWORK` 或 `Request.Builder().cacheControl(CacheControl.FORCE_NETWORK)`，避免读本地缓存。
- **保存/读取版本号**：例如用 `SharedPreferences` 存 `h5_version`。
- **加载 URL**：在原有路径后追加 `?v=` + 版本号，例如：  
  `webView.loadUrl(h5BaseUrl + "/habit/period/intro?v=" + version);`
- **版本变更时清缓存**：  
  `WebView.clearCache(true);` 或按域名清理（若使用自定义缓存目录）。
- **同版本优先缓存**：  
  `webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);`（仅在同版本加载时使用；新版本时建议先清缓存再设为 `LOAD_DEFAULT` 或 `LOAD_NO_CACHE` 拉新）。

### iOS (WKWebView)

- **请求 version.json**：使用 `URLSession` 时，请求的 `cachePolicy` 设为 `.reloadIgnoringLocalCacheData`，避免命中本地缓存。
- **保存/读取版本号**：`UserDefaults` 或 Keychain。
- **加载 URL**：在 path 后加 `?v=` + 版本号。
- **版本变更时清缓存**：清理 `WKWebsiteDataStore` 中该域名的缓存（如 `WKWebsiteDataStore.default().removeData(ofTypes: ..., for: ...)`）。
- **同版本**：使用默认或「优先缓存」策略即可，系统会按 HTTP 缓存头缓存带 `?v=` 的 URL。

### 鸿蒙 (Web)

- **请求 version.json**：使用 `http` 模块发请求时，请求头可加 `Cache-Control: no-cache`，或使用「禁止缓存」的策略。
- **保存/读取版本号**：`Preferences` 等持久化。
- **加载 URL**：`WebController.loadUrl()` 时使用 `url + "?v=" + version`。
- **版本变更时清缓存**：按鸿蒙文档清理 Web 组件缓存或该域名数据。
- **同版本**：优先使用缓存策略，使同一 `?v=` URL 从本地加载。

---

## 四、发版时注意

- 每次要对外发布新 H5 时，在 **website** 项目中把 `package.json` 的 `version` 升一档（如 `1.0.0` → `1.0.1`），再执行构建部署。
- 构建时会自动执行 `node scripts/gen-version.js`，把当前 `version` 和 `buildTime` 写入 `public/version.json` 并随站一起部署，客户端拉取到的即为新版本号。

按上述方式对接后，同版本会走本地缓存（加载更快、断网可用），版本升级后会自动用新 `?v=` 拉取最新资源并更新本地缓存。
