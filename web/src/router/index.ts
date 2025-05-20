import {createRouter, createWebHistory} from "vue-router";

const routes=[
    {
        path:'/',
        name:'index',
        component:()=>import("../views/login/index.vue")
    },
    {
        path:'/desktop',
        name:'desktop',
        component:()=>import("../views/desktop/index.vue")
    },
    {
        path:'/device',
        name:'device',
        component:()=>import("../views/device/index.vue")
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export {router}