import { createRouter, createWebHistory } from 'vue-router'
import RoomView from '../views/RoomView.vue'
import LoginView from '../views/LoginView.vue'
import RoomListView from '../views/RoomListView.vue'
import DataRoomView from "../views/DataRoomView.vue";

const routes = [
    {
        path: '/',
        name: 'data',
        component: DataRoomView
    },
    {
        path: '/room/:roomId',
        name: 'Room',
        component: RoomView,
        props: true
    },
    {
        path: '/room/list',
        name: 'room-list',
        component: RoomListView,
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router