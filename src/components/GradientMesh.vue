<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref(null);
let animationId = null;
let time = 0;

const colors = {
  light: [
    { r: 99, g: 102, b: 241, a: 0.15 },   // indigo
    { r: 59, g: 130, b: 246, a: 0.12 },   // blue
    { r: 6, g: 182, b: 212, a: 0.1 },     // cyan
    { r: 139, g: 92, b: 246, a: 0.08 },   // violet
  ],
  dark: [
    { r: 99, g: 102, b: 241, a: 0.2 },
    { r: 59, g: 130, b: 246, a: 0.15 },
    { r: 6, g: 182, b: 212, a: 0.12 },
    { r: 139, g: 92, b: 246, a: 0.1 },
  ]
};

const blobs = [
  { x: 0.2, y: 0.3, radius: 0.4, speed: 0.0003, offset: 0 },
  { x: 0.8, y: 0.2, radius: 0.35, speed: 0.0004, offset: 2 },
  { x: 0.5, y: 0.7, radius: 0.45, speed: 0.00025, offset: 4 },
  { x: 0.3, y: 0.8, radius: 0.3, speed: 0.00035, offset: 1 },
];

const animate = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.classList.contains('dark');
  const colorSet = isDark ? colors.dark : colors.light;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blobs.forEach((blob, i) => {
    const color = colorSet[i % colorSet.length];
    const x = canvas.width * (blob.x + Math.sin(time * blob.speed + blob.offset) * 0.1);
    const y = canvas.height * (blob.y + Math.cos(time * blob.speed * 1.3 + blob.offset) * 0.1);
    const radius = Math.min(canvas.width, canvas.height) * blob.radius;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  time++;
  animationId = requestAnimationFrame(animate);
};

const handleResize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

onMounted(() => {
  handleResize();
  animate();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-0"
    aria-hidden="true"
  />
</template>
