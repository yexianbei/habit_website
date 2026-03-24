import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'

function getRuntimeEnvInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  return {
    url: typeof location !== 'undefined' ? location.href : '',
    ua,
    hasCallNative: typeof window !== 'undefined' && typeof window.callNative === 'function',
    nativeBridgeReady: typeof window !== 'undefined' && !!window.__nativeBridgeReady,
    hasNativeBridge: typeof window !== 'undefined' && !!window.NativeBridge,
    hasNativeBridgePostMessage:
      typeof window !== 'undefined' &&
      !!(window.NativeBridge && typeof window.NativeBridge.postMessage === 'function'),
    hasJSBridgeInvoke:
      typeof window !== 'undefined' &&
      !!(window.JSBridge && typeof window.JSBridge.invoke === 'function'),
  }
}

function pushRuntimeDiag(level, message, extra) {
  try {
    if (!window.__H5_RUNTIME_DIAG__) window.__H5_RUNTIME_DIAG__ = []
    window.__H5_RUNTIME_DIAG__.push({
      t: Date.now(),
      level,
      message,
      extra: extra || null,
    })
    if (window.__H5_RUNTIME_DIAG__.length > 200) window.__H5_RUNTIME_DIAG__.shift()
  } catch (_) {}
  try {
    const fn = level === 'error' ? console.error : (level === 'warn' ? console.warn : console.log)
    fn('[H5Runtime]', message, extra || '')
  } catch (_) {}
}

function showFatalOverlay(title, details) {
  try {
    const root = document.getElementById('root')
    if (!root) return
    root.innerHTML = `
      <div style="min-height:100vh;padding:24px;display:flex;align-items:center;justify-content:center;background:#fff7f7;color:#222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <div style="max-width:720px;width:100%;background:#fff;border:1px solid #ffd5d5;border-radius:12px;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.06);">
          <h3 style="margin:0 0 8px 0;color:#c62828;font-size:18px;">${title}</h3>
          <p style="margin:0 0 10px 0;color:#555;">页面加载失败，请点击重试；如仍失败，请把下面信息给开发排查。</p>
          <pre style="max-height:260px;overflow:auto;background:#fafafa;border:1px solid #eee;padding:10px;border-radius:8px;font-size:12px;white-space:pre-wrap;word-break:break-word;">${details}</pre>
          <button id="h5-reload-btn" style="margin-top:12px;padding:10px 14px;border:none;border-radius:8px;background:#ff5858;color:#fff;cursor:pointer;">重试加载</button>
        </div>
      </div>
    `
    const btn = document.getElementById('h5-reload-btn')
    if (btn) {
      btn.onclick = () => {
        const u = new URL(window.location.href)
        u.searchParams.set('_rt', String(Date.now()))
        window.location.replace(u.toString())
      }
    }
  } catch (_) {}
}

// 处理 Vite 预加载失败（常见于 index 与 chunk 缓存不一致）
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  const env = getRuntimeEnvInfo()
  pushRuntimeDiag('error', 'vite:preloadError', env)
  const retried = sessionStorage.getItem('__h5_preload_retry__') === '1'
  if (!retried) {
    sessionStorage.setItem('__h5_preload_retry__', '1')
    const u = new URL(window.location.href)
    u.searchParams.set('_pv', String(Date.now()))
    window.location.replace(u.toString())
    return
  }
  showFatalOverlay('资源加载失败（可能是缓存版本不一致）', JSON.stringify(env, null, 2))
})

window.addEventListener('error', (event) => {
  const payload = {
    msg: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    env: getRuntimeEnvInfo(),
  }
  pushRuntimeDiag('error', 'window.onerror', payload)
  try {
    if (window.HabitBridge && typeof window.HabitBridge.postMessage === 'function') {
      window.HabitBridge.postMessage(
        JSON.stringify({
          method: '__debug__.h5Error',
          params: payload,
          callbackId: -1,
        })
      )
    }
  } catch (_) {}
})

window.addEventListener('unhandledrejection', (event) => {
  const payload = {
    reason: event.reason ? String(event.reason?.message || event.reason) : 'unknown',
    env: getRuntimeEnvInfo(),
  }
  pushRuntimeDiag('error', 'unhandledrejection', payload)
  try {
    if (window.HabitBridge && typeof window.HabitBridge.postMessage === 'function') {
      window.HabitBridge.postMessage(
        JSON.stringify({
          method: '__debug__.h5Error',
          params: payload,
          callbackId: -1,
        })
      )
    }
  } catch (_) {}
})

// 卸载可能存在的 Service Worker，防止旧缓存导致无法获取最新更新
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister()
    }
  }).catch((err) => {
    console.error('Service Worker unregistration failed: ', err)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

