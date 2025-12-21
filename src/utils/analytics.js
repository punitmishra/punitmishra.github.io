/**
 * Analytics Utilities
 * Handles Google Analytics 4 and custom event tracking
 */

// Google Analytics 4 Measurement ID (set via environment variable or config)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Initialize Google Analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined') {
    return;
  }
  
  if (!GA_MEASUREMENT_ID) {
    console.log('Analytics: GA_MEASUREMENT_ID not set, analytics disabled');
    return;
  }

  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname + window.location.search,
  });
}

/**
 * Track page view
 */
export function trackPageView(path, title) {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track custom event
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', eventName, eventParams);
}

/**
 * Track project click
 */
export function trackProjectClick(projectName, projectUrl) {
  trackEvent('project_click', {
    project_name: projectName,
    project_url: projectUrl,
    event_category: 'engagement',
    event_label: 'Project Interaction',
  });
}

/**
 * Track GitHub link click
 */
export function trackGitHubClick(linkType, url) {
  trackEvent('github_click', {
    link_type: linkType, // 'profile', 'repo', 'star', etc.
    url: url,
    event_category: 'social',
    event_label: 'GitHub Interaction',
  });
}

/**
 * Track contact form submission
 */
export function trackContactForm(action, success = true) {
  trackEvent('contact_form', {
    action: action, // 'submit', 'error', 'success'
    success: success,
    event_category: 'engagement',
    event_label: 'Contact Form',
  });
}

/**
 * Track skill section view
 */
export function trackSkillView(skillName) {
  trackEvent('skill_view', {
    skill_name: skillName,
    event_category: 'engagement',
    event_label: 'Skills Interaction',
  });
}

/**
 * Track download action
 */
export function trackDownload(fileType, fileName) {
  trackEvent('file_download', {
    file_type: fileType, // 'resume', 'pdf', etc.
    file_name: fileName,
    event_category: 'engagement',
    event_label: 'File Download',
  });
}

/**
 * Track external link click
 */
export function trackExternalLink(url, linkText) {
  trackEvent('external_link', {
    url: url,
    link_text: linkText,
    event_category: 'outbound',
    event_label: 'External Link',
  });
}

/**
 * Track scroll depth
 */
let maxScrollDepth = 0;
export function trackScrollDepth() {
  if (typeof window === 'undefined') return;

  const trackScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    // Track milestones: 25%, 50%, 75%, 100%
    if (scrollPercent >= 25 && maxScrollDepth < 25) {
      maxScrollDepth = 25;
      trackEvent('scroll_depth', { depth: 25 });
    } else if (scrollPercent >= 50 && maxScrollDepth < 50) {
      maxScrollDepth = 50;
      trackEvent('scroll_depth', { depth: 50 });
    } else if (scrollPercent >= 75 && maxScrollDepth < 75) {
      maxScrollDepth = 75;
      trackEvent('scroll_depth', { depth: 75 });
    } else if (scrollPercent >= 100 && maxScrollDepth < 100) {
      maxScrollDepth = 100;
      trackEvent('scroll_depth', { depth: 100 });
    }
  };

  window.addEventListener('scroll', trackScroll, { passive: true });
}

/**
 * Track time on page
 */
export function trackTimeOnPage() {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();

  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
    trackEvent('time_on_page', {
      time_seconds: timeSpent,
      event_category: 'engagement',
    });
  });
}

