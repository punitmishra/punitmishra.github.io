/**
 * SEO Utilities
 * Handles dynamic meta tags, structured data, and SEO optimization
 */

export const siteConfig = {
  title: 'Punit Mishra - Software Engineer Portfolio',
  description: 'Full Stack Software Engineer with 12+ years of experience building scalable applications from silicon to software. Specialized in AI/ML infrastructure, systems architecture, and enterprise software development.',
  url: 'https://punitmishra.com',
  image: 'https://punitmishra.com/assets/images/github-header-image-pm.png',
  author: 'Punit Mishra',
  keywords: [
    'Punit Mishra',
    'Software Engineer',
    'Full Stack Developer',
    'AI/ML Infrastructure',
    'Systems Architect',
    'Vue.js',
    'React',
    'Python',
    'Rust',
    'LangGraph',
    'Portfolio',
    'SAP',
    'Enterprise Software'
  ].join(', '),
};

/**
 * Update document title
 */
export function updateTitle(title) {
  document.title = title ? `${title} | ${siteConfig.title}` : siteConfig.title;
}

/**
 * Update meta tags
 */
export function updateMetaTags(meta = {}) {
  const {
    title = siteConfig.title,
    description = siteConfig.description,
    image = siteConfig.image,
    url = siteConfig.url,
    type = 'website',
  } = meta;

  // Basic meta tags
  updateMetaTag('name', 'description', description);
  updateMetaTag('name', 'keywords', siteConfig.keywords);
  updateMetaTag('name', 'author', siteConfig.author);

  // Open Graph
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:image', image);
  updateMetaTag('property', 'og:url', url);
  updateMetaTag('property', 'og:type', type);
  updateMetaTag('property', 'og:site_name', siteConfig.title);

  // Twitter Card
  updateMetaTag('property', 'twitter:card', 'summary_large_image');
  updateMetaTag('property', 'twitter:title', title);
  updateMetaTag('property', 'twitter:description', description);
  updateMetaTag('property', 'twitter:image', image);

  // Canonical URL
  updateCanonicalUrl(url);
}

/**
 * Update a single meta tag
 */
function updateMetaTag(attribute, name, content) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Update canonical URL
 */
function updateCanonicalUrl(url) {
  let element = document.querySelector('link[rel="canonical"]');
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', url);
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateStructuredData(type = 'Person', additionalData = {}) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: 'Punit Mishra',
    url: siteConfig.url,
    image: siteConfig.image,
    jobTitle: 'Senior Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'SAP',
    },
    sameAs: [
      'https://github.com/punitmishra',
      'https://linkedin.com/in/mishrapunit',
      'https://twitter.com/punitmishra',
    ],
    ...additionalData,
  };

  return baseData;
}

/**
 * Inject structured data into page
 */
export function injectStructuredData(data) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Initialize SEO for a route
 */
export function initSEO(routeMeta = {}) {
  updateTitle(routeMeta.title);
  updateMetaTags({
    title: routeMeta.title || siteConfig.title,
    description: routeMeta.description || siteConfig.description,
    url: `${siteConfig.url}${routeMeta.path || ''}`,
  });

  // Add Person structured data
  const personData = generateStructuredData('Person', {
    description: siteConfig.description,
    knowsAbout: [
      'Software Engineering',
      'AI/ML Infrastructure',
      'Systems Architecture',
      'Full Stack Development',
      'Rust',
      'Python',
      'Vue.js',
      'React',
    ],
  });
  injectStructuredData(personData);
}

