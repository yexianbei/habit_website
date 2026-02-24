# WebView 按版本缓存 — 客户端修改说明（iOS / 鸿蒙 参考）

本文说明如何在前端已支持 **version.json** 的前提下，在 **Android / iOS / 鸿蒙** 客户端内实现「按版本号缓存 H5」：**同版本走本地缓存**（加载更快、断网可用），**版本升级后自动拉取最新资源**。Android 已按此方案实现，iOS、鸿蒙 可参照本文与 [WEBVIEW_VERSION_CACHE.md](./WEBVIEW_VERSION_CACHE.md) 做对应修改。

---

## 一、服务端约定（简要）

| 项目 | 说明 |
|------|------|
| 版本接口 | `GET {H5 根地址}/version.json`，例如 `https://tinyhabits.top/version.json` |
| 响应示例 | `{"version":"1.0.0","buildTime":"2025-02-23T12:00:00.000Z"}` |
| 版本校验 | 请求 version.json 时**不要使用本地缓存**，确保拿到最新版本号 |
| 页面 URL | 加载任意 H5 页面时在 URL 后追加 `?v={version}`（若已有 `?` 则用 `&v=`） |

更详细的接口与缓存说明见 [WEBVIEW_VERSION_CACHE.md](./WEBVIEW_VERSION_CACHE.md)。

---

## 二、客户端必须实现的逻辑

无论平台，都需要实现下面同一套流程（Android 已按此实现，可作为对照）。

### 1. 打开 H5 页面前的流程

1. **请求 version.json**  
   - URL：`{当前使用的 H5 根地址}/version.json`  
   - 要求：**禁止使用本地缓存**（见各平台下文），以便每次校验都拿到线上最新版本。

2. **解析版本号**  
   - 从 JSON 中读取 `version` 字段；若请求失败或解析失败，则视为「无服务端版本」，走下面的降级逻辑。

3. **与本地保存的「上次使用的 H5 版本」比较**  
   - 本地无记录 或 服务端 `version` ≠ 本地保存的版本 → **视为版本已更新**：  
     - 清理 WebView 对该域名（或全局）的缓存；  
     - 使用「网络优先」加载（不强制用缓存）；  
     - 加载地址：`{原页面 URL}?v={当前解析到的 version}`（若原 URL 已有 `?`，则用 `&v=`）；  
     - 将当前 `version` 写入本地存储，作为下次的「上次使用的 H5 版本」。  
   - 服务端 `version` == 本地保存的版本 → **视为同版本**：  
     - 不清理缓存；  
     - 使用「缓存优先」加载（如 Android 的 `LOAD_CACHE_ELSE_NETWORK`）；  
     - 加载地址：`{原页面 URL}?v={本地保存的 version}`。

4. **降级（拿不到 version.json 时）**  
   - 若有本地保存的版本号：用该版本号拼 `?v=`，并优先走缓存（保证断网时仍能打开上次缓存的版本）。  
   - 若无：可用默认版本号（如 `1.0.0`）拼 `?v=`，并建议优先走缓存。

### 2. URL 拼接规则

- 原 URL 无查询参数：`原URL + "?v=" + version`  
  例：`https://tinyhabits.top/habit/period/intro?v=1.0.0`
- 原 URL 已有查询参数：`原URL + "&v=" + version`  
  例：`https://tinyhabits.top/detail.html?habitId=xxx&v=1.0.0`

---

## 三、Android 已实现说明（供对照）

- **实现位置**：`HabitWebViewActivity`  
- **流程**：`initComponent` 中调用 `fetchH5VersionAndLoad()` → 使用 OkHttp 请求 `{h5BaseUrl}/version.json`，并设置 `CacheControl.FORCE_NETWORK` → 在回调中解析 `version`，与 `SharedPreferences` 中 key `h5_version`（prefs 名 `habit_h5_data`）比较 → 若版本变化则 `webView.clearCache(true)` 并 `setCacheMode(LOAD_DEFAULT)`，否则 `setCacheMode(LOAD_CACHE_ELSE_NETWORK)` → 用 `buildPageUrl()` 得到页面 URL，经 `appendVersionParam(url, version)` 拼上 `?v=` 或 `&v=` 后 `loadUrl`。  
- **存储**：`SharedPreferences("habit_h5_data").putString("h5_version", version)`。

iOS、鸿蒙 只需在各自 WebView 加载 H5 的入口处实现与上述**语义等价**的逻辑即可。

---

## 四、iOS 修改要点（WKWebView）

| 步骤 | 说明 |
|------|------|
| 请求 version.json | 使用 `URLSession` 请求 `{baseURL}/version.json`，`URLRequest` 的 `cachePolicy` 设为 `.reloadIgnoringLocalCacheData`，避免读本地缓存。 |
| 保存/读取版本号 | 使用 `UserDefaults` 或 Keychain，例如 key：`h5_version`。 |
| 版本比较与缓存策略 | 若解析出的 `version` 与本地保存不同（或本地无）：清理 WKWebView 缓存后加载，并保存新版本；若相同：不清理，优先使用缓存加载。 |
| 清理缓存 | `WKWebsiteDataStore.default().removeData(ofTypes: WKWebsiteDataStore.allWebsiteDataTypes(), for: [WKWebsiteRecord])` 或按域名过滤后删除。 |
| 加载 URL | 所有打开 H5 的入口统一在 path 后追加 `?v=` 或 `&v=` + 版本号再 `load(URLRequest)`。 |

这样即可实现与 Android 一致的行为：同版本走缓存、断网可用；版本更新后自动用新 `?v=` 拉新并更新本地版本号。

---

## 五、鸿蒙修改要点（Web 组件）

| 步骤 | 说明 |
|------|------|
| 请求 version.json | 使用 `@ohos.net.http` 或项目现有 HTTP 能力请求 `{baseURL}/version.json`，请求头设置 `Cache-Control: no-cache` 或使用「禁止使用缓存」的策略。 |
| 保存/读取版本号 | 使用 `@ohos.data.preferences` 的 `Preferences` 等持久化存储，例如 key：`h5_version`。 |
| 版本比较与缓存策略 | 与 iOS/Android 一致：版本变化则清理 Web 缓存并保存新版本；同版本则优先缓存。 |
| 清理缓存 | 按鸿蒙文档清理 Web 组件缓存或该域名下的数据。 |
| 加载 URL | `WebController.loadUrl()` 时传入的 URL 统一为「原页面 URL + ?v= 或 &v= + 版本号」。 |

---

## 六、配置与发版

- **前端发版**：在 website 项目中升级 `package.json` 的 `version` 后重新构建部署，部署后 `version.json` 会返回新版本号。  
- **客户端**：无需改配置；只要按上述实现「请求 version.json → 比较本地版本 → 拼 ?v= → 设置缓存策略」，即可自动在下次打开 H5 时拿到新版本并更新缓存。

按上述方式修改后，iOS、鸿蒙 与 Android 行为一致：同版本使用本地缓存（加载更快、断网可用），版本升级后自动拉取最新资源并更新本地缓存。
