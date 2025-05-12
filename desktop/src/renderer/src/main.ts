import './assets/base.scss'

/**
 * @description 注册svg icon图标
 */
import 'virtual:svg-icons-register'
import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import { router } from './router'
import { init } from './lib/ininApp'

const app = createApp(App)
app.use(router)
app.use(ArcoVue)
init(app)
app.mount('#app')
