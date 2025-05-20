import { createApp } from 'vue'
import './style.css'
import '@arco-design/web-vue/dist/arco.css';
import App from './App.vue'
import {router} from './router'
import pinia from "./stores"
import ArcoDesign from "@arco-design/web-vue"


const app=createApp(App)
app.use(router)
app.use(pinia)
app.use(ArcoDesign)
app.mount('#app')
