<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Terminal'
  },
  commands: {
    type: Array,
    required: true,
    // Each command: { prompt: '$ ', input: 'npm run build', output: ['...'], delay: 50 }
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  loop: {
    type: Boolean,
    default: true
  },
  typingSpeed: {
    type: Number,
    default: 40
  },
  outputSpeed: {
    type: Number,
    default: 10
  }
});

const lines = ref([]);
const isPlaying = ref(false);
const currentCommandIndex = ref(0);
const isTyping = ref(false);
let animationTimeout = null;

const sleep = (ms) => new Promise(resolve => {
  animationTimeout = setTimeout(resolve, ms);
});

const typeText = async (text, speed = props.typingSpeed) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    lines.value[lines.value.length - 1].text = result;
    await sleep(speed + Math.random() * 20);
  }
};

const runDemo = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;

  while (isPlaying.value) {
    lines.value = [];

    for (let i = 0; i < props.commands.length && isPlaying.value; i++) {
      const cmd = props.commands[i];
      currentCommandIndex.value = i;

      // Add prompt line
      lines.value.push({
        type: 'input',
        prompt: cmd.prompt || '$ ',
        text: '',
        isTyping: true
      });

      // Type the command
      isTyping.value = true;
      await typeText(cmd.input, props.typingSpeed);
      lines.value[lines.value.length - 1].isTyping = false;
      isTyping.value = false;

      // Wait before showing output
      await sleep(cmd.delay || 300);

      // Show output lines
      if (cmd.output && cmd.output.length > 0) {
        for (const outputLine of cmd.output) {
          if (!isPlaying.value) break;
          lines.value.push({
            type: 'output',
            text: outputLine,
            color: cmd.outputColor || null
          });
          await sleep(props.outputSpeed);
        }
      }

      // Wait between commands
      await sleep(cmd.pauseAfter || 800);
    }

    if (!props.loop) {
      isPlaying.value = false;
      break;
    }

    // Wait before restarting
    await sleep(2000);
  }
};

const stopDemo = () => {
  isPlaying.value = false;
  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
};

const restartDemo = () => {
  stopDemo();
  setTimeout(() => {
    runDemo();
  }, 100);
};

onMounted(() => {
  if (props.autoPlay) {
    runDemo();
  }
});

onUnmounted(() => {
  stopDemo();
});
</script>

<template>
  <div class="terminal-demo">
    <!-- Terminal header -->
    <div class="terminal-header">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" @click="stopDemo"></span>
        <span class="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer"></span>
        <span class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer" @click="restartDemo"></span>
      </div>
      <span class="terminal-title">{{ title }}</span>
      <div class="w-16"></div>
    </div>

    <!-- Terminal body -->
    <div class="terminal-body">
      <div v-for="(line, index) in lines" :key="index" class="terminal-line">
        <template v-if="line.type === 'input'">
          <span class="terminal-prompt">{{ line.prompt }}</span>
          <span class="terminal-command">{{ line.text }}</span>
          <span v-if="line.isTyping" class="terminal-cursor">▋</span>
        </template>
        <template v-else>
          <span :class="['terminal-output', line.color]">{{ line.text }}</span>
        </template>
      </div>

      <!-- Placeholder when empty -->
      <div v-if="lines.length === 0 && !isPlaying" class="terminal-placeholder">
        <span class="terminal-prompt">$ </span>
        <span class="terminal-cursor">▋</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-demo {
  border-radius: 0.75rem;
  overflow: hidden;
  background: #0d1117;
  border: 1px solid #30363d;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.terminal-title {
  font-size: 0.75rem;
  color: #8b949e;
  font-weight: 500;
}

.terminal-body {
  padding: 1rem;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.terminal-line {
  line-height: 1.6;
  font-size: 0.875rem;
}

.terminal-prompt {
  color: #7ee787;
  user-select: none;
}

.terminal-command {
  color: #e6edf3;
}

.terminal-output {
  color: #8b949e;
  display: block;
  white-space: pre-wrap;
}

.terminal-output.success {
  color: #7ee787;
}

.terminal-output.error {
  color: #f85149;
}

.terminal-output.info {
  color: #79c0ff;
}

.terminal-output.warning {
  color: #d29922;
}

.terminal-output.highlight {
  color: #d2a8ff;
}

.terminal-cursor {
  color: #e6edf3;
  animation: blink 1s step-end infinite;
}

.terminal-placeholder {
  color: #8b949e;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* Scrollbar styling */
.terminal-body::-webkit-scrollbar {
  width: 8px;
}

.terminal-body::-webkit-scrollbar-track {
  background: #0d1117;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
