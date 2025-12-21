<script setup>
import { ref, computed } from 'vue';
import { mdiEmail, mdiSend, mdiCheckCircle, mdiAlertCircle, mdiLoading } from '@mdi/js';
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
      const mailtoLink = `mailto:punitmishra@example.com?subject=${encodeURIComponent(formData.value.subject)}&body=${encodeURIComponent(`Name: ${formData.value.name}\nEmail: ${formData.value.email}\n\nMessage:\n${formData.value.message}`)}`;
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
      to_email: 'punitmishra@example.com', // Your email
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
  <div class="max-w-2xl mx-auto">
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <BaseIcon :path="mdiEmail" size="32" class="text-white" />
        </div>
        <h3 class="text-3xl font-black text-gray-900 dark:text-white mb-2 font-heading">
          Get in Touch
        </h3>
        <p class="text-gray-600 dark:text-gray-400 font-display">
          Have a project in mind? Let's collaborate and build something amazing together.
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="submitStatus === 'success'"
        class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
      >
        <BaseIcon :path="mdiCheckCircle" size="24" class="text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <p class="text-green-800 dark:text-green-300 font-semibold font-display">Message sent successfully!</p>
          <p class="text-green-700 dark:text-green-400 text-sm font-display">I'll get back to you soon.</p>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="submitStatus === 'error'"
        class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
      >
        <BaseIcon :path="mdiAlertCircle" size="24" class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-red-800 dark:text-red-300 font-semibold font-display">Failed to send message</p>
          <p class="text-red-700 dark:text-red-400 text-sm font-display">{{ errorMessage }}</p>
          <p class="text-red-600 dark:text-red-500 text-sm mt-2 font-display">
            You can also email directly at: 
            <a href="mailto:punitmishra@example.com" class="underline font-semibold">punitmishra@example.com</a>
          </p>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Honeypot field (hidden from users) -->
        <input
          v-model="formData.honeypot"
          type="text"
          name="website"
          autocomplete="off"
          tabindex="-1"
          class="hidden"
          aria-hidden="true"
        />

        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-display">
            Name *
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-display"
            placeholder="Your name"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-display">
            Email *
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-display"
            placeholder="your.email@example.com"
          />
        </div>

        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-display">
            Subject *
          </label>
          <input
            id="subject"
            v-model="formData.subject"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-display"
            placeholder="What's this about?"
          />
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-display">
            Message *
          </label>
          <textarea
            id="message"
            v-model="formData.message"
            required
            rows="6"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white font-display"
            placeholder="Tell me about your project or just say hello..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :class="[
            'w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white rounded-xl font-semibold font-display shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3',
            (!isFormValid || isSubmitting) && 'opacity-50 cursor-not-allowed hover:scale-100'
          ]"
        >
          <BaseIcon
            :path="isSubmitting ? mdiLoading : mdiSend"
            size="20"
            :class="isSubmitting && 'animate-spin'"
          />
          <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
        </button>

        <p class="text-xs text-gray-500 dark:text-gray-500 text-center font-display">
          * Required fields
        </p>
      </form>
    </div>
  </div>
</template>

