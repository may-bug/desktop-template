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
        component:()=>import("../views/desktop/index.vue"),
        children:[
            {
                path:'',
                name:'device',
                component:()=>import("../views/desktop/device/index.vue")
            },{
                path:'loading',
                name:'loading',
                component:()=>import("../views/desktop/loading/index.vue")
            },
            {
                path:'control',
                name:'control',
                component:()=>import("../views/desktop/control/index.vue")
            },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export {router}