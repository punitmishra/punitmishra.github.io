import { createRouter, createWebHashHistory } from "vue-router";
import { defineAsyncComponent } from "vue";
import { initSEO } from "@/utils/seo";

// Portfolio loads immediately since it's the main page
import Portfolio from "@/views/PortfolioView.vue";

// ProjectDetail lazy loads only when navigating to project page
const ProjectDetail = defineAsyncComponent(() => import("@/views/ProjectDetailView.vue"));

const routes = [
  {
    meta: {
      title: "Punit Mishra - Portfolio",
      description: "Full Stack Software Engineer with 12+ years of experience building scalable applications from silicon to software. Specialized in AI/ML infrastructure, systems architecture, and enterprise software development.",
    },
    path: "/",
    name: "portfolio",
    component: Portfolio,
  },
  {
    meta: {
      title: "Project Details",
      description: "Detailed view of project including technologies, features, and contributions.",
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

// SEO integration - update meta tags on route change
router.afterEach((to) => {
  initSEO({
    title: to.meta?.title,
    description: to.meta?.description,
    path: to.fullPath,
  });
});

export default router;
