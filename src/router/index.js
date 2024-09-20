import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    // {
    //     path: '/',
    //     name: 'home',
    //     component: HomeView
    // },
    {
        path: '/singler',
        name: 'corner',
        component: () => import('../views/single_view.vue')
    },
    {
        path: '/doubler',
        name: 'doubler',
        component: () => import('../views/double_view.vue'),
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
