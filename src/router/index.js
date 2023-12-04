import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VideoView from '../views/VideoView.vue'

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL),
  routes: [{
      path: '/',
      name: 'home',
      redirect: { path: '/slideshow' },
      component: HomeView
    },
    {
      path: '/slideshow',
      name: 'slideshow',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../components/VideoViewer.vue')
    },
    {
      path: '/whiteboard',
      name: 'whiteboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/WhiteboardView.vue')
    },
    {
      path: '/oldwhiteboard',
      name: 'oldwhiteboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/WhiteboardViewOld.vue')
    },
    {
      path: '/vid/:video',
      name: 'video',
      component: VideoView
    }
  ]
})

export default router