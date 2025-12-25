<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  texts: {
    type: Array,
    default: () => ['Software Engineer', 'AI/ML Architect', 'Systems Designer']
  },
  typingSpeed: {
    type: Number,
    default: 100
  },
  deletingSpeed: {
    type: Number,
    default: 50
  },
  pauseDuration: {
    type: Number,
    default: 2000
  }
});

const displayText = ref('');
const isTyping = ref(true);
let currentIndex = 0;
let charIndex = 0;
let timeoutId = null;

const type = () => {
  const currentText = props.texts[currentIndex];

  if (isTyping.value) {
    if (charIndex < currentText.length) {
      displayText.value = currentText.substring(0, charIndex + 1);
      charIndex++;
      timeoutId = setTimeout(type, props.typingSpeed);
    } else {
      isTyping.value = false;
      timeoutId = setTimeout(type, props.pauseDuration);
    }
  } else {
    if (charIndex > 0) {
      displayText.value = currentText.substring(0, charIndex - 1);
      charIndex--;
      timeoutId = setTimeout(type, props.deletingSpeed);
    } else {
      isTyping.value = true;
      currentIndex = (currentIndex + 1) % props.texts.length;
      timeoutId = setTimeout(type, 500);
    }
  }
};

onMounted(() => {
  type();
});

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <span class="typing-animation">
    {{ displayText }}<span class="cursor">|</span>
  </span>
</template>

<style scoped>
.cursor {
  animation: blink 1s infinite;
  color: currentColor;
  font-weight: 100;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
