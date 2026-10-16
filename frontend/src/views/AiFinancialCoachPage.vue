<template>
  <div class="space-y-6 pb-12">
    <!-- Header Card -->
    <div class="bg-primary rounded-lg border border-default p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1 max-w-2xl">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">
          Your Personal AI Financial Coach
        </h1>
        <p class="text-sm font-medium text-secondary leading-relaxed">
          Ground-truth financial intelligence for your spending habits, budget forecasts, savings scenario simulations, and automated executive reports.
        </p>
      </div>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2-Column Section: AI Tools -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tab Navigation -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-default text-xs sm:text-sm font-semibold" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
            :class="[
              activeTab === tab.id
                ? 'btn-cta shadow-sm'
                : 'bg-secondary text-primary border border-default hover:border-accent-blue',
            ]"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <!-- TAB 1: Financial Coach Q&A -->
        <div v-if="activeTab === 'coach'" class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold tracking-tight text-lg text-primary flex items-center gap-2">
                <i class="pi pi-lightbulb text-accent-blue"></i>
                <span>AI Financial Coach</span>
              </h2>
              <p class="text-xs sm:text-sm text-secondary mt-0.5">Get personalized spending guidance grounded in your records.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('financialCoach')" @open-upgrade="aiStore.openUpgradeModal('financialCoach')" />
          </div>

          <div class="space-y-3">
            <Textarea
              v-model="coachQuestion"
              rows="3"
              placeholder="e.g., 'How can I optimize my food & dining budget this month?'"
              aria-label="Ask AI Financial Coach a question"
              class="w-full text-sm bg-secondary border border-default rounded-lg text-primary"
              :disabled="aiStore.isProcessingCoach"
            />

            <div class="flex justify-end">
              <button
                type="button"
                @click="handleAskCoach"
                :disabled="!coachQuestion.trim() || aiStore.isProcessingCoach"
                class="btn-cta px-4 py-2.5 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i v-if="aiStore.isProcessingCoach" class="pi pi-spinner pi-spin text-accent-blue mr-2"></i>
                <i v-else class="pi pi-sparkles mr-2"></i>
                <span>Ask Coach</span>
              </button>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="aiStore.isProcessingCoach" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-secondary">
              <i class="pi pi-spinner pi-spin text-accent-blue"></i>
              <span>Analyzing your spending habits and generating personalized coaching...</span>
            </div>
            <Skeleton height="1.25rem" width="85%" class="rounded" />
            <Skeleton height="1.25rem" width="70%" class="rounded" />
            <Skeleton height="1.25rem" width="55%" class="rounded" />
          </div>

          <!-- Coach Response Output -->
          <div v-else-if="coachAdvice" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2">
            <div class="font-bold tracking-tight text-primary flex items-center gap-2 text-sm sm:text-base">
              <i class="pi pi-lightbulb text-accent-blue text-lg"></i>
              <span>Coach Advice</span>
            </div>
            <div class="text-sm sm:text-base font-medium text-primary leading-relaxed whitespace-pre-wrap font-numeric">
              {{ coachAdvice }}
            </div>
          </div>
        </div>

        <!-- TAB 2: Budget Forecast -->
        <div v-if="activeTab === 'forecast'" class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold tracking-tight text-lg text-primary flex items-center gap-2">
                <i class="pi pi-chart-line text-accent-blue"></i>
                <span>Predictive Budget Forecast</span>
              </h2>
              <p class="text-xs sm:text-sm text-secondary mt-0.5">Predictive spending trends &amp; risk analysis for month end.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('budgetForecast')" @open-upgrade="aiStore.openUpgradeModal('budgetForecast')" />
          </div>

          <!-- Loading Skeleton -->
          <div v-if="aiStore.isProcessingForecast" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-secondary">
              <i class="pi pi-spinner pi-spin text-accent-blue"></i>
              <span>Forecasting end-of-month budget trajectory...</span>
            </div>
            <Skeleton height="1.25rem" width="80%" class="rounded" />
            <Skeleton height="1.25rem" width="65%" class="rounded" />
            <Skeleton height="1.25rem" width="50%" class="rounded" />
          </div>

          <div v-else-if="!aiStore.forecastData" class="text-center py-8 space-y-3 bg-secondary rounded-lg border border-default p-6">
            <i class="pi pi-chart-line text-2xl text-accent-blue"></i>
            <p class="text-sm font-medium text-secondary max-w-md mx-auto leading-relaxed">
              Analyze your current spending velocity and recurring items to generate an end-of-month budget forecast.
            </p>
            <button
              type="button"
              @click="handleFetchForecast"
              :disabled="aiStore.isProcessingForecast"
              class="btn-cta px-5 py-2.5 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <i class="pi pi-sparkles mr-2"></i>
              <span>Generate Budget Forecast</span>
            </button>
          </div>

          <div v-else class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-default pb-3">
              <div class="flex items-center gap-2">
                <i class="pi pi-chart-line text-accent-blue text-lg"></i>
                <span class="font-bold tracking-tight text-primary text-sm sm:text-base">Forecast Report</span>
              </div>
              <Button
                label="Regenerate"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                size="small"
                @click="handleFetchForecast"
                :loading="aiStore.isProcessingForecast"
              />
            </div>
            <div class="text-sm sm:text-base font-medium text-primary leading-relaxed whitespace-pre-wrap font-numeric">
              {{ aiStore.forecastData }}
            </div>
          </div>
        </div>

        <!-- TAB 3: Savings Scenario Simulator -->
        <div v-if="activeTab === 'scenario'" class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold tracking-tight text-lg text-primary flex items-center gap-2">
                <i class="pi pi-chart-line text-accent-blue"></i>
                <span>Savings Scenario Simulator</span>
              </h2>
              <p class="text-xs sm:text-sm text-secondary mt-0.5">Simulate what-if changes without modifying real financial records.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('savingsScenario')" @open-upgrade="aiStore.openUpgradeModal('savingsScenario')" />
          </div>

          <div class="space-y-3">
            <InputText
              type="text"
              v-model="scenarioText"
              :placeholder="scenarioPlaceholder"
              aria-label="Savings scenario input"
              class="w-full text-sm"
              :disabled="aiStore.isProcessingScenario"
              @keydown.enter.prevent="handleRunScenario"
            />

            <div class="flex justify-end">
              <button
                type="button"
                @click="handleRunScenario"
                :disabled="!scenarioText.trim() || aiStore.isProcessingScenario"
                class="btn-cta px-4 py-2.5 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i v-if="aiStore.isProcessingScenario" class="pi pi-spinner pi-spin text-accent-blue mr-2"></i>
                <i v-else class="pi pi-sparkles mr-2"></i>
                <span>Run Simulation</span>
              </button>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="aiStore.isProcessingScenario" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-secondary">
              <i class="pi pi-spinner pi-spin text-accent-blue"></i>
              <span>Running savings projection simulation...</span>
            </div>
            <Skeleton height="1.25rem" width="75%" class="rounded" />
            <Skeleton height="1.25rem" width="60%" class="rounded" />
          </div>

          <div v-else-if="aiStore.scenarioResult" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2">
            <div class="font-bold tracking-tight text-primary flex items-center gap-2 text-sm sm:text-base">
              <i class="pi pi-check-circle text-accent-green text-lg"></i>
              <span>Simulation Impact</span>
            </div>
            <div class="text-sm sm:text-base font-medium text-primary leading-relaxed whitespace-pre-wrap font-numeric">
              {{ aiStore.scenarioResult }}
            </div>
          </div>
        </div>

        <!-- TAB 4: Monthly Executive Report -->
        <div v-if="activeTab === 'report'" class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold tracking-tight text-lg text-primary flex items-center gap-2">
                <i class="pi pi-lightbulb text-accent-blue"></i>
                <span>AI Monthly Report</span>
              </h2>
              <p class="text-xs sm:text-sm text-secondary mt-0.5">Comprehensive executive summary of monthly performance.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('monthlyReport')" @open-upgrade="aiStore.openUpgradeModal('monthlyReport')" />
          </div>

          <!-- Loading Skeleton -->
          <div v-if="aiStore.isProcessingReport" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-secondary">
              <i class="pi pi-spinner pi-spin text-accent-blue"></i>
              <span>Compiling monthly executive financial report...</span>
            </div>
            <Skeleton height="1.25rem" width="85%" class="rounded" />
            <Skeleton height="1.25rem" width="70%" class="rounded" />
            <Skeleton height="1.25rem" width="60%" class="rounded" />
          </div>

          <div v-else-if="!aiStore.reportData" class="text-center py-8 space-y-3 bg-secondary rounded-lg border border-default p-6">
            <i class="pi pi-file text-2xl text-accent-blue"></i>
            <p class="text-sm font-medium text-secondary max-w-md mx-auto leading-relaxed">
              Generate an executive AI report compiling income, outflow, budget performance, and strategic tips.
            </p>
            <button
              type="button"
              @click="handleFetchReport"
              :disabled="aiStore.isProcessingReport"
              class="btn-cta px-5 py-2.5 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <i class="pi pi-sparkles mr-2"></i>
              <span>Generate Report</span>
            </button>
          </div>

          <div v-else class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-default pb-3">
              <div class="flex items-center gap-2">
                <i class="pi pi-lightbulb text-accent-blue text-lg"></i>
                <span class="font-bold tracking-tight text-primary text-sm sm:text-base">Monthly Executive Summary</span>
              </div>
              <Button
                label="Refresh"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                size="small"
                @click="handleFetchReport"
                :loading="aiStore.isProcessingReport"
              />
            </div>
            <div class="text-sm sm:text-base font-medium text-primary leading-relaxed whitespace-pre-wrap font-numeric">
              {{ aiStore.reportData }}
            </div>
          </div>
        </div>

        <!-- TAB 5: Spending Insights -->
        <div v-if="activeTab === 'insights'" class="bg-primary border border-default rounded-lg p-4 sm:p-6 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold tracking-tight text-lg text-primary flex items-center gap-2">
                <i class="pi pi-lightbulb text-accent-blue"></i>
                <span>Automated Spending Insights</span>
              </h2>
              <p class="text-xs sm:text-sm text-secondary mt-0.5">Detected spending spikes, anomalies, and trend patterns.</p>
            </div>
            <AiQuotaBadge :quota="aiStore.getQuotaForKey('spendingInsights')" @open-upgrade="aiStore.openUpgradeModal('spendingInsights')" />
          </div>

          <!-- Loading Skeleton -->
          <div v-if="aiStore.isProcessingInsights" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-secondary">
              <i class="pi pi-spinner pi-spin text-accent-blue"></i>
              <span>Scanning transactions for anomalies and spending patterns...</span>
            </div>
            <Skeleton height="1.25rem" width="80%" class="rounded" />
            <Skeleton height="1.25rem" width="65%" class="rounded" />
          </div>

          <div v-else-if="aiStore.insights.length === 0" class="text-center py-8 space-y-3 bg-secondary rounded-lg border border-default p-6">
            <i class="pi pi-lightbulb text-2xl text-accent-blue"></i>
            <p class="text-sm font-medium text-secondary">Analyze your records for automated spending insights.</p>
            <button
              type="button"
              @click="handleFetchInsights"
              :disabled="aiStore.isProcessingInsights"
              class="btn-cta px-5 py-2.5 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <i class="pi pi-sparkles mr-2"></i>
              <span>Generate Insights</span>
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(insight, idx) in aiStore.insights"
              :key="idx"
              class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-4 space-y-2"
            >
              <div class="font-bold tracking-tight text-primary flex items-center gap-2 text-sm sm:text-base">
                <i
                  class="text-lg"
                  :class="[
                    insight.impactLevel === 'warning'
                      ? 'pi pi-exclamation-triangle text-accent-red'
                      : insight.impactLevel === 'positive'
                      ? 'pi pi-check-circle text-accent-green'
                      : 'pi pi-lightbulb text-accent-blue',
                  ]"
                ></i>
                <span>{{ insight.title }}</span>
              </div>
              <p class="text-sm sm:text-base font-medium text-primary leading-relaxed font-numeric">{{ insight.description }}</p>
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
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useAiStore } from '@/stores/ai';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import AiQuotaBadge from '@/components/ai/AiQuotaBadge.vue';
import AskPleteWidget from '@/components/ai/AskPleteWidget.vue';

