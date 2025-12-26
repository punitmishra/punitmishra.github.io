<script setup>
import { ref, onMounted } from 'vue';
import { mdiGithub, mdiSourceCommit, mdiClockOutline } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
  username: {
    type: String,
    default: 'punitmishra'
  }
});

const activities = ref([]);
const loading = ref(true);

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const fetchActivity = async () => {
  try {
    const response = await fetch(`https://api.github.com/users/${props.username}/events/public?per_page=10`);
    const events = await response.json();

    // Filter and format relevant events
    const relevantEvents = events
      .filter(e => ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(e.type))
      .slice(0, 4)
      .map(event => {
        let description = '';
        let icon = mdiSourceCommit;

        if (event.type === 'PushEvent') {
          const commits = event.payload.commits?.length || 0;
          description = `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${event.repo.name.split('/')[1]}`;
        } else if (event.type === 'CreateEvent') {
          description = `Created ${event.payload.ref_type} in ${event.repo.name.split('/')[1]}`;
        } else if (event.type === 'PullRequestEvent') {
          description = `${event.payload.action} PR in ${event.repo.name.split('/')[1]}`;
        }

        return {
          id: event.id,
          type: event.type,
          repo: event.repo.name,
          repoUrl: `https://github.com/${event.repo.name}`,
          description,
          icon,
          time: formatTimeAgo(event.created_at)
        };
      });

    activities.value = relevantEvents;
  } catch (error) {
    console.error('Error fetching GitHub activity:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchActivity);
</script>

<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50">
    <div class="flex items-center gap-2 mb-4">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        Currently Building
      </h3>
    </div>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse flex items-start gap-3"
      >
        <div class="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        <div class="flex-1">
          <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-1" />
          <div class="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    </div>

    <div
      v-else-if="activities.length > 0"
      class="space-y-3"
    >
      <a
        v-for="activity in activities"
        :key="activity.id"
        :href="activity.repoUrl"
        target="_blank"
        class="flex items-start gap-3 group"
      >
        <div class="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <BaseIcon
            :path="mdiGithub"
            size="16"
            class="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {{ activity.description }}
          </p>
          <div class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <BaseIcon
              :path="mdiClockOutline"
              size="12"
            />
            <span>{{ activity.time }}</span>
          </div>
        </div>
      </a>
    </div>

    <div
      v-else
      class="text-center py-4"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        No recent activity
      </p>
    </div>

    <a
      :href="`https://github.com/${username}`"
      target="_blank"
      class="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <span>View all activity</span>
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </a>
  </div>
</template>
