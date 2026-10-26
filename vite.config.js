import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/postcss";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
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
      "/api": {
        target: "https://core1.moadbusglobal.com",
        changeOrigin: true,
        secure: false, // Don't verify SSL certs
        rewrite: (path) => path.replace(/^\/api/, "/vwalletmc"),
        cookieDomainRewrite: "localhost",
        cookiePathRewrite: { "*": "/" },
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, _req, _res) => {
            proxyReq.setHeader("Origin", "https://core1.moadbusglobal.com");
            proxyReq.setHeader(
              "Referer",
              "https://core1.moadbusglobal.com/vwalletmc/merchantportal/",
            );
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              // Strip out Secure and SameSite attributes so localhost accepts the cookie
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) => {
                return cookie
                  .replace(/;\s*Secure/gi, "")
                  .replace(/;\s*SameSite=(Lax|Strict|None)/gi, "");
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
        entryFileNames: "assets/js/scripts.js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/css/styles.css";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
  },
});
