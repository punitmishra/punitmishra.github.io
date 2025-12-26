---
title: "Vue 3 Composition API: Patterns for Scalable Applications"
date: "2024-12-26"
category: "Technical"
tags: ["Vue.js", "TypeScript", "Frontend", "Architecture"]
readTime: "10 min read"
---

# Vue 3 Composition API: Patterns for Scalable Applications

After building several production Vue 3 applications, including this portfolio site, I've developed a set of patterns that consistently lead to maintainable, scalable code. Here's what works.

## Why Composition API?

The Options API served Vue 2 well, but as applications grew, we faced challenges:

- **Logic fragmentation**: Related code scattered across `data`, `methods`, `computed`, and `watch`
- **Reusability**: Mixins caused naming collisions and unclear data sources
- **TypeScript support**: Type inference was limited

The Composition API addresses all of these. But it's easy to misuse—here's how to get it right.

## Pattern 1: Composables for Reusable Logic

Extract reusable logic into composables (custom hooks):

```typescript
// composables/useAsync.ts
import { ref, Ref } from 'vue';

interface UseAsyncReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>
): UseAsyncReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const execute = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await asyncFn();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, execute };
}
```

Usage:

```vue
<script setup lang="ts">
import { useAsync } from '@/composables/useAsync';
import { fetchUser } from '@/api/users';

const { data: user, loading, error, execute } = useAsync(
  () => fetchUser(userId)
);

onMounted(execute);
</script>
```

## Pattern 2: Provide/Inject for Dependency Injection

For cross-cutting concerns, use provide/inject:

```typescript
// composables/useAuth.ts
import { inject, provide, ref, readonly } from 'vue';

const AuthKey = Symbol('auth');

export function provideAuth() {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (credentials) => {
    user.value = await authService.login(credentials);
  };

  const logout = () => {
    user.value = null;
  };

  const auth = {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
  };

  provide(AuthKey, auth);
  return auth;
}

export function useAuth() {
  const auth = inject(AuthKey);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return auth;
}
```

## Pattern 3: Reactive State Machines

For complex component state, model it as a state machine:

```typescript
// composables/useStateMachine.ts
type State = 'idle' | 'loading' | 'success' | 'error';

interface StateMachine {
  state: Ref<State>;
  canTransition: (to: State) => boolean;
  transition: (to: State) => void;
}

export function useStateMachine(initial: State = 'idle'): StateMachine {
  const state = ref<State>(initial);

  const transitions: Record<State, State[]> = {
    idle: ['loading'],
    loading: ['success', 'error'],
    success: ['idle', 'loading'],
    error: ['idle', 'loading'],
  };

  const canTransition = (to: State) =>
    transitions[state.value].includes(to);

  const transition = (to: State) => {
    if (canTransition(to)) {
      state.value = to;
    } else {
      console.warn(`Invalid transition: ${state.value} -> ${to}`);
    }
  };

  return { state, canTransition, transition };
}
```

## Pattern 4: Computed with Getters and Setters

For two-way computed properties:

```typescript
const searchQuery = ref('');
const debouncedQuery = ref('');

// Debounced search with v-model support
const search = computed({
  get: () => searchQuery.value,
  set: (value: string) => {
    searchQuery.value = value;
    debounceFn(() => {
      debouncedQuery.value = value;
    }, 300);
  },
});
```

## Pattern 5: Script Setup Best Practices

Organize your `<script setup>` consistently:

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

// 2. Props and Emits
const props = defineProps<{
  userId: string;
  showDetails?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'close'): void;
}>();

// 3. Composables
const route = useRoute();
const userStore = useUserStore();

// 4. Reactive State
const isLoading = ref(false);
const formData = ref({ name: '', email: '' });

// 5. Computed Properties
const isValid = computed(() =>
  formData.value.name.length > 0 &&
  formData.value.email.includes('@')
);

// 6. Methods
const handleSubmit = async () => {
  if (!isValid.value) return;
  isLoading.value = true;
  try {
    await userStore.updateUser(formData.value);
    emit('update', formData.value.name);
  } finally {
    isLoading.value = false;
  }
};

// 7. Lifecycle
onMounted(() => {
  // Initialize
});
</script>
```

## Performance Tips

### 1. Use `shallowRef` for Large Objects

```typescript
// For large data that doesn't need deep reactivity
const largeDataset = shallowRef<DataItem[]>([]);

// Update by replacing the entire array
largeDataset.value = [...newData];
```

### 2. Lazy Computed with `computed` + `watchEffect`

```typescript
const expensiveResult = ref(null);
const shouldCompute = ref(false);

watchEffect(() => {
  if (shouldCompute.value) {
    expensiveResult.value = expensiveOperation();
  }
});
```

### 3. Component Lazy Loading

```typescript
// router/index.ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
];
```

## References

- [Vue 3 Composition API Documentation](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VueUse - Collection of Vue Composition Utilities](https://vueuse.org/)
- [Pinia - State Management for Vue](https://pinia.vuejs.org/)
- [Vue 3 TypeScript Support](https://vuejs.org/guide/typescript/overview.html)

## Conclusion

The Composition API shines when you embrace these patterns. The key is consistency—pick patterns that work for your team and apply them uniformly across your codebase.

This site is built with Vue 3 and these exact patterns. Check out the [source code](https://github.com/punitmishra/punitmishra.github.io) to see them in action.
