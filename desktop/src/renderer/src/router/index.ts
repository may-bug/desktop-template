import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: '登录'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/login/index.vue')
  },
  {
    path: '/welcome',
    name: 'welcome',
    meta: {
      title: '欢迎'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/welcome/index.vue')
  },
  {
    path: '/',
    name: 'main',
    meta: {
      title: '主界面'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/main/index.vue'),
    children: [
      {
        path: '',
        name: 'main-home',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/main/home/index.vue')
      }
    ]
  },
  {
    path: '/close',
    name: 'close',
    meta: {
      title: '提示'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/close/index.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: {
      title: '关于'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/about/index.vue')
  },
  {
    path: '/setting',
    name: 'setting',
    meta: {
      title: '设置'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/setting/index.vue'),
    children: [
      {
        path: '',
        name: 'setting-common',
        meta: {
          title: '通用'
        },
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/setting/common/index.vue')
      },
      {
        path: 'other',
        name: 'setting-other',
        meta: {
          title: '其它'
        },
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/setting/other/index.vue')
      }
    ]
  },
  {
    path: '/file',
    name: 'file',
    meta: {
      title: '文件'
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    component: () => import('@renderer/views/file/index.vue'),
    children: [
      {
        path: '',
        name: 'file-common',
        meta: {
          title: '我的文件'
        },
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/file/common/index.vue')
      },
      {
        path: 'local',
        name: 'file-local',
        meta: {
          title: '本机文件'
        },
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/file/local/index.vue')
      },
      {
        path: 'other',
        name: 'file-other',
        meta: {
          title: '其它文件'
        },
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        component: () => import('@renderer/views/file/other/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  document.title = to.meta.title
})

export { router }
