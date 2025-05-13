import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '',
    name: 'home',
    meta: {
      title: '登录'
    },
    component: () => import('../views/home/index.vue')
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
