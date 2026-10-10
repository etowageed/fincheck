<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
      <div class="relative z-10 space-y-2 max-w-2xl">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AI Financial Coach & Suite
        </h1>
        <p class="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
          Ground-truth financial intelligence for your spending habits, budget forecasts, savings scenario simulations, and automated executive reports.
        </p>
      </div>
      <div class="absolute -right-8 -bottom-10 opacity-10 text-[180px] text-white font-bold pointer-events-none">
        <i class="pi pi-bolt"></i>
      </div>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2-Column Section: AI Tools -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tab Navigation -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-default text-xs font-semibold">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
            :class="[
              activeTab === tab.id
                ? 'bg-accent-blue text-white shadow-sm'
                : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>

        <!-- TAB 1: Financial Coach Q&A -->
        <div v-if="activeTab === 'coach'" class="bg-primary border border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-user text-accent-blue"></i> AI Financial Coach
              </h2>
              <p class="text-xs text-secondary">Get personalized spending guidance grounded in your records.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('financialCoach')" @open-upgrade="aiStore.openUpgradeModal('financialCoach')" />
          </div>

          <div class="space-y-3">
            <textarea
              v-model="coachQuestion"
              rows="3"
              placeholder="e.g., 'How can I optimize my food & dining budget this month?'"
              class="w-full p-3 text-xs bg-secondary border border-default rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none text-gray-900 dark:text-white"
              :disabled="aiStore.isProcessingCoach"
            ></textarea>

            <div class="flex justify-end">
              <button
                @click="handleAskCoach"
                :disabled="!coachQuestion.trim() || aiStore.isProcessingCoach"
                class="px-5 py-2.5 text-xs bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <i v-if="aiStore.isProcessingCoach" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-send"></i>
                Ask Coach
              </button>
            </div>
          </div>

          <!-- Coach Response Output -->
          <div v-if="coachAdvice" class="mt-4 p-4 bg-secondary border border-default rounded-xl text-xs space-y-2">
            <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
              <i class="pi pi-check-circle text-emerald-500"></i> Coach Advice
            </div>
            <div class="prose prose-sm dark:prose-invert text-secondary whitespace-pre-wrap leading-relaxed">
              {{ coachAdvice }}
            </div>
          </div>
        </div>

        <!-- TAB 2: Budget Forecast -->
        <div v-if="activeTab === 'forecast'" class="bg-primary border border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-chart-line text-indigo-500"></i> Predictive Budget Forecast
              </h2>
              <p class="text-xs text-secondary">Predictive spending trends & risk analysis for month end.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('budgetForecast')" @open-upgrade="aiStore.openUpgradeModal('budgetForecast')" />
          </div>

          <div v-if="!aiStore.forecastData" class="text-center py-8 space-y-3">
            <p class="text-xs text-secondary max-w-sm mx-auto">
              Analyze your current spending velocity and recurring items to generate an end-of-month budget forecast.
            </p>
            <button
              @click="handleFetchForecast"
              :disabled="aiStore.isProcessingForecast"
              class="px-5 py-2.5 text-xs bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors inline-flex items-center gap-2"
            >
              <i v-if="aiStore.isProcessingForecast" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-sparkles"></i>
              Generate Budget Forecast
            </button>
          </div>

          <div v-else class="p-4 bg-secondary border border-default rounded-xl text-xs space-y-3">
            <div class="flex items-center justify-between border-b border-default pb-2">
              <span class="font-bold text-gray-900 dark:text-white text-sm">Forecast Report</span>
              <button @click="handleFetchForecast" class="text-[11px] text-accent-blue hover:underline">Regenerate</button>
            </div>
            <div class="whitespace-pre-wrap leading-relaxed text-secondary">
              {{ aiStore.forecastData }}
            </div>
          </div>
        </div>

        <!-- TAB 3: Savings Scenario Simulator -->
        <div v-if="activeTab === 'scenario'" class="bg-primary border border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-calculator text-emerald-500"></i> Savings Scenario Simulator
              </h2>
              <p class="text-xs text-secondary">Simulate what-if changes without modifying real financial records.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('savingsScenario')" @open-upgrade="aiStore.openUpgradeModal('savingsScenario')" />
          </div>

          <div class="space-y-3">
            <input
              type="text"
              v-model="scenarioText"
              placeholder="e.g., 'What if I reduce dining out by £50/month?'"
              class="w-full p-3 text-xs bg-secondary border border-default rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none text-gray-900 dark:text-white"
              :disabled="aiStore.isProcessingScenario"
            />

            <div class="flex justify-end">
              <button
                @click="handleRunScenario"
                :disabled="!scenarioText.trim() || aiStore.isProcessingScenario"
                class="px-5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <i v-if="aiStore.isProcessingScenario" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-play"></i>
                Run Simulation
              </button>
            </div>
          </div>

          <div v-if="aiStore.scenarioResult" class="p-4 bg-secondary border border-default rounded-xl text-xs space-y-2">
            <div class="font-bold text-gray-900 dark:text-white text-sm">Simulation Impact</div>
            <div class="whitespace-pre-wrap leading-relaxed text-secondary">
              {{ aiStore.scenarioResult }}
            </div>
          </div>
        </div>

        <!-- TAB 4: Monthly Executive Report -->
        <div v-if="activeTab === 'report'" class="bg-primary border border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-file text-purple-500"></i> AI Monthly Report
              </h2>
              <p class="text-xs text-secondary">Comprehensive executive summary of monthly performance.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('monthlyReport')" @open-upgrade="aiStore.openUpgradeModal('monthlyReport')" />
          </div>

          <div v-if="!aiStore.reportData" class="text-center py-8 space-y-3">
            <p class="text-xs text-secondary max-w-sm mx-auto">
              Generate an executive AI report compiling income, outflow, budget performance, and strategic tips.
            </p>
            <button
              @click="handleFetchReport"
              :disabled="aiStore.isProcessingReport"
              class="px-5 py-2.5 text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors inline-flex items-center gap-2"
            >
              <i v-if="aiStore.isProcessingReport" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-file"></i>
              Generate Report
            </button>
          </div>

          <div v-else class="p-4 bg-secondary border border-default rounded-xl text-xs space-y-3">
            <div class="whitespace-pre-wrap leading-relaxed text-secondary">
              {{ aiStore.reportData }}
            </div>
          </div>
        </div>

        <!-- TAB 5: Spending Insights -->
        <div v-if="activeTab === 'insights'" class="bg-primary border border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-compass text-amber-500"></i> Automated Spending Insights
              </h2>
              <p class="text-xs text-secondary">Detected spending spikes, anomalies, and trend patterns.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('spendingInsights')" @open-upgrade="aiStore.openUpgradeModal('spendingInsights')" />
          </div>

          <div v-if="aiStore.insights.length === 0" class="text-center py-8 space-y-3">
            <p class="text-xs text-secondary">Analyze your records for automated spending insights.</p>
            <button
              @click="handleFetchInsights"
              :disabled="aiStore.isProcessingInsights"
              class="px-5 py-2.5 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors inline-flex items-center gap-2"
            >
              <i v-if="aiStore.isProcessingInsights" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-search"></i>
              Fetch Insights
            </button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(insight, idx) in aiStore.insights"
              :key="idx"
              class="p-4 border rounded-xl space-y-1 bg-secondary text-xs"
              :class="[
                insight.impactLevel === 'warning'
                  ? 'border-amber-300 dark:border-amber-800'
                  : insight.impactLevel === 'positive'
                  ? 'border-emerald-300 dark:border-emerald-800'
                  : 'border-default',
              ]"
            >
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <i
                  class="pi"
                  :class="[
                    insight.impactLevel === 'warning'
                      ? 'pi-exclamation-triangle text-amber-500'
                      : insight.impactLevel === 'positive'
                      ? 'pi-check-circle text-emerald-500'
                      : 'pi-info-circle text-blue-500',
                  ]"
                ></i>
                {{ insight.title }}
              </div>
              <p class="text-secondary leading-relaxed">{{ insight.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Ask Plete Chat Widget -->
      <div class="space-y-6">
        <AskPleteWidget />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAiStore } from '@/stores/ai';
import AiQuotaBadge from '@/components/ai/AiQuotaBadge.vue';
import AskPleteWidget from '@/components/ai/AskPleteWidget.vue';

const aiStore = useAiStore();
const activeTab = ref('coach');

const tabs = [
  { id: 'coach', name: 'Coach Q&A', icon: 'pi pi-user' },
  { id: 'forecast', name: 'Forecast', icon: 'pi pi-chart-line' },
  { id: 'scenario', name: 'Simulator', icon: 'pi pi-calculator' },
  { id: 'report', name: 'Monthly Report', icon: 'pi pi-file' },
  { id: 'insights', name: 'Insights', icon: 'pi pi-compass' },
];

const coachQuestion = ref('');
const coachAdvice = ref('');
const scenarioText = ref('');

onMounted(async () => {
  await aiStore.fetchQuota();
});

const handleAskCoach = async () => {
  if (!coachQuestion.value.trim() || aiStore.isProcessingCoach) return;
  try {
    coachAdvice.value = await aiStore.askCoach(coachQuestion.value.trim());
  } catch (err) {
    // Handled in store
  }
};

const handleFetchForecast = async () => {
  try {
    await aiStore.fetchForecast();
  } catch (err) {
    // Handled in store
  }
};

const handleRunScenario = async () => {
  if (!scenarioText.value.trim() || aiStore.isProcessingScenario) return;
  try {
    await aiStore.simulateScenario(scenarioText.value.trim());
  } catch (err) {
    // Handled in store
  }
};

const handleFetchReport = async () => {
  try {
    const now = new Date();
    await aiStore.fetchMonthlyReport(now.getMonth(), now.getFullYear());
  } catch (err) {
    // Handled in store
  }
};

const handleFetchInsights = async () => {
  try {
    await aiStore.fetchSpendingInsights();
  } catch (err) {
    // Handled in store
  }
};
</script>
