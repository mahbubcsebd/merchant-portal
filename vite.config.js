import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://core1.moadbusglobal.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/walletmc'),
      },
    },
  },
})
