<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center py-6 px-2 sm:px-4">
    <div class="w-full max-w-4xl bg-primary shadow-xl rounded-2xl border border-default overflow-hidden animate-fade-in-up">
      <!-- Top Premium Banner -->
      <div class="bg-ink-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-pop-purple/25 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-pop-lime/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold" style="color: #D1FF4F">
              <i class="pi pi-sparkles text-[11px]"></i>
              <span>Plete AI Financial Intelligence</span>
            </div>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome to Plete, {{ authStore.user?.name || 'Friend' }}!
            </h1>
            <p class="text-gray-300 text-sm sm:text-base font-medium">
              Let's calibrate your financial baseline and unlock your AI co-pilot in under 60 seconds.
            </p>
          </div>

          <!-- Compact Inbox Notice Pill -->
          <div class="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 max-w-xs text-left shrink-0">
            <div class="flex items-start gap-2.5">
              <i class="pi pi-envelope text-sm mt-0.5" style="color: #D1FF4F"></i>
              <div class="text-xs leading-relaxed">
                <p class="font-bold text-white">Check your inbox!</p>
                <p class="text-gray-300">
                  We sent a welcome email. If it's in <strong>Promotions</strong>, drag it to <strong>Primary</strong> so you don't miss alerts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stepper & Dynamic Progress Bar -->
        <div class="relative z-10 mt-7 pt-5 border-t border-white/10">
          <div class="flex items-center justify-between text-xs font-bold mb-2.5">
            <div class="flex items-center gap-2 sm:gap-6">
              <button
                v-for="s in steps"
                :key="s.number"
                type="button"
                @click="goToStep(s.number)"
                class="inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="currentStep >= s.number ? 'text-white' : 'text-gray-400'"
              >
                <span
                  class="w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-extrabold"
                  :style="currentStep >= s.number ? 'background-color: #D1FF4F; color: #0F172A' : 'background-color: rgba(255,255,255,0.12); color: #94A3B8'"
                >
                  <i v-if="currentStep > s.number" class="pi pi-check text-[10px]"></i>
                  <span v-else>{{ s.number }}</span>
                </span>
                <span class="hidden sm:inline">{{ s.title }}</span>
              </button>
            </div>
            <span class="font-numeric" style="color: #D1FF4F">{{ progressValue }}% Complete</span>
          </div>
          <ProgressBar :value="progressValue" :showValue="false" class="h-2.5 rounded-full bg-accent-green" />
        </div>
      </div>

      <!-- STEP 1: Currency & Monthly Baseline -->
      <div v-if="currentStep === 1" class="p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default pb-4">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-accent-blue">Step 1 of 3 · Foundation</span>
            <h2 class="text-xl sm:text-2xl font-bold text-primary mt-0.5">
              Set Your Currency &amp; Monthly Income Baseline
            </h2>
            <p class="text-sm text-secondary mt-0.5">
              Your expected monthly income powers Plete's budget velocity tracking and AI month-end forecasts.
            </p>
          </div>
          <span
            v-if="baselineSaved"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-accent-green border border-default shrink-0 self-start sm:self-center"
          >
            <i class="pi pi-check-circle"></i> Baseline Saved
          </span>
        </div>

        <!-- Currency Picker -->
        <div class="space-y-2.5">
          <label class="block text-sm font-bold text-primary">
            1. Choose Your Preferred Currency
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              v-for="curr in currencyOptions"
              :key="curr.value"
              type="button"
              @click="selectedCurrency = curr.value"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
              :class="[
                selectedCurrency === curr.value
                  ? 'border-accent-blue bg-secondary shadow-sm ring-2 ring-accent-blue/20'
                  : 'border-default bg-primary hover:bg-secondary/60'
              ]"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg font-extrabold text-primary font-numeric">{{ curr.symbol }}</span>
                <span class="text-xs font-bold px-1.5 py-0.5 rounded bg-tertiary text-secondary">{{ curr.value }}</span>
              </div>
              <span class="text-xs font-medium text-secondary truncate">{{ curr.name }}</span>
            </button>
          </div>
        </div>

        <!-- Monthly Income Input -->
        <div class="space-y-3 bg-secondary p-5 rounded-xl border border-default">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label for="onboardingIncome" class="text-sm font-bold text-primary">
              2. What is your expected monthly income?
            </label>
            <span class="text-xs text-secondary font-medium">You can adjust this anytime on the Budget page</span>
          </div>

          <InputNumber
            id="onboardingIncome"
            v-model="monthlyIncome"
            mode="currency"
            :currency="selectedCurrency"
            :locale="preferredLocale"
            :min="0"
            :placeholder="incomePlaceholder"
            class="w-full font-numeric"
            inputClass="w-full text-base font-bold font-numeric"
          />

          <!-- Quick Preset Chips -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="text-xs font-semibold text-muted mr-1">Quick fill:</span>
            <button
              v-for="preset in incomePresets"
              :key="preset"
              type="button"
              @click="monthlyIncome = preset"
              class="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-primary border border-default hover:border-accent-blue transition-colors cursor-pointer font-numeric"
            >
              {{ formatSampleAmount(preset) }}
            </button>
          </div>
        </div>

        <!-- Step 1 Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            @click="currentStep = 2"
            class="text-xs sm:text-sm font-semibold text-secondary hover:text-primary transition-colors cursor-pointer order-2 sm:order-1"
          >
            Skip for now — I'll set my budget later &rarr;
          </button>

          <button
            type="button"
            @click="handleSaveBaseline"
            :disabled="isSavingBaseline"
            class="btn-cta w-full sm:w-auto px-7 py-3 rounded-xl text-sm sm:text-base font-bold shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
          >
            <i v-if="isSavingBaseline" class="pi pi-spinner pi-spin"></i>
            <i v-else class="pi pi-check-circle"></i>
            <span>{{ monthlyIncome > 0 ? 'Save Baseline & Continue' : 'Continue to AI Toolkit' }}</span>
          </button>
        </div>
      </div>

      <!-- STEP 2: Meet Your AI Financial Co-Pilot -->
      <div v-else-if="currentStep === 2" class="p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default pb-4">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-accent-blue">Step 2 of 3 · AI Superpowers</span>
            <h2 class="text-xl sm:text-2xl font-bold text-primary mt-0.5">
              Meet Your Personal AI Financial Co-Pilot
            </h2>
            <p class="text-sm text-secondary mt-0.5">
              Your account comes pre-loaded with monthly AI credits that renew automatically on the 1st of every month.
            </p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-primary border border-default shrink-0 self-start sm:self-center">
            <i class="pi pi-shield text-accent-blue"></i> Human-Confirmed AI
          </span>
        </div>

        <!-- Interactive AI Capability Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Card 1: Magic Quick-Log -->
          <div class="p-5 rounded-xl bg-secondary border border-default flex flex-col justify-between space-y-4 hover:border-accent-blue transition-colors">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue">
                  <i class="pi pi-bolt text-lg"></i>
                </div>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary border border-default text-primary font-numeric">
                  15 Free / mo
                </span>
              </div>
              <h3 class="font-bold text-base text-primary">AI Magic Quick-Log</h3>
              <p class="text-xs text-secondary leading-relaxed">
                Type expenses in plain English like <em>"{{ formatSampleAmount(15) }} lunch yesterday"</em>. AI extracts the merchant, date, and category for your confirmation.
              </p>
            </div>
            <button
              type="button"
              @click="openQuickLogDemo"
              class="w-full py-2 px-3 rounded-lg bg-primary border border-default hover:border-accent-blue text-xs font-bold text-primary inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <i class="pi pi-sparkles text-accent-blue"></i>
              <span>Try Magic Quick-Log Now</span>
            </button>
          </div>

          <!-- Card 2: Smart Receipt OCR -->
          <div class="p-5 rounded-xl bg-secondary border border-default flex flex-col justify-between space-y-4 hover:border-accent-blue transition-colors">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue">
                  <i class="pi pi-camera text-lg"></i>
                </div>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary border border-default text-primary font-numeric">
                  3 Free / mo
                </span>
              </div>
              <h3 class="font-bold text-base text-primary">Receipt &amp; Note OCR</h3>
              <p class="text-xs text-secondary leading-relaxed">
                Upload a photo of a paper receipt or handwritten note. Vision AI extracts the total, merchant, and date in seconds.
              </p>
            </div>
            <button
              type="button"
              @click="openReceiptScanDemo"
              class="w-full py-2 px-3 rounded-lg bg-primary border border-default hover:border-accent-blue text-xs font-bold text-primary inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <i class="pi pi-camera text-accent-blue"></i>
              <span>Try Receipt Scanner</span>
            </button>
          </div>

          <!-- Card 3: AI Financial Coach & Simulator -->
          <div class="p-5 rounded-xl bg-secondary border border-default flex flex-col justify-between space-y-4 hover:border-accent-blue transition-colors">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="w-10 h-10 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue">
                  <i class="pi pi-chart-line text-lg"></i>
                </div>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary border border-default text-primary">
                  Included
                </span>
              </div>
              <h3 class="font-bold text-base text-primary">AI Coach &amp; Simulator</h3>
              <p class="text-xs text-secondary leading-relaxed">
                Generate predictive month-end budget forecasts, simulate "what-if" savings scenarios, and chat with <strong>Ask Plete AI</strong>.
              </p>
            </div>
            <div class="py-2 px-3 rounded-lg bg-primary/60 border border-default text-[11px] font-semibold text-secondary text-center">
              Available in AI Coach tab
            </div>
          </div>
        </div>

        <!-- Pro Upgrade Callout Strip -->
        <div class="p-4 rounded-xl bg-ink-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0" style="color: #D1FF4F">
              <i class="pi pi-sparkles"></i>
            </div>
            <div class="text-xs sm:text-sm">
              <p class="font-bold text-white">Want Unlimited AI, 10+ Years History &amp; PDF/Excel Exports?</p>
              <p class="text-gray-300 text-xs">Upgrade to Plete Pro anytime for just $3.99/mo.</p>
            </div>
          </div>
          <router-link
            to="/pricing"
            class="text-xs font-extrabold px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 text-center"
          >
            View Pro Benefits &rarr;
          </router-link>
        </div>

        <!-- Step 2 Actions -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            @click="currentStep = 1"
            class="px-4 py-2.5 rounded-xl border border-default text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
          <button
            type="button"
            @click="currentStep = 3"
            class="btn-cta px-7 py-3 rounded-xl text-sm sm:text-base font-bold shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Continue to Launchpad</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </button>
        </div>
      </div>

      <!-- STEP 3: Launchpad -->
      <div v-else class="p-6 sm:p-8 space-y-6">
        <div class="text-center max-w-xl mx-auto space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-ink-900 mx-auto flex items-center justify-center text-2xl shadow-md" style="color: #D1FF4F">
            <i class="pi pi-check-circle"></i>
          </div>
          <span class="text-xs font-extrabold uppercase tracking-wider text-accent-blue block">Step 3 of 3 · Ready for Liftoff</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-primary">
            You're all set! Where would you like to start?
          </h2>
          <p class="text-sm text-secondary">
            <span v-if="baselineSaved">
              Your <strong>{{ selectedCurrency }}</strong> currency and <strong>{{ formatSampleAmount(monthlyIncome) }}</strong> monthly baseline are active.
            </span>
            <span v-else>
              We recommend initializing your monthly budget first so Plete can track your spending velocity accurately.
            </span>
          </p>
        </div>

        <!-- Destination Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            @click="router.push('/dashboard')"
            class="p-5 rounded-xl border border-default bg-secondary hover:border-accent-blue text-left transition-all flex items-start gap-4 group cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue shrink-0 group-hover:scale-105 transition-transform">
              <i class="pi pi-home text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-primary text-base">Interactive Dashboard</h3>
                <span v-if="baselineSaved" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-900 text-white">Recommended</span>
              </div>
              <p class="text-xs text-secondary mt-1 leading-relaxed">
                View your financial overview, category breakdowns, and log transactions with AI Quick-Log.
              </p>
            </div>
          </button>

          <button
            type="button"
            @click="router.push('/budget')"
            class="p-5 rounded-xl border border-default bg-secondary hover:border-accent-blue text-left transition-all flex items-start gap-4 group cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue shrink-0 group-hover:scale-105 transition-transform">
              <i class="pi pi-wallet text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-primary text-base">Monthly Budget Builder</h3>
                <span v-if="!baselineSaved" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-900 text-white">Start Here</span>
              </div>
              <p class="text-xs text-secondary mt-1 leading-relaxed">
                Allocate category spending caps and import recurring monthly expenses.
              </p>
            </div>
          </button>

          <button
            type="button"
            @click="router.push('/ai-coach')"
            class="p-5 rounded-xl border border-default bg-secondary hover:border-accent-blue text-left transition-all flex items-start gap-4 group cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue shrink-0 group-hover:scale-105 transition-transform">
              <i class="pi pi-sparkles text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-primary text-base">AI Financial Coach</h3>
              <p class="text-xs text-secondary mt-1 leading-relaxed">
                Ask Plete AI questions, run savings simulations, and generate executive reports.
              </p>
            </div>
          </button>

          <button
            type="button"
            @click="router.push('/goals')"
            class="p-5 rounded-xl border border-default bg-secondary hover:border-accent-blue text-left transition-all flex items-start gap-4 group cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-primary border border-default flex items-center justify-center text-accent-blue shrink-0 group-hover:scale-105 transition-transform">
              <i class="pi pi-star text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-primary text-base">Savings Goals</h3>
              <p class="text-xs text-secondary mt-1 leading-relaxed">
                Set target amounts and target dates for your emergency fund, travel, or major milestones.
              </p>
            </div>
          </button>
        </div>

        <!-- Primary Launch Button -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            @click="currentStep = 2"
            class="px-4 py-2.5 rounded-xl border border-default text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            &larr; Back
          </button>

          <Button
            :label="baselineSaved ? 'Launch My Dashboard' : 'Initialize Budget & Start'"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="btn-cta px-8 py-3 text-base font-bold"
            @click="finishOnboarding"
          />
        </div>
      </div>
    </div>

    <!-- Live AI Modals so users can test Quick-Log or Receipt Scan right inside Onboarding -->
    <QuickLogModal v-model="showQuickLog" />
    <ReceiptScanModal v-model="showReceiptScan" />
    <AiTransactionConfirmModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBudgetStore } from '@/stores/budget';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import { useToast } from 'primevue/usetoast';
