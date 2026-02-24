import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app_icon.png', 'favicon.ico'],
      manifest: {
        name: 'Tiny Habits - 小习惯',
        short_name: '小习惯',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6B8A',
        icons: [
          {
            src: '/app_icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/app_icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
      output: {
        // 代码分割配置
        manualChunks: {
          // React核心库单独打包
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 图表库单独打包（较大）
          'charts-vendor': ['recharts'],
          // 图标库单独打包
          'icons-vendor': ['lucide-react'],
        },
        // 优化chunk大小警告阈值
        chunkSizeWarningLimit: 1000,
      },
    },
    // 启用压缩（使用esbuild，更快）
    minify: 'esbuild',
    // 生产环境移除console和debugger
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // 提高构建性能
    chunkSizeWarningLimit: 1000,
    // 启用sourcemap（可选，用于调试）
    sourcemap: false,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

