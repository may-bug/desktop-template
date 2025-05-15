import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    global: 'window'
  },
  server: {
    allowedHosts:['localhost','net.tecgui.cn','127.0.0.1'],
    proxy: {
      '/api': {
        // target: 'http://localhost:8080',
        target: 'https://server.tecgui.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
