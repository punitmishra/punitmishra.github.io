<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const handles = ref({});
const posts = ref([]);

const postMonth = (d) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${y}·${m}`;
};

onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.BASE_URL}data-sources/social.json`);
    handles.value = (res.data && res.data.handles) || {};
    posts.value = (res.data && res.data.posts) || [];
  } catch {
    posts.value = [];
  }
});
</script>

<template>
  <section
    v-if="posts.length"
    id="feed"
    class="pt-14"
  >
    <div class="flex items-baseline justify-between border-b-2 border-ink pb-2.5">
      <div class="font-mono text-sm font-bold tracking-[0.16em] uppercase">
        <span class="text-accent">§</span> On X
      </div>
      <div class="flex items-center gap-4 font-mono text-[10px] tracking-[0.12em] uppercase text-faint">
        <a
          v-if="handles.x"
          :href="handles.x"
          target="_blank"
          rel="noopener"
          class="hover:text-ink"
        >@punitmishra ↗</a>
        <a
          v-if="handles.threads"
          :href="handles.threads"
          target="_blank"
          rel="noopener"
          class="hover:text-ink"
        >threads ↗</a>
      </div>
    </div>
    <a
      v-for="(p, i) in posts"
      :key="i"
      :href="p.url"
      :target="p.url && p.url.startsWith('http') ? '_blank' : '_self'"
      rel="noopener"
      class="group grid grid-cols-[5rem_1fr_1.25rem] gap-4 items-baseline py-4 border-b border-hairline hover:bg-chip transition-colors -mx-3 px-3"
    >
      <div class="font-mono text-xs text-faint">
        {{ postMonth(p.date) }}
      </div>
      <p class="font-sans text-sm text-muted leading-relaxed group-hover:text-ink transition-colors">
        {{ p.text }}
      </p>
      <div class="font-mono text-faint group-hover:text-accent transition-colors text-right">
        ↗
      </div>
    </a>
  </section>
</template>