const aiStore = useAiStore();
const toast = useToast();
const { formatCurrency } = useCurrencyFormatter();
const activeTab = ref('coach');

const tabs = [
  { id: 'coach', name: 'Coach Q&A', icon: 'pi pi-lightbulb' },
  { id: 'forecast', name: 'Forecast', icon: 'pi pi-chart-line' },
  { id: 'scenario', name: 'Simulator', icon: 'pi pi-calculator' },
  { id: 'report', name: 'Monthly Report', icon: 'pi pi-file' },
  { id: 'insights', name: 'Insights', icon: 'pi pi-compass' },
];

const coachQuestion = ref('');
const coachAdvice = ref('');
const scenarioText = ref('');

const scenarioPlaceholder = computed(
  () => `e.g., 'What if I reduce dining out by ${formatCurrency(50)}/month?'`
);

onMounted(async () => {
  await aiStore.fetchQuota();
});

const handleAskCoach = async () => {
  if (!coachQuestion.value.trim() || aiStore.isProcessingCoach) return;
  try {
    coachAdvice.value = await aiStore.askCoach(coachQuestion.value.trim());
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Coach Request Failed',
      detail: err.response?.data?.message || 'Unable to generate coaching advice.',
      life: 4000,
    });
  }
};

const handleFetchForecast = async () => {
  try {
    await aiStore.fetchForecast();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Forecast Failed',
      detail: err.response?.data?.message || 'Unable to generate budget forecast.',
      life: 4000,
    });
  }
};

const handleRunScenario = async () => {
  if (!scenarioText.value.trim() || aiStore.isProcessingScenario) return;
  try {
    await aiStore.simulateScenario(scenarioText.value.trim());
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Simulation Failed',
      detail: err.response?.data?.message || 'Unable to run savings scenario.',
      life: 4000,
    });
  }
};

const handleFetchReport = async () => {
  try {
    const now = new Date();
    await aiStore.fetchMonthlyReport(now.getMonth(), now.getFullYear());
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Report Generation Failed',
      detail: err.response?.data?.message || 'Unable to generate monthly report.',
      life: 4000,
    });
  }
};

const handleFetchInsights = async () => {
  try {
    await aiStore.fetchSpendingInsights();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Insights Failed',
      detail: err.response?.data?.message || 'Unable to fetch spending insights.',
      life: 4000,
    });
  }
};
</script>
