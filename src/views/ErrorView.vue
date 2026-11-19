<script setup>
import LayoutGuest from "@/layouts/LayoutGuest.vue";
</script>

<template>
  <LayoutGuest>
    <div class="flex min-h-screen items-center justify-center bg-paper px-6">
      <div class="w-full max-w-md text-center">
        <h1 class="text-2xl text-ink mb-3">
          Unhandled exception
        </h1>

        <p class="font-body text-muted mb-8">
          An Error Occurred
        </p>

        <router-link
          to="/dashboard"
          class="inline-flex items-center justify-center rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-medium text-paper hover:opacity-90 transition-opacity"
        >
          Done
        </router-link>
      </div>
    </div>
  </LayoutGuest>
</template>
