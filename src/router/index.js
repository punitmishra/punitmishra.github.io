import { createRouter, createWebHashHistory } from "vue-router";
import { defineAsyncComponent } from "vue";

// Portfolio loads immediately since it's the main page
import Portfolio from "@/views/PortfolioView.vue";

// ProjectDetail lazy loads only when navigating to project page
const ProjectDetail = defineAsyncComponent(() => import("@/views/ProjectDetailView.vue"));

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
