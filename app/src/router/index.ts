//@ts-nocheck
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import MainView from '../views/main/index.vue'
import HomeView from '../views/main/home/index.vue'
import APPView from '../views/main/app/index.vue'
import MessageView from '../views/main/message/index.vue'
import MineView from '../views/main/mine/index.vue'
import ScanView from '../views/scan/index.vue'
import LoginView from '../views/login/index.vue'

const routes = [
  {
    path: "/",
    redirect: "/main/home",
  },
  {
    path: '/main',
    name: 'main',
    meta: {
      title: '主界面'
    },
    component: MainView,
    children: [
      {
        path: 'home',
        name: 'home',
        meta: {
          title: '首页'
        },
        component: HomeView,
      },
      {
        path: 'app',
        name: 'app',
        meta: {
          title: '应用'
        },
        component: APPView,
      },
      {
        path: 'message',
        name: 'message',
        meta: {
          title: '消息'
        },
        component: MessageView,
      },
      {
        path: 'mine',
        name: 'mine',
        meta: {
          title: '我的'
        },
        component: MineView,
      },
    ]
  },
  {
    path: '/scan',
    name: 'scan',
    meta: {
      title: '扫一扫'
    },
    component: ScanView
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录'
    },
    component: LoginView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 存储路由历史记录
const routeHistory = []

router.beforeEach((to, from) => {
  // 判断前进还是后退
  const fromIndex = routeHistory.indexOf(from.name)
  const toIndex = routeHistory.indexOf(to.name)

  if (fromIndex !== -1 && toIndex !== -1) {
    // 后退
    if (fromIndex > toIndex) {
      to.meta.transition = 'backward'
      // 移除后面的历史记录
      routeHistory.splice(fromIndex + 1)
    }
    // 前进（已访问过的页面）
    else {
      to.meta.transition = 'forward'
    }
  }
  // 新页面（前进）
  else {
    to.meta.transition = 'forward'
    if (to.name) {
      routeHistory.push(to.name)
    }
  }
})

export { router }
