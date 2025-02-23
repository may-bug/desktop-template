import { resolve } from 'path'
import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { builtinModules } from 'node:module'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      /**
       * Vue
       */
      vue(),
      /**
       * @description 注册所有的svg文件生成svg雪碧图
       **/
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/renderer/src/assets/icons')], //svg图片存放的目录
        symbolId: 'icon-[dir]-[name]', // symbol的id
        inject: 'body-last', // 插入的位置
        customDomId: '__svg__icons__dom__' // svg的id
      })
    ],
    /**
     * @description 开发服务器代理
     */
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:9002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      rollupOptions: {
        external: ['electron', 'sqlite3', ...builtinModules]
      }
    }
  }
})
