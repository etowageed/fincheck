<template>
  <div class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm flex flex-col h-[540px]">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 pb-3 border-b border-default mb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full bg-tertiary border border-default text-accent-blue flex items-center justify-center text-sm font-bold">
          <i class="pi pi-comments"></i>
        </div>
        <div>
            <h3 class="font-bold tracking-tight text-sm text-primary">
              Ask Plete AI
            </h3>
          <p class="text-xs text-secondary">Your conversational financial assistant</p>
        </div>
      </div>
      <AiQuotaBadge :quota="quota" @open-upgrade="aiStore.openUpgradeModal('askPlete')" />
    </div>

    <!-- Messages Container -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
      <div v-if="aiStore.chatHistory.length === 0" class="text-center py-6 text-secondary space-y-3">
        <div class="w-12 h-12 bg-tertiary border border-default rounded-full flex items-center justify-center mx-auto text-accent-blue text-xl">
          <i class="pi pi-lightbulb text-accent-blue"></i>
        </div>
        <p class="text-sm font-medium text-primary leading-relaxed">
          Ask anything about your income, expenses, budgets, or savings goals!
        </p>

        <!-- Suggested Prompts -->
        <div class="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
          <button
            v-for="prompt in suggestedPrompts"
            :key="prompt"
            type="button"
            @click="sendSuggested(prompt)"
            class="p-2.5 rounded-lg bg-secondary text-primary border border-default hover:border-accent-blue text-left text-xs font-medium transition-colors cursor-pointer"
          >
            "{{ prompt }}"
          </button>
        </div>
      </div>

      <div
        v-for="(msg, idx) in aiStore.chatHistory"
        :key="idx"
        class="flex gap-2"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm font-medium leading-relaxed whitespace-pre-wrap"
          :class="[
            msg.role === 'user'
              ? 'bg-accent-blue text-white'
              : 'bg-secondary text-primary border border-default',
          ]"
        >
          {{ msg.content }}
        </div>
      </div>

      <div v-if="aiStore.isProcessingAskPlete" class="flex justify-start">
        <div class="bg-secondary text-primary border border-default rounded-lg p-3 w-full max-w-[85%] space-y-2">
          <div class="flex items-center gap-2 text-xs text-secondary font-medium">
            <i class="pi pi-spinner pi-spin text-accent-blue"></i>
            <span>Ask Plete is analyzing your data...</span>
          </div>
          <Skeleton height="1rem" width="80%" class="rounded" />
          <Skeleton height="1rem" width="55%" class="rounded" />
        </div>
      </div>
    </div>

    <!-- Input Footer -->
    <div class="pt-3 border-t border-default mt-2">
      <form @submit.prevent="handleSend" class="flex items-center gap-2">
        <InputText
          v-model="inputMsg"
          type="text"
          placeholder="Ask Plete a question..."
          aria-label="Ask Plete a question"
          class="flex-1 text-sm"
          :disabled="aiStore.isProcessingAskPlete"
        />
        <button
          type="submit"
          :disabled="!inputMsg.trim() || aiStore.isProcessingAskPlete"
          aria-label="Send message"
          class="btn-cta px-3.5 py-2.5 rounded-lg shadow-sm inline-flex items-center justify-center text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="aiStore.isProcessingAskPlete" class="pi pi-spinner pi-spin text-accent-blue"></i>
          <i v-else class="pi pi-sparkles"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useAiStore } from '@/stores/ai';
import AiQuotaBadge from './AiQuotaBadge.vue';

const aiStore = useAiStore();
const toast = useToast();
const inputMsg = ref('');
const chatContainer = ref(null);

const quota = computed(() => aiStore.getQuotaForKey('askPlete'));

const suggestedPrompts = [
  'Where did I spend the most money this month?',
  'Am I on track for my planned budget?',
  'Give me 3 tips to increase my savings this month.',
];

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

watch(() => aiStore.chatHistory.length, scrollToBottom);

const sendSuggested = (prompt) => {
  inputMsg.value = prompt;
  handleSend();
};

const handleSend = async () => {
  const msg = inputMsg.value.trim();
  if (!msg || aiStore.isProcessingAskPlete) return;

  inputMsg.value = '';
  try {
    await aiStore.sendAskPleteMessage(msg);
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Ask Plete Error',
      detail: err.response?.data?.message || 'Unable to process your question right now.',
      life: 4000,
    });
  }
};
</script>
