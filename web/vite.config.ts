import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts:["net.tecgui.cn"],
    proxy: {
      '/api': {
        target: 'https://server.tecgui.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
