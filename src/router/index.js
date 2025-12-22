import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UpdatesView from '../views/UpdatesView.vue'
import AboutView from '../views/AboutView.vue'
import RecommendationsView from '../views/RecommendationsView.vue'

// Automatically import all case components
const caseFiles = require.context('../views/cases', false, /\.vue$/)
const caseRoutes = caseFiles.keys().map(key => {
  const component = caseFiles(key).default || caseFiles(key)
  const name = key.replace(/^\.\/(.*)\.\w+$/, '$1')
  
  // Determine path: use caseInfo.path if available, else kebab-case of filename
  const pathSegment = component.caseInfo?.path || name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  
  return {
    path: `/cases/${pathSegment}`,
    name: name,
    component: component
  }
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/updates',
    name: 'Updates',
    component: UpdatesView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/recommendations',
    name: 'Recommendations',
    component: RecommendationsView
  },
  ...caseRoutes
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
