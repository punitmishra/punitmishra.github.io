import { createRouter, createWebHashHistory } from "vue-router";
import { defineAsyncComponent } from "vue";

// Lazy load ProjectDetail for better performance (only loads when navigating to project page)
// Portfolio loads immediately since it's the main page
import Portfolio from "@/views/PortfolioView.vue";
const ProjectDetail = defineAsyncComponent({
  loader: () => import("@/views/ProjectDetailView.vue"),
  loadingComponent: null,
  errorComponent: null,
  delay: 200,
  timeout: 3000,
});

const routes = [
  {
    meta: {
      title: "Punit Mishra - Portfolio",
    },
    path: "/",
    name: "portfolio",
    component: Portfolio,
  },
  {
    meta: {
      title: "Project Details",
    },
    path: "/project/:id",
    name: "project-detail",
    component: ProjectDetail,
  },
];

const router = createRouter({
  // Use hash history for GitHub Pages compatibility
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return savedPosition || { top: 0 };
  },
});

export default router;