import ProgressBar from 'primevue/progressbar';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import QuickLogModal from '@/components/ai/QuickLogModal.vue';
import ReceiptScanModal from '@/components/ai/ReceiptScanModal.vue';
import AiTransactionConfirmModal from '@/components/ai/AiTransactionConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();
const toast = useToast();
const { preferredCurrency, preferredLocale } = useCurrencyFormatter();

const currentStep = ref(1);
const steps = [
  { number: 1, title: 'Financial Baseline' },
  { number: 2, title: 'AI Co-Pilot' },
  { number: 3, title: 'Launchpad' },
];

const currencyOptions = [
  { value: 'USD', symbol: '$', name: 'US Dollar' },
  { value: 'EUR', symbol: '€', name: 'Euro' },
  { value: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { value: 'GBP', symbol: '£', name: 'British Pound' },
  { value: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const selectedCurrency = ref(preferredCurrency.value || 'USD');
const monthlyIncome = ref(null);
const isSavingBaseline = ref(false);
const baselineSaved = ref(false);

const showQuickLog = ref(false);
const showReceiptScan = ref(false);

const progressValue = computed(() => {
  if (currentStep.value === 1) return baselineSaved.value ? 50 : 35;
  if (currentStep.value === 2) return 75;
  return 100;
});

const incomePresets = computed(() => {
  if (selectedCurrency.value === 'NGN') return [250000, 500000, 1000000, 2500000];
  if (selectedCurrency.value === 'JPY') return [250000, 400000, 600000, 1000000];
  return [2000, 3500, 5000, 8000];
});

const formatSampleAmount = (amount) => {
  const num = Number(amount) || 0;
  try {
    return num.toLocaleString(preferredLocale.value || 'en-US', {
      style: 'currency',
      currency: selectedCurrency.value || 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  } catch {
    return `${selectedCurrency.value} ${num.toLocaleString()}`;
  }
};

const incomePlaceholder = computed(() => `e.g. ${formatSampleAmount(incomePresets.value[1])}`);

onMounted(async () => {
  selectedCurrency.value = authStore.userProfile?.preferredCurrency || 'USD';
  await budgetStore.fetchBudget();
  if (budgetStore.getBudget?.expectedMonthlyIncome > 0) {
    monthlyIncome.value = budgetStore.getBudget.expectedMonthlyIncome;
    baselineSaved.value = true;
  }
});

const goToStep = (stepNumber) => {
  currentStep.value = stepNumber;
};

const handleSaveBaseline = async () => {
  isSavingBaseline.value = true;
  try {
    // 1. Save preferred currency if changed
    if (
      authStore.userProfile &&
      selectedCurrency.value !== authStore.userProfile.preferredCurrency
    ) {
      await authStore.updateProfile({
        name: authStore.userProfile.name,
        email: authStore.userProfile.email,
        preferredCurrency: selectedCurrency.value,
        preferredLocale: authStore.userProfile.preferredLocale || 'en-US',
      });
    }

    // 2. Create or update monthly budget baseline if monthlyIncome is provided
    if (monthlyIncome.value && Number(monthlyIncome.value) > 0) {
      let res;
      if (budgetStore.getBudget) {
        res = await budgetStore.updateExpectedIncome({
          monthlyBudget: budgetStore.getBudget.monthlyBudget || [],
          expectedMonthlyIncome: Number(monthlyIncome.value),
        });
      } else {
        res = await budgetStore.createBudget({
          expectedMonthlyIncome: Number(monthlyIncome.value),
        });
      }

      if (res?.success) {
        baselineSaved.value = true;
        toast.add({
          severity: 'success',
          summary: 'Foundation Saved',
          detail: 'Your currency and monthly income baseline are ready!',
          life: 3000,
        });
      }
    }

    currentStep.value = 2;
  } finally {
    isSavingBaseline.value = false;
  }
};

const ensureBaselineBeforeDemo = () => {
  if (!baselineSaved.value && !budgetStore.getBudget) {
    toast.add({
      severity: 'info',
      summary: 'Set Monthly Income First',
      detail: 'Enter your expected monthly income in Step 1 before logging transactions.',
      life: 4000,
    });
    currentStep.value = 1;
    return false;
  }
  return true;
};

const openQuickLogDemo = () => {
  if (!ensureBaselineBeforeDemo()) return;
  showQuickLog.value = true;
};

const openReceiptScanDemo = () => {
  if (!ensureBaselineBeforeDemo()) return;
  showReceiptScan.value = true;
};

/**
 * Navigates to Dashboard if the user already initialized their expectedMonthlyIncome
 * during Step 1, or falls back to /budget so they can initialize their baseline before
 * logging transactions (avoiding backend 404 constraints from financesController.js).
 */
const finishOnboarding = () => {
  if (baselineSaved.value || budgetStore.getBudget) {
    router.push('/dashboard');
  } else {
    router.push('/budget');
  }
};
</script>