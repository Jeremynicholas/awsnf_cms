import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { watch } from 'vue'
import { SITE_NAME } from '../constants.js'
import Admin from '../views/Admin.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import PostSlug from '../views/PostSlug.vue'
import Trips from '../views/Trips.vue'
import Accommodation from '../views/Accommodation.vue'
import Blogs from '../views/Blogs.vue'
import NotFound from '../views/404.vue'
import Brochures from '../views/Brochures.vue'
import Media from '../views/Media.vue'
import Countries from '../views/Countries.vue'
import Regions from '../views/Regions.vue'
import Areas from '../views/Areas.vue'
import TripTypes from '../views/TripTypes.vue'
import GlobalData from '../views/GlobalData.vue'
import Forms from '../views/Forms.vue'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { 
            public: true,
            title: `Login`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
    {
        path: '/',
        name: 'home',
        meta: { 
            public: true,
        }, 
    },
    {
        path: '/admin',
        name: 'admin',
        component: Admin,
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
       {
        path: '/:type/:vueSlug',
        name: 'type-slug',
        component: PostSlug,
          props: true,
            meta: { 
                title: 'Post Details',
                pageTitle: 'Travel Planner', 
                description: 'Dashboard',
            }, 
    },

    {
        path: '/trips',
        name: 'trips',
        component: Trips,
        props: { isSpecial: false },
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },

    {
        path: '/specials',
        name: 'specials',
        component: Trips,
        props: { isSpecial: true },
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },

    {
        path: '/group-tours',
        name: 'group-tours',
        component: Trips,
        props: { isGroupTour: true },
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
    
    {
        path: '/accommodation',
        name: 'accommodation',
        component: Accommodation,
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
    
    {
        path: '/blogs',
        name: 'blogs',
        component: Blogs,
        meta: { 
            title: `${SITE_NAME} | Experts in bespoke travel`,
            pageTitle: 'Experts in bespoke travel', 
            description: 'Experts in bespoke travel',
        }, 
    },
    
   
    {
        path: '/brochures',
        name: 'brochures',
        component: Brochures,
        meta: { 
            title: 'Brochures',
            pageTitle: 'Brochures', 
            description: 'Brochures',
        }, 
    },
    {
        path: '/media',
        name: 'media',
        component: Media,
        meta: { 
            title: 'Media',
            pageTitle: 'Media', 
            description: 'Media',
        }, 
    },

    {
        path: '/regions',
        name: 'regions',
        component: Regions,
        meta: { 
            title: 'Regions',
            pageTitle: 'Regions', 
            description: 'Regions',
        }, 
    },
    
    {
        path: '/countries',
        name: 'countries',
        component: Countries,
        meta: { 
            title: 'Countries',
            pageTitle: 'Countries', 
            description: 'Countries',
        }, 
    },
    
    {
        path: '/areas',
        name: 'areas',
        component: Areas,
        meta: { 
            title: 'Areas',
            pageTitle: 'Areas', 
            description: 'Areas',
        }, 
    },
    
    {
        path: '/types',
        name: 'types',
        component: TripTypes,
        meta: { 
            title: 'Trip Types',
            pageTitle: 'Trip Types', 
            description: 'Trip Types',
        }, 
    },
    
    {
        path: '/global',
        name: 'global',
        component: GlobalData,
        meta: { 
            title: 'Global Data',
            pageTitle: 'Global Data', 
            description: 'Global Data',
        }, 
    },
    
    {
        path: '/forms',
        name: 'forms',
        component: Forms,
        meta: { 
            title: 'Forms',
            pageTitle: 'Forms', 
            description: 'Forms',
        }, 
    },

    /*--- 404 ---*/
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: NotFound,
        meta: {
            public: true,
            title: `${SITE_NAME} | 404 Page`,
            pageTitle: 'Oops wrong page', 
            description: "Looks like you've followed a broken link or entered a URL that doesn't exist on this site.",
        },        
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0, behavior: 'smooth' };
    },
  });
    

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || SITE_NAME;
    const authStore = useAuthStore()

    if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = watch(() => authStore.loading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
  })
}
  const isLoggedIn = !!authStore.user
  const isPublic = !!to.meta.public

  if (to.name === 'home') {
    return next({ name: isLoggedIn ? 'dashboard' : 'login' })
  }

  if (!isLoggedIn && !isPublic) {
    return next({ name: 'login' })
  }

  if (isLoggedIn && to.name === 'login') {
    return next({ name: 'dashboard' })
  }

  next()
});


export default router;