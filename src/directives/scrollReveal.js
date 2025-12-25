// Scroll reveal directive for Vue 3
export const vScrollReveal = {
  mounted(el, binding) {
    const options = {
      threshold: binding.value?.threshold || 0.1,
      rootMargin: binding.value?.rootMargin || '0px',
      once: binding.value?.once !== false,
    };

    // Set initial state
    el.style.opacity = '0';
    el.style.transform = getInitialTransform(binding.arg);
    el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
    el.style.transitionDelay = binding.value?.delay || '0ms';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translate3d(0, 0, 0) scale(1)';

          if (options.once) {
            observer.unobserve(el);
          }
        } else if (!options.once) {
          el.style.opacity = '0';
          el.style.transform = getInitialTransform(binding.arg);
        }
      });
    }, options);

    observer.observe(el);
    el._scrollRevealObserver = observer;
  },

  unmounted(el) {
    if (el._scrollRevealObserver) {
      el._scrollRevealObserver.disconnect();
    }
  },
};

function getInitialTransform(direction) {
  switch (direction) {
    case 'up':
      return 'translate3d(0, 40px, 0)';
    case 'down':
      return 'translate3d(0, -40px, 0)';
    case 'left':
      return 'translate3d(40px, 0, 0)';
    case 'right':
      return 'translate3d(-40px, 0, 0)';
    case 'scale':
      return 'scale(0.95)';
    default:
      return 'translate3d(0, 30px, 0)';
  }
}

export default vScrollReveal;
