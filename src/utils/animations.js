/**
 * Animation Utilities
 * Smooth scroll animations and micro-interactions
 */

/**
 * Initialize scroll animations using Intersection Observer
 */
export function initScrollAnimations() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
  animatedElements.forEach((el) => observer.observe(el));
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element, offset = 80) {
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

/**
 * Add parallax effect to element
 */
export function addParallaxEffect(element, speed = 0.5) {
  if (!element) return;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * speed;
    element.style.transform = `translateY(${parallax}px)`;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Animate number counter
 */
export function animateCounter(element, target, duration = 2000) {
  if (!element) return;

  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(start);
    }
  }, 16);
}

/**
 * Add stagger animation to list items
 */
export function staggerAnimation(selector, delay = 100) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * delay}ms`;
    el.classList.add('stagger-animate');
  });
}

/**
 * Add hover scale effect
 */
export function addHoverScale(element, scale = 1.05) {
  if (!element) return;

  element.addEventListener('mouseenter', () => {
    element.style.transform = `scale(${scale})`;
    element.style.transition = 'transform 0.3s ease';
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
  });
}

/**
 * Page transition animation
 */
export function pageTransition(callback) {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';

  setTimeout(() => {
    if (callback) callback();
    document.body.style.opacity = '1';
  }, 300);
}

