<script setup>
defineProps({
  span: { type: String, default: '1' }, // '1', '2', 'row', 'col'
  variant: { type: String, default: 'default' }, // 'default', 'gradient', 'glass', 'dark'
  hoverable: { type: Boolean, default: true },
});
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-3xl p-6 transition-all duration-500',
      span === '2' && 'md:col-span-2',
      span === 'row' && 'md:col-span-2 md:row-span-1',
      span === 'col' && 'md:row-span-2',
      variant === 'default' && 'bg-white dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50',
      variant === 'gradient' && 'bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-white',
      variant === 'glass' && 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30',
      variant === 'dark' && 'bg-gray-900 dark:bg-black text-white border border-gray-800',
      hoverable && 'hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:-translate-y-1',
    ]"
  >
    <!-- Gradient border glow on hover -->
    <div
      v-if="hoverable"
      class="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style="background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.05) 50%, rgba(6,182,212,0.1) 100%); filter: blur(20px);"
    />
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
