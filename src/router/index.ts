import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import('@/pages/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('@/pages/user/UserRegisterPage.vue'),
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('@/pages/admin/UserMangePage.vue'),
    },
    {
      path: '/user/info',
      name: '用户信息编辑',
      component: () => import('@/pages/user/UserInfo.vue'),
    },
    {
      path: '/add-picture',
      name: '添加图片',
      component: () => import('@/pages/AddPicturePage.vue'),
    },
  ],
})

export default router
