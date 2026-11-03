import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { APP_CONFIG } from './src/config/appConfig';

// Parse base origin & path prefix from the central configuration URL
const parsedUrl = new URL(APP_CONFIG.API_BASE_URL);
const targetHost = `${parsedUrl.protocol}//${parsedUrl.host}`;
const contextPath = parsedUrl.pathname.replace(/\/+$/, '');

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `${contextPath}/merchantportal-v2/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
        target: targetHost,
        changeOrigin: true,
        secure: false, // Don't verify SSL certs
        rewrite: (path) => path.replace(/^\/api/, contextPath),
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: { '*': '/' },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // Strip out Secure and SameSite attributes so localhost accepts the cookie
              proxyRes.headers['set-cookie'] = setCookie.map((cookie) => {
                return cookie
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=(Lax|Strict|None)/gi, '');
              });
            }
          });
        },
      },
    },
  },
  oxc: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/scripts.js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/styles.css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
});
