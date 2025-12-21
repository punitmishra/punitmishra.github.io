// Scroll-based animations and effects

/**
 * Animate elements on scroll with Intersection Observer
 */
export const initScrollAnimations = () => {
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => {
      observer.observe(el);
    });
  }
};

/**
 * Parallax effect for hero section
 */
export const initParallax = () => {
  const hero = document.querySelector('#hero');
  if (!hero) return;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    hero.style.transform = `translateY(${rate}px)`;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

/**
 * Smooth scroll to section with offset
 */
export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Progress bar for page scroll
 */
export const initScrollProgress = () => {
  const progressBar = document.createElement('div');
  progressBar.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 z-50 transition-all duration-150';
  progressBar.style.width = '0%';
  document.body.appendChild(progressBar);

  const updateProgress = () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
};

