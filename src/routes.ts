import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/chat',
  },
  {
    path: '/chat',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'ChatList',
        component: () => import('@/pages/chat/EmptyPage.vue'),
      },
      {
        path: ':id',
        name: 'ChatRoom',
        component: () => import('@/pages/chat/ChatPage.vue'),
      }
    ]
  },

  {
    path: '/auth',
    component: () => import('@/layout/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/auth/login/LoginPage.vue'),
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, _, next) => {


    next();
});

export default router;