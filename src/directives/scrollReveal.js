// Scroll reveal directive for Vue 3.
// Fail-safe by design: content must NEVER be permanently stuck invisible.
// - Respects prefers-reduced-motion (shows immediately, no animation).
// - Reveals above-the-fold elements right away instead of waiting on the observer.
// - Falls back to a timer so anything the IntersectionObserver misses still appears.
export const vScrollReveal = {
  mounted(el, binding) {
    const noIO = typeof IntersectionObserver === 'undefined';
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If we can't animate safely, just show the content.
    if (noIO || reducedMotion) {
      el.style.opacity = '1';
      return;
    }

    const once = binding.value?.once !== false;

    // Initial (hidden) state
    el.style.opacity = '0';
    el.style.transform = getInitialTransform(binding.arg);
    el.style.transition =
      'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transitionDelay = binding.value?.delay || '0ms';

    const reveal = () => {
      el.style.opacity = '1';
      el.style.transform = 'translate3d(0, 0, 0) scale(1)';
    };
    const hide = () => {
      el.style.opacity = '0';
      el.style.transform = getInitialTransform(binding.arg);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            if (once) observer.unobserve(el);
          } else if (!once) {
            hide();
          }
        });
      },
      {
        threshold: binding.value?.threshold ?? 0.1,
        rootMargin: binding.value?.rootMargin || '0px',
      }
    );
    observer.observe(el);
    el._scrollRevealObserver = observer;

    // Reveal above-the-fold content on the next frame, without waiting for the
    // observer to fire (covers browsers/timings where the initial callback lags).
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh && rect.bottom > 0) {
        reveal();
        if (once) observer.unobserve(el);
      }
    });

    // Absolute fail-safe: if nothing revealed this element within ~1.2s
    // (observer never fired, etc.), force it visible so the page is never blank.
    el._scrollRevealFallback = window.setTimeout(() => {
      if (getComputedStyle(el).opacity === '0') {
        reveal();
        if (once) observer.unobserve(el);
      }
    }, 1200);
  },

  unmounted(el) {
    if (el._scrollRevealObserver) el._scrollRevealObserver.disconnect();
    if (el._scrollRevealFallback) clearTimeout(el._scrollRevealFallback);
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
