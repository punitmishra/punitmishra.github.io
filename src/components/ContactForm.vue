<script setup>
import { ref, computed } from 'vue';
import { mdiSend, mdiCheckCircle, mdiAlertCircle, mdiLoading } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';
import { trackContactForm } from '@/utils/analytics';

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  honeypot: '', // Spam protection
});

const isSubmitting = ref(false);
const submitStatus = ref(null); // 'success' | 'error' | null
const errorMessage = ref('');

// EmailJS configuration (set via environment variables)
const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    formData.value.email.includes('@') &&
    formData.value.subject.trim() !== '' &&
    formData.value.message.trim() !== '' &&
    formData.value.honeypot === '' // Honeypot should be empty
  );
});

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  };
  submitStatus.value = null;
  errorMessage.value = '';
};

const submitForm = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  // Honeypot check
  if (formData.value.honeypot !== '') {
    // Spam detected, silently fail
    return;
  }

  isSubmitting.value = true;
  submitStatus.value = null;
  errorMessage.value = '';

  try {
    // Check if EmailJS is configured
    if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
      // Fallback: Use mailto link
      const mailtoLink = `mailto:punit.mishra09@gmail.com?subject=${encodeURIComponent(formData.value.subject)}&body=${encodeURIComponent(`Name: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMessage:\n${formData.value.message}`)}`;
      window.location.href = mailtoLink;
      submitStatus.value = 'success';
      trackContactForm('submit', true);
      setTimeout(resetForm, 3000);
      return;
    }

    // Load EmailJS dynamically
    const emailjs = await import('@emailjs/browser');
    emailjs.init(emailPublicKey);

    const templateParams = {
      from_name: formData.value.name,
      from_email: formData.value.email,
      subject: formData.value.subject,
      message: formData.value.message,
      to_email: 'punit.mishra09@gmail.com', // Your email
    };

    await emailjs.send(emailServiceId, emailTemplateId, templateParams);

    submitStatus.value = 'success';
    trackContactForm('submit', true);
    setTimeout(resetForm, 5000);
  } catch (error) {
    console.error('Contact form error:', error);
    submitStatus.value = 'error';
    errorMessage.value = error.text || 'Failed to send message. Please try again or email directly.';
    trackContactForm('error', false);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl">
    <p class="font-body text-muted mb-8 max-w-xl">
      Have a project in mind, or just want to say hello? Drop a note.
    </p>

    <!-- Success Message -->
    <div
      v-if="submitStatus === 'success'"
      class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-3"
    >
      <BaseIcon
        :path="mdiCheckCircle"
        size="24"
        class="text-green-600 dark:text-green-400 flex-shrink-0"
      />
      <div>
        <p class="text-green-800 dark:text-green-300 font-semibold font-body">
          Message sent successfully!
        </p>
        <p class="text-green-700 dark:text-green-400 text-sm font-body">
          I'll get back to you soon.
        </p>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="submitStatus === 'error'"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3"
    >
      <BaseIcon
        :path="mdiAlertCircle"
        size="24"
        class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
      />
      <div>
        <p class="text-red-800 dark:text-red-300 font-semibold font-body">
          Failed to send message
        </p>
        <p class="text-red-700 dark:text-red-400 text-sm font-body">
          {{ errorMessage }}
        </p>
        <p class="text-red-600 dark:text-red-500 text-sm mt-2 font-body">
          You can also email directly at: 
          <a
            href="mailto:punit.mishra09@gmail.com"
            class="underline font-semibold"
          >punit.mishra09@gmail.com</a>
        </p>
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="submitForm"
    >
      <!-- Honeypot field (hidden from users) -->
      <input
        v-model="formData.honeypot"
        type="text"
        name="website"
        autocomplete="off"
        tabindex="-1"
        class="hidden"
        aria-hidden="true"
      >

      <!-- Name -->
      <div>
        <label
          for="name"
          class="block text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted mb-2"
        >
          Name *
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-3 bg-paper border border-hairline rounded-md focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-colors text-ink font-body"
          placeholder="Your name"
        >
      </div>

      <!-- Email -->
      <div>
        <label
          for="email"
          class="block text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted mb-2"
        >
          Email *
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          class="w-full px-4 py-3 bg-paper border border-hairline rounded-md focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-colors text-ink font-body"
          placeholder="your.email@example.com"
        >
      </div>

      <!-- Subject -->
      <div>
        <label
          for="subject"
          class="block text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted mb-2"
        >
          Subject *
        </label>
        <input
          id="subject"
          v-model="formData.subject"
          type="text"
          required
          class="w-full px-4 py-3 bg-paper border border-hairline rounded-md focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-colors text-ink font-body"
          placeholder="What's this about?"
        >
      </div>

      <!-- Message -->
      <div>
        <label
          for="message"
          class="block text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted mb-2"
        >
          Message *
        </label>
        <textarea
          id="message"
          v-model="formData.message"
          required
          rows="6"
          class="w-full px-4 py-3 bg-paper border border-hairline rounded-md focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-colors resize-none text-ink font-body"
          placeholder="Tell me about your project or just say hello..."
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!isFormValid || isSubmitting"
        :class="[
          'w-full px-8 py-4 bg-ink text-paper rounded-md font-mono font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-3',
          (!isFormValid || isSubmitting) && 'opacity-50 cursor-not-allowed'
        ]"
      >
        <BaseIcon
          :path="isSubmitting ? mdiLoading : mdiSend"
          size="20"
          :class="isSubmitting && 'animate-spin'"
        />
        <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
      </button>

      <p class="text-xs text-faint font-mono">
        * Required fields
      </p>
    </form>
  </div>
</template>

