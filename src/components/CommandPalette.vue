<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { mdiMagnify, mdiHome, mdiCodeBraces, mdiBriefcase, mdiEmail, mdiGithub, mdiLinkedin, mdiWeatherNight, mdiNewspaperVariant, mdiImageMultiple, mdiFileDocument, mdiViewGridOutline } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';
import { useStyleStore } from '@/stores/style.js';

const emit = defineEmits(['navigate', 'close']);
const styleStore = useStyleStore();
const router = useRouter();

const isOpen = ref(false);
const searchQuery = ref('');
const selectedIndex = ref(0);

const commands = [
  { id: 'home', label: 'Go to Home', icon: mdiHome, section: 'top', type: 'navigation' },
  { id: 'work', label: 'Selected Work', icon: mdiCodeBraces, section: 'work', type: 'navigation' },
  { id: 'projects', label: 'All Projects & Labs', icon: mdiViewGridOutline, route: '/projects', type: 'route' },
  { id: 'writing', label: 'Writing', icon: mdiNewspaperVariant, section: 'writing', type: 'navigation' },
  { id: 'about', label: 'About / Experience', icon: mdiBriefcase, section: 'about', type: 'navigation' },
  { id: 'contact', label: 'Contact Me', icon: mdiEmail, section: 'contact', type: 'navigation' },
  { id: 'photos', label: 'Open Photos', icon: mdiImageMultiple, route: '/photos', type: 'route' },
  { id: 'resume', label: 'Open Resume', icon: mdiFileDocument, route: '/resume', type: 'route' },
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
  } else if (command.type === 'route') {
    router.push(command.route);
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
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        />

        <!-- Palette -->
        <div class="relative w-full max-w-xl mx-4 bg-paper rounded-lg shadow-2xl border border-hairline overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-4 border-b border-hairline">
            <BaseIcon
              :path="mdiMagnify"
              size="24"
              class="text-faint"
            />
            <input
              v-model="searchQuery"
              type="text"
              aria-label="Search commands"
              placeholder="Type a command or search..."
              class="flex-1 bg-transparent text-ink placeholder-faint focus:outline-none text-lg font-mono"
              autofocus
            >
            <div class="flex items-center gap-1 text-xs text-faint">
              <kbd class="px-2 py-1 bg-chip border border-hairline rounded font-mono">esc</kbd>
              <span>to close</span>
            </div>
          </div>

          <!-- Commands List -->
          <div class="max-h-80 overflow-y-auto py-2">
            <div
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              :class="[
                'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-chip text-accent'
                  : 'text-muted hover:bg-chip'
              ]"
              @click="executeCommand(command)"
            >
              <BaseIcon
                :path="command.icon"
                size="20"
              />
              <span class="font-mono text-sm">{{ command.label }}</span>
              <span
                v-if="command.type === 'link'"
                class="ml-auto text-xs text-faint"
              >Opens in new tab</span>
            </div>

            <div
              v-if="filteredCommands.length === 0"
              class="px-4 py-8 text-center text-faint"
            >
              No commands found
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-hairline text-xs text-faint">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-chip border border-hairline rounded font-mono">↑↓</kbd>
                navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-chip border border-hairline rounded font-mono">↵</kbd>
                select
              </span>
            </div>
            <span class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 bg-chip border border-hairline rounded font-mono">⌘</kbd>
              <kbd class="px-1.5 py-0.5 bg-chip border border-hairline rounded font-mono">K</kbd>
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
