import './style.css'
import '@unocss/reset/normalize.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import generatedRoutes from '~pages'
import App from './App.vue'
import 'virtual:uno.css'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'

const app = createApp(App)
const routes = setupLayouts(generatedRoutes)
const pinia = createPinia()

const router = createRouter({
    routes,
    history: createWebHistory(),
})

router.beforeEach((to, from, next) => {
    const userinfo = useStorage('userinfo', { username: '', token: '' })
    if (userinfo.value.token) {
        if (to.path === '/login') {
            return next('/')
        }
    } else {
        if (['/', '/register', '/login'].includes(to.path) || to.path.startsWith('/memo/')) {
            return next()
        } else {
            return next('/login?redirect=' + to.path)
        }
    }
    next()
})
app.use(router)
app.use(pinia)
app.mount('#app')
