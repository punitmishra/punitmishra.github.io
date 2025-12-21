<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 2000,
  },
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
});

const displayValue = ref(0);
const isVisible = ref(false);

let observer = null;

const counterRef = ref(null);

onMounted(() => {
  if ('IntersectionObserver' in window && counterRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.value) {
            isVisible.value = true;
            animate();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(counterRef.value);
  } else {
    // Fallback for browsers without IntersectionObserver
    isVisible.value = true;
    animate();
  }
});

const animate = () => {
  const start = 0;
  const end = props.value;
  const increment = end / (props.duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      displayValue.value = end;
      clearInterval(timer);
    } else {
      displayValue.value = Math.floor(current);
    }
  }, 16);
};

watch(() => props.value, () => {
  if (isVisible.value) {
    animate();
  }
});
</script>

<template>
  <span ref="counterRef">
    {{ prefix }}{{ displayValue }}{{ suffix }}
  </span>
</template>

