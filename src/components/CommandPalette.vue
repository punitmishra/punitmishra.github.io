<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { mdiMagnify, mdiHome, mdiCodeBraces, mdiAccount, mdiBriefcase, mdiEmail, mdiGithub, mdiLinkedin, mdiWeatherNight, mdiWeatherSunny, mdiClose } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';
import { useStyleStore } from '@/stores/style.js';

const emit = defineEmits(['navigate', 'close']);
const styleStore = useStyleStore();

const isOpen = ref(false);
const searchQuery = ref('');
const selectedIndex = ref(0);

const commands = [
  { id: 'home', label: 'Go to Home', icon: mdiHome, section: 'hero', type: 'navigation' },
  { id: 'projects', label: 'View Projects', icon: mdiCodeBraces, section: 'projects', type: 'navigation' },
  { id: 'skills', label: 'View Skills', icon: mdiCodeBraces, section: 'skills', type: 'navigation' },
  { id: 'experience', label: 'View Experience', icon: mdiBriefcase, section: 'experience', type: 'navigation' },
  { id: 'contact', label: 'Contact Me', icon: mdiEmail, section: 'contact', type: 'navigation' },
  { id: 'github', label: 'Open GitHub', icon: mdiGithub, url: 'https://github.com/punitmishra', type: 'link' },
  { id: 'linkedin', label: 'Open LinkedIn', icon: mdiLinkedin, url: 'https://linkedin.com/in/mishrapunit', type: 'link' },
  { id: 'darkmode', label: 'Toggle Dark Mode', icon: mdiWeatherNight, type: 'action', action: 'toggleDarkMode' },
];

const filteredCommands = computed(() => {
  if (!searchQuery.value) return commands;
  const query = searchQuery.value.toLowerCase();
  return commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query)
  );
});

watch(filteredCommands, () => {
  selectedIndex.value = 0;
});

const executeCommand = (command) => {
  if (command.type === 'navigation') {
    emit('navigate', command.section);
  } else if (command.type === 'link') {
    window.open(command.url, '_blank');
  } else if (command.type === 'action') {
    if (command.action === 'toggleDarkMode') {
      styleStore.setDarkMode();
    }
  }
  close();
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = '';
  selectedIndex.value = 0;
  emit('close');
};

const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }

  if (!isOpen.value) return;

  if (e.key === 'Escape') {
    close();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCommands.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (filteredCommands.value[selectedIndex.value]) {
      executeCommand(filteredCommands.value[selectedIndex.value]);
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

defineExpose({ isOpen });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

        <!-- Palette -->
        <div class="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-slate-700">
            <BaseIcon :path="mdiMagnify" size="24" class="text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Type a command or search..."
              class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
              autofocus
            />
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded font-mono">esc</kbd>
              <span>to close</span>
            </div>
          </div>

          <!-- Commands List -->
          <div class="max-h-80 overflow-y-auto py-2">
            <div
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              @click="executeCommand(command)"
              :class="[
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              ]"
            >
              <BaseIcon :path="command.icon" size="20" />
              <span class="font-medium">{{ command.label }}</span>
              <span v-if="command.type === 'link'" class="ml-auto text-xs text-gray-400">Opens in new tab</span>
            </div>

            <div v-if="filteredCommands.length === 0" class="px-4 py-8 text-center text-gray-400">
              No commands found
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded font-mono">↑↓</kbd>
                navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded font-mono">↵</kbd>
                select
              </span>
            </div>
            <span class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded font-mono">⌘</kbd>
              <kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded font-mono">K</kbd>
              to toggle
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
