import Vue from 'vue'
import VueRouter from 'vue-router'
import single_view from '../views/single_view.vue'

Vue.use(VueRouter)

const routes = [
    // {
    //     path: '/',
    //     name: 'home',
    //     component: HomeView
    // },
    {
        path: '/',
        name: 'corner',
        component: single_view,
    },

    {
        path: '/doubler',
        name: 'doubler',
        component: () => import('../views/double_view.vue'),
    },

    {
        path: '/test_view',
        name: 'tester',
        component: () => import('../views/test_view.vue'),
    },
]

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})

export default router
