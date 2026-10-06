<template>
  <div class="bg-primary border border-default rounded-2xl p-5 shadow-sm flex flex-col h-[520px]">
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-default mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow">
          <i class="pi pi-comments"></i>
        </div>
        <div>
          <h3 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
            Ask Plete AI
          </h3>
          <p class="text-[11px] text-secondary">Your conversational financial assistant</p>
        </div>
      </div>
      <AiQuotaBadge :quota="quota" @open-upgrade="aiStore.showUpgradePromptModal = true" />
    </div>

    <!-- Messages Container -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
      <div v-if="aiStore.chatHistory.length === 0" class="text-center py-8 text-secondary space-y-3">
        <div class="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto text-accent-blue text-xl">
          <i class="pi pi-sparkles"></i>
        </div>
        <p class="font-medium text-gray-800 dark:text-gray-200">
          Ask me anything about your income, expenses, budgets, or savings goals!
        </p>

        <!-- Suggested Prompts -->
        <div class="flex flex-col gap-1.5 pt-2 max-w-xs mx-auto">
          <button
            v-for="prompt in suggestedPrompts"
            :key="prompt"
            @click="sendSuggested(prompt)"
            class="p-2 rounded-lg bg-secondary hover:bg-gray-200 dark:hover:bg-gray-800 text-left text-[11px] text-secondary transition-colors"
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
          class="max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap"
          :class="[
            msg.role === 'user'
              ? 'bg-accent-blue text-white rounded-br-none'
              : 'bg-secondary text-gray-900 dark:text-white border border-default rounded-bl-none',
          ]"
        >
          {{ msg.content }}
        </div>
      </div>

      <div v-if="aiStore.isProcessingAskPlete" class="flex justify-start">
        <div class="bg-secondary text-secondary border border-default rounded-2xl rounded-bl-none px-3.5 py-2.5 flex items-center gap-2">
          <i class="pi pi-spin pi-spinner text-accent-blue"></i>
          <span>Ask Plete is analyzing your data...</span>
        </div>
      </div>
    </div>

    <!-- Input Footer -->
    <div class="pt-3 border-t border-default mt-2">
      <form @submit.prevent="handleSend" class="flex items-center gap-2">
        <input
          v-model="inputMsg"
          type="text"
          placeholder="Ask Plete a question..."
          class="flex-1 p-2.5 text-xs bg-secondary border border-default rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none text-gray-900 dark:text-white"
          :disabled="aiStore.isProcessingAskPlete"
        />
        <button
          type="submit"
          :disabled="!inputMsg.trim() || aiStore.isProcessingAskPlete"
          class="p-2.5 bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl shadow transition-colors flex items-center justify-center text-xs"
        >
          <i class="pi pi-send"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAiStore } from '@/stores/ai';
import AiQuotaBadge from './AiQuotaBadge.vue';

const aiStore = useAiStore();
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
    // Handled in store
  }
};
</script>
