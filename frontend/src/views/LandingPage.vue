<template>
  <div
    class="bg-cream-50 text-ink-900 font-sans selection:bg-pop-lime selection:text-ink-900 overflow-x-hidden min-h-screen">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 top-0 px-4 sm:px-6 py-4" aria-label="Main navigation">
      <div
        class="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-ink-100/80 rounded-full px-5 sm:px-6 py-3 flex justify-between items-center shadow-lg shadow-ink-900/5">
        <div class="flex items-center gap-3 cursor-pointer">
          <BrandLogo :size="24" variant="on-light" />

        </div>

        <div class="flex items-center gap-3 sm:gap-6 md:gap-8 font-medium text-sm text-ink-800">
          <a href="#ai-suite"
            class="hidden md:inline-flex items-center gap-1.5 hover:text-pop-purple transition-colors font-semibold">
            <i class="pi pi-sparkles text-pop-purple text-xs"></i>
            Plete AI
          </a>
          <a href="#features" class="hidden md:inline-block hover:text-pop-purple transition-colors">Features</a>
          <a href="#how-it-works" class="hidden lg:inline-block hover:text-pop-purple transition-colors">How It
            Works</a>
          <a href="#pricing" class="hidden md:inline-block hover:text-pop-purple transition-colors">Pricing</a>
          <a href="#faq" class="hidden lg:inline-block hover:text-pop-purple transition-colors">FAQ</a>
          <router-link to="/login"
            class="hover:text-pop-purple transition-colors text-xs md:text-sm font-bold md:font-semibold">
            Log in
          </router-link>
          <router-link to="/signup">
            <button
              class="btn-cta bg-pop-lime text-ink-900 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold hover:scale-105 transition-transform active:scale-95 shadow-md shadow-ink-900/10 cursor-pointer">
              Get Started
            </button>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-36 md:pt-44 pb-24 px-4 relative overflow-hidden">
      <div class="absolute top-16 left-10 w-80 h-80 bg-pop-purple/15 rounded-full blur-[110px] pointer-events-none">
      </div>
      <div class="absolute top-40 right-10 w-96 h-96 bg-pop-lime/20 rounded-full blur-[120px] pointer-events-none">
      </div>

      <div class="max-w-7xl mx-auto text-center relative z-10">
        <!-- Announcement Pill -->
        <a href="#ai-suite"
          class="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bg-ink-900 text-white border border-ink-800 font-semibold text-xs tracking-wide shadow-md hover:border-pop-purple transition-colors">
          <span class="px-2 py-0.5 rounded-full bg-pop-purple text-white font-extrabold text-[10px] uppercase">AI
            Powered</span>
          <span>Finance Tracker, Receipt OCR Scanner &amp; Financial Coach</span>
          <i class="pi pi-arrow-right text-[10px]" style="color: #D1FF4F"></i>
        </a>

        <h1
          class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.06] mb-6 text-ink-900 max-w-5xl mx-auto">
          <span class="sr-only">Plete Finance — AI Personal Finance Tracker, Receipt Scanner, Expense Tracker &amp;
            Budget App:
          </span>Know where your money<span
            class="text-transparent bg-clip-text bg-gradient-to-r from-pop-purple via-pop-pink to-amber-500">
            goes</span> and let AI help it <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-pop-purple via-pop-pink to-amber-500">
            grow</span>
        </h1><br>

        <p class="text-lg sm:text-xl md:text-2xl text-ink-800/75 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
          Log transactions in natural language, scan crumpled receipts in seconds, run "what-if" financial simulations,
          and get custom coaching based on your spending/earning habits.
        </p>

        <!-- Dual CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <router-link to="/signup">
            <button
              class="btn-cta px-8 py-4 bg-pop-lime text-ink-900 rounded-2xl font-black text-base sm:text-lg shadow-[0_12px_40px_-10px_rgba(132,204,22,0.55)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2.5 cursor-pointer">

              <span>Get Started for Free</span>
            </button>
          </router-link>
          <a href="#ai-suite"
            class="px-7 py-4 bg-white text-ink-900 border border-ink-100 hover:border-pop-purple/40 rounded-2xl font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2">
            <span>See Plete AI in Action</span>
            <i class="pi pi-arrow-down text-xs text-pop-purple"></i>
          </a>
        </div>

        <!-- Trust Micro-Copy -->
        <div
          class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-ink-800/60 mb-16">
          <span class="inline-flex items-center gap-1.5">
            <i class="pi pi-check-circle text-emerald-600"></i> No credit card required
          </span>
          <span class="inline-flex items-center gap-1.5">
            <i class="pi pi-shield text-pop-purple"></i> Human-confirmed AI entries
          </span>
          <span class="inline-flex items-center gap-1.5">
            <i class="pi pi-bolt text-amber-500"></i> Free Magic Entries
          </span>
          <span class="inline-flex items-center gap-1.5">
            <i class="pi pi-globe text-pop-cyan"></i> Multi-currency Support
          </span>
        </div>

        <!-- Rich Hero Product Showcase Stage -->
        <div class="relative max-w-5xl mx-auto pt-4 pb-12">
          <!-- Main Centerpiece Dashboard Card -->
          <div
            class="relative mx-auto w-full md:w-[86%] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-ink-100 p-5 sm:p-8 text-left z-20">
            <!-- Top Window Bar -->
            <div class="flex flex-wrap justify-between items-center gap-4 pb-6 mb-6 border-b border-ink-100">
              <div class="flex items-center gap-3">
                <div
                  class="w-11 h-11 rounded-2xl bg-ink-900 text-white flex items-center justify-center font-extrabold text-sm">
                  PF
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-ink-900 text-base">October Financial Command</span>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pop-purple/10 text-pop-purple">
                      AI Co-Pilot Active
                    </span>
                  </div>
                  <p class="text-xs text-ink-400 font-medium">Real-time budget velocity, OCR &amp; predictive
                    forecasting</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-3 py-1.5 bg-ink-900 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5">
                  <i class="pi pi-sparkles text-[11px]" style="color: #D1FF4F"></i>
                  Ask Plete AI
                </span>
              </div>
            </div>

            <!-- KPI Summary Row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 font-numeric">
              <div class="p-4 rounded-2xl bg-cream-50 border border-ink-100/70">
                <span class="text-xs font-semibold text-ink-400 uppercase tracking-wider block mb-1">Monthly Budget
                  Remaining</span>
                <div class="text-2xl font-black text-ink-900">$2,480.00</div>
                <span class="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 mt-1">
                  <i class="pi pi-arrow-up-right text-[10px]"></i> 62% of $4,000 baseline left
                </span>
              </div>
              <div class="p-4 rounded-2xl bg-cream-50 border border-ink-100/70">
                <span class="text-xs font-semibold text-ink-400 uppercase tracking-wider block mb-1">AI Month-End
                  Forecast</span>
                <div class="text-2xl font-black text-pop-purple">+$640.00</div>
                <span class="text-xs font-bold text-pop-purple inline-flex items-center gap-1 mt-1">
                  <i class="pi pi-sparkles text-[10px]"></i> Projected surplus on Oct 31
                </span>
              </div>
              <div class="p-4 rounded-2xl bg-ink-900 text-white">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Emergency Fund
                  Goal</span>
                <div class="text-2xl font-black" style="color: #D1FF4F">$8,500 / $10k</div>
                <span class="text-xs font-semibold text-gray-300 inline-flex items-center gap-1 mt-1">
                  85% complete · 3 wks ahead
                </span>
              </div>
            </div>

            <!-- Visual Spending Breakdown + AI Insight Banner -->
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
              <div
                class="lg:col-span-3 p-5 rounded-2xl bg-gradient-to-b from-pop-purple/5 to-cream-50/60 border border-pop-purple/15 flex flex-col justify-between">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-xs font-extrabold uppercase tracking-wider text-ink-800">Category Velocity
                    (Oct)</span>
                  <span class="text-xs font-bold text-pop-purple font-numeric">-14% vs last month</span>
                </div>
                <div class="h-36 flex items-end justify-between gap-3 px-2 pt-4 border-b border-pop-purple/15">
                  <div class="w-full flex flex-col items-center gap-1.5">
                    <span class="text-[10px] font-bold text-ink-800 font-numeric">$420</span>
                    <div class="w-full bg-pop-purple/40 rounded-t-lg h-16"></div>
                  </div>
                  <div class="w-full flex flex-col items-center gap-1.5">
                    <span class="text-[10px] font-bold text-ink-800 font-numeric">$610</span>
                    <div class="w-full bg-pop-purple/65 rounded-t-lg h-24"></div>
                  </div>
                  <div class="w-full flex flex-col items-center gap-1.5">
                    <span class="text-[10px] font-bold text-ink-800 font-numeric">$290</span>
                    <div class="w-full bg-pop-purple/30 rounded-t-lg h-12"></div>
                  </div>
                  <div class="w-full flex flex-col items-center gap-1.5">
                    <span class="text-[10px] font-bold text-pop-purple font-numeric">$850</span>
                    <div class="w-full bg-pop-purple rounded-t-lg h-28 shadow-lg shadow-pop-purple/30"></div>
                  </div>
                  <div class="w-full flex flex-col items-center gap-1.5">
                    <span class="text-[10px] font-bold text-emerald-700 font-numeric">$950</span>
                    <div class="w-full rounded-t-lg h-32" style="background-color: #D1FF4F"></div>
                  </div>
                </div>
                <div class="flex justify-between text-[11px] font-bold text-ink-400 pt-2 px-1">
                  <span>Dining</span>
                  <span>Groceries</span>
                  <span>Transit</span>
                  <span>Housing</span>
                  <span class="text-ink-900">Saved</span>
                </div>
              </div>

              <!-- Live AI Coach Feed inside Mockup -->
              <div class="lg:col-span-2 p-5 rounded-2xl bg-ink-900 text-white flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                      style="color: #D1FF4F">
                      <i class="pi pi-lightbulb"></i> AI Coach Insight
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-semibold">Just
                      now</span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                    "Your dining spend is <strong class="text-white">$65 lower</strong> than September's pace. Moving
                    that difference to your <strong style="color: #D1FF4F">Emergency Fund</strong> hits your target 19
                    days early."
                  </p>
                </div>
                <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span class="text-gray-400 font-medium">Grounded in 42 Oct records</span>
                  <span class="font-bold" style="color: #D1FF4F">Simulate &rarr;</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating Card Left: Magic Quick-Log -->
          <div
            class="hidden md:flex absolute -top-2 -left-2 lg:-left-6 bg-white p-4 rounded-2xl shadow-xl border border-ink-100 animate-float z-30 items-start gap-3.5 max-w-xs text-left -rotate-2">
            <div
              class="w-10 h-10 rounded-xl bg-pop-purple/10 text-pop-purple flex items-center justify-center shrink-0 mt-0.5">
              <i class="pi pi-sparkles text-base"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-pop-purple">AI Magic Entry</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Parsed
                  ✓</span>
              </div>
              <p class="text-xs text-ink-800 font-semibold italic mb-1">"$14.20 coffee &amp; lunch yesterday"</p>
              <p class="text-[11px] font-bold text-ink-400 font-numeric">Food &amp; Dining · -$14.20 · Oct 16</p>
            </div>
          </div>

          <!-- Floating Card Right: Receipt OCR -->
          <div
            class="hidden md:flex absolute -bottom-2 -right-2 lg:-right-6 bg-ink-900 text-white p-4 rounded-2xl shadow-xl border border-ink-800 animate-float-delayed z-30 items-center gap-3.5 max-w-xs text-left rotate-2">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"
              style="color: #D1FF4F">
              <i class="pi pi-camera text-base"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[10px] font-extrabold uppercase tracking-wider" style="color: #D1FF4F">Receipt &amp;
                  Note OCR</span>
              </div>
              <p class="text-xs font-bold text-white">Trader Joe's Receipt Scanned</p>
              <p class="text-[11px] font-semibold text-gray-400 font-numeric">$84.20 · Groceries · High Confidence</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION: Interactive Plete AI Suite Spotlight -->
    <section id="ai-suite" class="py-24 px-4 bg-ink-900 text-white relative overflow-hidden">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-pop-purple/20 rounded-full blur-[130px] pointer-events-none">
      </div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-pop-lime/10 rounded-full blur-[130px] pointer-events-none">
      </div>

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider mb-4"
            style="color: #D1FF4F">
            <i class="pi pi-sparkles"></i>
            <span>Plete AI Financial Intelligence</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-5 text-white">
            Stop typing spreadsheets.<br />Start talking to your money.
          </h2>
          <p class="text-gray-300 text-lg font-medium leading-relaxed">
            Built with financial intelligence: Plete AI extracts, forecasts, and simulates using your real
            records and always lets you confirm before saving a record.
          </p>
        </div>

        <!-- Interactive Tab Selector -->
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10" role="tablist" aria-label="Plete AI Features">
          <button v-for="tab in aiShowcaseTabs" :key="tab.id" type="button" role="tab"
            :aria-selected="activeAiTab === tab.id" @click="activeAiTab = tab.id"
            class="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer"
            :class="[
              activeAiTab === tab.id
                ? 'bg-pop-lime text-ink-900 shadow-lg shadow-pop-lime/20 scale-[1.02]'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
            ]">
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab Content Stage -->
        <div class="bg-ink-800/90 border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <!-- TAB 1: Magic Quick-Log -->
          <div v-show="activeAiTab === 'quicklog'" role="tabpanel"
            class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <div
                class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pop-purple bg-pop-purple/15 px-3 py-1 rounded-full">
                <i class="pi pi-bolt"></i> Natural Language Expense Entry
              </div>
              <h3 class="text-3xl font-extrabold text-white leading-tight">
                Type a sentence. Log multiple transactions at once.
              </h3>
              <p class="text-gray-300 text-base leading-relaxed">
                Whether you're logging one coffee or three errands from last Tuesday, just type naturally. Plete AI
                parses the merchant, amount, date, and matches your custom categories automatically.
              </p>
              <div class="space-y-2 pt-2">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-400 block">Click a prompt to preview
                  live parsing:</span>
                <div class="flex flex-col gap-2">
                  <button v-for="(sample, idx) in quickLogSamples" :key="idx" type="button"
                    @click="selectedQuickLogIdx = idx"
                    class="text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between"
                    :class="[
                      selectedQuickLogIdx === idx
                        ? 'bg-pop-purple/20 border-pop-purple text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    ]">
                    <span class="font-numeric">"{{ sample.prompt }}"</span>
                    <i class="pi pi-arrow-right text-xs"
                      :class="selectedQuickLogIdx === idx ? 'text-pop-lime' : 'text-gray-500'"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Interactive Parsed Output Preview -->
            <div class="lg:col-span-7 bg-ink-900 rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <i class="pi pi-sparkles" style="color: #D1FF4F"></i>
                  <span class="text-sm font-bold text-white">Review &amp; Confirm AI Proposals</span>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300 font-numeric">
                  {{ currentQuickLogSample.items.length }} items extracted
                </span>
              </div>

              <div class="space-y-3">
                <div v-for="(item, i) in currentQuickLogSample.items" :key="i"
                  class="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-sm">{{ item.merchant }}</span>
                      <span
                        class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        <i class="pi pi-check-circle text-[10px]"></i> High Confidence
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-400 font-medium">
                      <span><i class="pi pi-tag text-[10px] mr-1 text-pop-purple"></i>{{ item.category }}</span>
                      <span><i class="pi pi-calendar text-[10px] mr-1"></i>{{ item.date }}</span>
                    </div>
                  </div>
                  <div class="text-right font-numeric">
                    <span class="text-lg font-extrabold text-white">-${{ item.amount }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-2 flex items-center justify-between text-xs text-gray-400">
                <span><i class="pi pi-lock text-[11px] mr-1"></i>Nothing is saved until you click Confirm</span>
                <router-link to="/signup" class="font-bold hover:underline" style="color: #D1FF4F">
                  Try Magic Entry Free &rarr;
                </router-link>
              </div>
            </div>
          </div>

          <!-- TAB 2: Smart Receipt & Note OCR -->
          <div v-show="activeAiTab === 'ocr'" role="tabpanel"
            class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <div
                class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pop-cyan bg-pop-cyan/15 px-3 py-1 rounded-full">
                <i class="pi pi-camera"></i> Vision OCR Extraction
              </div>
              <h3 class="text-3xl font-extrabold text-white leading-tight">
                Snap a paper receipt or handwritten note. Done.
              </h3>
              <p class="text-gray-300 text-base leading-relaxed">
                Don't let paper receipts pile up in your wallet. Upload any JPG, PNG, WebP, or HEIC photo even a
                scribbled sticky note and Plete AI extracts the merchant, total, date, and category in seconds.
              </p>
              <ul class="space-y-2.5 text-sm text-gray-200 font-medium">
                <li class="flex items-center gap-2.5">
                  <i class="pi pi-check-circle" style="color: #D1FF4F"></i> Works on supermarket receipts, restaurant
                  bills &amp; handwritten notes
                </li>
                <li class="flex items-center gap-2.5">
                  <i class="pi pi-check-circle" style="color: #D1FF4F"></i> Flags low-confidence fields automatically
                  for your review
                </li>
                <li class="flex items-center gap-2.5">
                  <i class="pi pi-check-circle" style="color: #D1FF4F"></i> 3 free scans/month on Starter · Unlimited on
                  Pro
                </li>
              </ul>
            </div>

            <div
              class="lg:col-span-7 bg-ink-900 rounded-2xl border border-white/10 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <!-- Simulated Receipt Card -->
              <div
                class="bg-cream-50 text-ink-900 p-5 rounded-xl font-mono text-xs space-y-2 shadow-inner border border-ink-100">
                <div class="text-center border-b border-dashed border-ink-400 pb-2">
                  <p class="font-extrabold text-sm">WHOLE FOODS MARKET</p>
                  <p class="text-[10px] text-ink-400">10/17/2026 · 14:22</p>
                </div>
                <div class="space-y-1 py-1 font-numeric">
                  <div class="flex justify-between"><span>ORG AVOCADOS</span><span>$5.99</span></div>
                  <div class="flex justify-between"><span>ALMOND MILK</span><span>$4.49</span></div>
                  <div class="flex justify-between"><span>WILD SALMON</span><span>$18.90</span></div>
                  <div class="flex justify-between"><span>SOURDOUGH</span><span>$6.50</span></div>
                </div>
                <div
                  class="border-t border-dashed border-ink-400 pt-2 flex justify-between font-extrabold text-sm font-numeric">
                  <span>TOTAL</span>
                  <span>$35.88</span>
                </div>
              </div>

              <!-- Extracted Output -->
              <div class="space-y-3">
                <div class="text-xs font-bold uppercase tracking-wider" style="color: #D1FF4F">
                  <i class="pi pi-sparkles mr-1"></i> Extracted Proposal
                </div>
                <div class="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Merchant</span>
                    <span class="font-bold text-white">Whole Foods Market</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Amount</span>
                    <span class="font-extrabold text-white font-numeric">$35.88</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Auto-Category</span>
                    <span class="px-2 py-0.5 rounded bg-pop-purple/20 text-pop-purple font-bold">Groceries</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Date</span>
                    <span class="text-white font-numeric">2026-10-17</span>
                  </div>
                </div>
                <router-link to="/signup" class="btn-cta w-full py-2.5 rounded-xl text-xs font-bold block text-center">
                  Confirm &amp; Save to Ledger
                </router-link>
              </div>
            </div>
          </div>

          <!-- TAB 3: Forecast & What-If Simulator -->
          <div v-show="activeAiTab === 'simulator'" role="tabpanel"
            class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <div
                class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-3 py-1 rounded-full">
                <i class="pi pi-chart-line"></i> Predictive Modeling &amp; Simulator
              </div>
              <h3 class="text-3xl font-extrabold text-white leading-tight">
                Test "What-If" decisions before you spend a dime.
              </h3>
              <p class="text-gray-300 text-base leading-relaxed">
                Curious how cutting takeout by $60/month or landing a freelance bonus affects your goals? Run risk-free
                simulations without modifying your real financial records.
              </p>
              <div class="space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-400 block">Select a scenario to
                  simulate:</span>
                <button v-for="(scen, sIdx) in scenarioSamples" :key="sIdx" type="button"
                  @click="selectedScenarioIdx = sIdx"
                  class="w-full text-left px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between"
                  :class="[
                    selectedScenarioIdx === sIdx
                      ? 'bg-amber-400/15 border-amber-300 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  ]">
                  <span>"{{ scen.question }}"</span>
                  <i class="pi pi-calculator text-xs"
                    :class="selectedScenarioIdx === sIdx ? 'text-amber-300' : 'text-gray-500'"></i>
                </button>
              </div>
            </div>

            <div class="lg:col-span-7 bg-ink-900 rounded-2xl border border-white/10 p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <span class="text-sm font-bold text-white flex items-center gap-2">
                  <i class="pi pi-check-circle" style="color: #D1FF4F"></i>
                  Simulation Impact Projection
                </span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300">Zero Ledger Mutation</span>
              </div>
              <p class="text-sm text-gray-200 leading-relaxed font-medium">
                {{ currentScenarioSample.analysis }}
              </p>
              <div class="grid grid-cols-2 gap-4 pt-2 font-numeric">
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span class="text-xs text-gray-400 block mb-1">6-Month Savings Boost</span>
                  <span class="text-2xl font-black" style="color: #D1FF4F">{{ currentScenarioSample.sixMonth }}</span>
                </div>
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span class="text-xs text-gray-400 block mb-1">12-Month Goal Acceleration</span>
                  <span class="text-2xl font-black text-pop-purple">{{ currentScenarioSample.twelveMonth }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: AI Coach & Executive Reports -->
          <div v-show="activeAiTab === 'coach'" role="tabpanel"
            class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 space-y-5">
              <div
                class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pop-pink bg-pop-pink/15 px-3 py-1 rounded-full">
                <i class="pi pi-comments"></i> Ask Plete AI &amp; Executive Reports
              </div>
              <h3 class="text-3xl font-extrabold text-white leading-tight">
                A 24/7 financial advisor that actually knows your numbers.
              </h3>
              <p class="text-gray-300 text-base leading-relaxed">
                Chat with <strong class="text-white">Ask Plete</strong> for instant answers about your spending spikes,
                or generate a comprehensive <strong class="text-white">Monthly Executive Report</strong> summarizing
                inflow, outflow, budget adherence, and strategic action items.
              </p>
              <router-link to="/signup" class="inline-flex items-center gap-2 font-bold text-sm" style="color: #D1FF4F">
                <span>Ask your first question free</span>
                <i class="pi pi-arrow-right text-xs"></i>
              </router-link>
            </div>

            <div class="lg:col-span-7 bg-ink-900 rounded-2xl border border-white/10 p-6 space-y-4">
              <div class="flex justify-end">
                <div
                  class="bg-pop-purple text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-br-sm max-w-md">
                  "Where did I spend the most this month, and am I on track for my budget?"
                </div>
              </div>
              <div class="flex justify-start">
                <div
                  class="bg-white/5 border border-white/10 text-gray-200 text-xs sm:text-sm font-medium p-4 rounded-2xl rounded-bl-sm max-w-xl space-y-2 leading-relaxed font-numeric">
                  <div class="text-xs font-bold flex items-center gap-1.5" style="color: #D1FF4F">
                    <i class="pi pi-sparkles"></i> Ask Plete AI
                  </div>
                  <p>
                    Your top category in October is <strong class="text-white">Housing &amp; Utilities
                      ($1,200)</strong>, followed by <strong class="text-white">Groceries ($410)</strong>. You've used
                    <strong class="text-white">54%</strong> of your monthly budget with 14 days remaining putting you on
                    pace for a <strong style="color: #D1FF4F">$640 surplus</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-20 px-4 bg-cream-50 border-b border-ink-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <span class="text-xs font-extrabold uppercase tracking-widest text-pop-purple block mb-2">Effortless
            Workflow</span>
          <h2 class="text-3xl md:text-5xl font-black text-ink-900">
            From signup to clarity in 60 seconds.
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm relative">
            <span class="text-xs font-black px-3 py-1 rounded-full bg-pop-lime text-ink-900 inline-block mb-4">STEP
              01</span>
            <h3 class="text-xl font-bold text-ink-900 mb-2">Set Your Baseline</h3>
            <p class="text-ink-800/70 text-sm font-medium leading-relaxed">
              Choose your preferred currency and enter your expected monthly income during onboarding to establish your
              smart budget foundation.
            </p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm relative">
            <span class="text-xs font-black px-3 py-1 rounded-full bg-pop-purple text-white inline-block mb-4">STEP
              02</span>
            <h3 class="text-xl font-bold text-ink-900 mb-2">Log with AI or Manually</h3>
            <p class="text-ink-800/70 text-sm font-medium leading-relaxed">
              Use Magic Entry to type expenses in plain language, upload receipt photos for instant OCR extraction, or
              import recurring monthly bills.
            </p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-ink-100 shadow-sm relative">
            <span class="text-xs font-black px-3 py-1 rounded-full bg-ink-900 text-white inline-block mb-4">STEP
              03</span>
            <h3 class="text-xl font-bold text-ink-900 mb-2">Forecast, Simulate &amp; Grow</h3>
            <p class="text-ink-800/70 text-sm font-medium leading-relaxed">
              Let your AI Financial Coach detect spending anomalies, project your month-end balance, and guide you to
              your savings targets faster.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Features Bento Grid -->
    <section id="features" class="py-24 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <span class="text-xs font-extrabold uppercase tracking-widest text-pop-purple block mb-2">Complete Financial
            Toolkit</span>
          <h2 class="text-4xl md:text-5xl font-black mb-5 text-ink-900">
            Everything you need to stay in command.
          </h2>
          <p class="text-ink-800/70 text-lg max-w-2xl mx-auto font-medium">
            Daily expense tracking meets executive-grade analytics without the spreadsheet headaches.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
          <!-- Bento 1: Visual Spending & Trend Insights -->
          <div
            class="md:col-span-2 bg-cream-50 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group hover:shadow-xl transition-all duration-500 border border-ink-100 hover:border-pop-purple/30 flex flex-col justify-between">
            <div class="relative z-10">
              <div
                class="w-14 h-14 bg-ink-900 text-white rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm">
                <i class="pi pi-chart-bar" style="color: #D1FF4F"></i>
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold mb-3 text-ink-900">
                Visual Spending &amp; Trend Analytics
              </h3>
              <p class="text-ink-800/70 max-w-md font-medium leading-relaxed">
                Drill down into interactive category breakdowns, top transactions, and multi-month trend charts paired
                with AI-detected spending spikes and positive habit streaks.
              </p>
            </div>
            <div class="relative z-10 mt-6 flex flex-wrap gap-2">
              <span
                class="px-3 py-1 rounded-full bg-white border border-ink-100 text-xs font-bold text-ink-800">Category
                Drill-Downs</span>
              <span class="px-3 py-1 rounded-full bg-white border border-ink-100 text-xs font-bold text-ink-800">Anomaly
                Detection</span>
              <span class="px-3 py-1 rounded-full bg-white border border-ink-100 text-xs font-bold text-ink-800">10+
                Year History</span>
            </div>
            <div
              class="absolute -right-10 -bottom-10 w-64 h-64 bg-pop-purple/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none">
            </div>
          </div>

          <!-- Bento 2: Dynamic Monthly Budgeting & Recurring Imports -->
          <div
            class="md:row-span-2 bg-ink-900 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between group">
            <div>
              <div
                class="w-14 h-14 bg-ink-800 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm border border-white/10">
                <i class="pi pi-wallet text-pop-purple"></i>
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold mb-3">Smart Monthly Budgets &amp; Recurring Bills</h3>
              <p class="text-gray-300 font-medium leading-relaxed text-sm sm:text-base">
                Set your expected monthly income and allocate category caps. Import recurring bills with one click so
                subscriptions and rent never catch you off guard.
              </p>
            </div>

            <div class="mt-8 space-y-3 font-numeric">
              <div class="p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 space-y-2">
                <div class="flex justify-between text-xs font-bold">
                  <span>Food &amp; Dining</span>
                  <span style="color: #D1FF4F">$310 / $450</span>
                </div>
                <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full rounded-full w-[68%]" style="background-color: #D1FF4F"></div>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="w-2 h-2 bg-pop-pink rounded-full"></div>
                <span class="text-xs font-bold flex-1">Recurring: Fiber Internet</span>
                <span class="text-xs font-bold text-pop-pink">-$65.00</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="w-2 h-2 bg-pop-yellow rounded-full"></div>
                <span class="text-xs font-bold flex-1">Recurring: Fitness Membership</span>
                <span class="text-xs font-bold text-pop-yellow">-$45.00</span>
              </div>
            </div>
          </div>

          <!-- Bento 3: Human-in-the-Loop Smart Categories -->
          <div
            class="bg-pop-lime/15 rounded-[2.5rem] p-8 border border-pop-lime/30 group hover:bg-pop-lime/25 transition-colors flex flex-col justify-between">
            <div>
              <div
                class="w-14 h-14 bg-pop-lime text-ink-900 rounded-2xl flex items-center justify-center text-xl mb-6 font-bold shadow-sm group-hover:rotate-6 transition-transform">
                <i class="pi pi-tags"></i>
              </div>
              <h3 class="text-2xl font-bold mb-2 text-ink-900">
                AI + Custom Categories
              </h3>
              <p class="text-ink-800/75 text-sm font-medium leading-relaxed">
                Create custom income and expense categories. Plete AI automatically maps your natural-language logs and
                receipts to your exact taxonomy.
              </p>
            </div>
          </div>

          <!-- Bento 4: Target Savings Goals -->
          <div
            class="bg-pop-yellow/15 rounded-[2.5rem] p-8 border border-pop-yellow/30 group hover:bg-pop-yellow/25 transition-colors flex flex-col justify-between">
            <div>
              <div
                class="w-14 h-14 bg-pop-yellow text-ink-900 rounded-2xl flex items-center justify-center text-xl mb-6 font-bold shadow-sm group-hover:scale-105 transition-transform">
                <i class="pi pi-star"></i>
              </div>
              <h3 class="text-2xl font-bold mb-2 text-ink-900">Savings Goals &amp; Simulations</h3>
              <p class="text-ink-800/75 text-sm font-medium leading-relaxed">
                Set target amounts and deadlines, track live completion percentages, and use the AI Scenario Simulator
                to reach milestones faster.
              </p>
            </div>
          </div>

          <!-- Bento 5: Audit-Ready PDF & Excel Exports -->
          <div
            class="md:col-span-3 bg-pop-cyan/10 rounded-[2.5rem] p-8 sm:p-10 border border-pop-cyan/25 group hover:bg-pop-cyan/15 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex items-start sm:items-center gap-5">
              <div
                class="w-14 h-14 bg-pop-cyan text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                <i class="pi pi-download"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold mb-1 text-ink-900">Instant PDF &amp; Excel Financial Exports +
                  Multi-Currency</h3>
                <p class="text-ink-800/75 text-sm sm:text-base font-medium">
                  Format your entire workspace in USD ($), EUR (€), GBP (£) etc. and download clean PDF
                  or Excel reports anytime.
                </p>
              </div>
            </div>
            <router-link to="/signup"
              class="shrink-0 px-5 py-3 rounded-xl bg-ink-900 text-white text-xs sm:text-sm font-bold hover:bg-ink-800 transition-colors">
              Create Free Account &rarr;
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Synced Pricing Section -->
    <section id="pricing" class="py-24 px-4 bg-cream-50">
      <div class="max-w-5xl mx-auto text-center">
        <span class="text-xs font-extrabold uppercase tracking-widest text-pop-purple block mb-2">Transparent
          Plans</span>
        <h2 class="text-4xl md:text-5xl font-black mb-4 text-ink-900">
          Simple, honest pricing.
        </h2>
        <p class="text-ink-800/70 text-lg max-w-2xl mx-auto mb-14 font-medium">
          Start free with generous monthly AI allowances renewed automatically, or upgrade to Pro for unlimited AI
          financial intelligence.
        </p>

        <div class="grid md:grid-cols-2 gap-8 items-stretch text-left">
          <!-- Free Plan -->
          <div
            class="bg-white p-8 sm:p-10 rounded-[2rem] border border-ink-100 shadow-lg flex flex-col justify-between hover:border-ink-400/50 transition-colors">
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-2xl font-bold text-ink-900">Starter</h3>
                <span class="text-xs font-bold px-3 py-1 rounded-full bg-cream-100 text-ink-800">Always Free</span>
              </div>
              <div class="text-5xl font-black mb-2 text-ink-900 font-numeric">
                $0<span class="text-lg text-ink-400 font-medium">/mo</span>
              </div>
              <p class="text-ink-800/70 mb-8 text-sm font-medium">
                Full core tracking plus monthly AI allowances that renew every month.
              </p>
              <ul class="space-y-3.5 mb-8 text-sm text-ink-800 font-medium font-numeric">
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-emerald-600 font-bold"></i>
                  <span><strong>Unlimited</strong> Manual Transactions, Budgets &amp; Goals</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-emerald-600 font-bold"></i>
                  <span><strong>15 AI Magic Entries</strong> / month</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-emerald-600 font-bold"></i>
                  <span><strong>3 AI Receipt &amp; Note Scans</strong> / month</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-emerald-600 font-bold"></i>
                  <span><strong>5 Ask Plete AI Chats &amp; 3 Coach Q&amp;As</strong> / month</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-emerald-600 font-bold"></i>
                  <span><strong>1 Budget Forecast &amp; 2 Simulations</strong> / month</span>
                </li>
                <li class="flex items-center gap-3 text-ink-400">
                  <i class="pi pi-clock text-ink-400"></i>
                  <span>Current Month Dashboard View</span>
                </li>
              </ul>
            </div>
            <router-link to="/signup"
              class="w-full py-3.5 rounded-xl border-2 border-ink-900 text-ink-900 font-bold hover:bg-ink-900 hover:text-white transition-colors block text-center text-sm">
              Start Free Forever
            </router-link>
          </div>

          <!-- Pro Plan -->
          <div
            class="bg-ink-900 text-white p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-pop-purple/20 relative flex flex-col justify-between transform md:-translate-y-3 border border-pop-purple/40">
            <div
              class="absolute top-0 right-0 bg-pop-purple text-white text-xs font-extrabold px-4 py-2 rounded-bl-2xl rounded-tr-[1.8rem] tracking-wider">
              UNLIMITED AI · BEST VALUE
            </div>
            <div>
              <h3 class="text-2xl font-bold mb-2" style="color: #D1FF4F">Premium</h3>
              <div class="text-5xl font-black mb-2 font-numeric">
                $3.99<span class="text-lg text-gray-400 font-medium">/mo</span>
              </div>
              <p class="text-gray-300 mb-8 text-sm font-medium">
                For those ready for unlimited AI intelligence, deep history, and exports.
              </p>
              <ul class="space-y-3.5 mb-8 text-sm font-medium">
                <li class="flex items-center gap-3">
                  <i class="pi pi-sparkles font-bold" style="color: #D1FF4F"></i>
                  <span><strong>Unlimited</strong> AI Magic Entries</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-sparkles font-bold" style="color: #D1FF4F"></i>
                  <span><strong>Unlimited</strong> Receipt &amp; Handwritten Note Scans</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-sparkles font-bold" style="color: #D1FF4F"></i>
                  <span><strong>Unlimited</strong> AI Financial Coach &amp; Ask Plete Chat</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-sparkles font-bold" style="color: #D1FF4F"></i>
                  <span><strong>Unlimited</strong> Forecasts, Scenario Simulations &amp; Monthly Reports</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-pop-purple font-bold"></i>
                  <span><strong>10+ Years</strong> Historical Data &amp; Multi-Month Trends</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="pi pi-check-circle text-pop-purple font-bold"></i>
                  <span><strong>Instant PDF &amp; Excel</strong> Full Data Exports</span>
                </li>
              </ul>
            </div>
            <router-link to="/signup"
              class="btn-cta w-full py-3.5 rounded-xl font-black transition-all shadow-lg block text-center text-sm">
              Get Started &amp; Unlock Premium
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Section: Why Plete vs. Spreadsheets & Bank-Sync Apps -->
    <section class="py-20 px-4 bg-white border-t border-ink-100">
      <div class="max-w-6xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <span class="text-xs font-extrabold uppercase tracking-widest text-pop-purple block mb-2">Smarter By
            Design</span>
          <h2 class="text-3xl md:text-5xl font-black text-ink-900 mb-4">
            Why switch from spreadsheets &amp; bank-linked budget apps?
          </h2>
          <p class="text-ink-800/70 text-base sm:text-lg font-medium">
            Get the speed of AI automation with the privacy and intentionality of human-confirmed expense tracking.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-7 rounded-3xl bg-cream-50 border border-ink-100 space-y-3">
            <div class="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center text-base">
              <i class="pi pi-shield" style="color: #D1FF4F"></i>
            </div>
            <h3 class="text-xl font-bold text-ink-900">100% Private, No Bank Login Required</h3>
            <p class="text-sm text-ink-800/75 font-medium leading-relaxed">
              Unlike legacy budget apps that demand your bank credentials and suffer broken sync connections, Plete
              Finance keeps you in control. Log expenses via natural language or receipt OCR with zero bank-link risk.
            </p>
          </div>

          <div class="p-7 rounded-3xl bg-cream-50 border border-ink-100 space-y-3">
            <div class="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center text-base">
              <i class="pi pi-bolt" style="color: #D1FF4F"></i>
            </div>
            <h3 class="text-xl font-bold text-ink-900">10x Faster Than Excel &amp; Notion Templates</h3>
            <p class="text-sm text-ink-800/75 font-medium leading-relaxed">
              Stop maintaining brittle spreadsheet formulas. Just type <em>"$45 groceries and $12 lunch"</em> or snap a
              photo of a crumpled receipt. Plete AI categorizes, dates, and charts your spending automatically.
            </p>
          </div>

          <div class="p-7 rounded-3xl bg-cream-50 border border-ink-100 space-y-3">
            <div class="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center text-base">
              <i class="pi pi-sparkles" style="color: #D1FF4F"></i>
            </div>
            <h3 class="text-xl font-bold text-ink-900">Ground-Truth AI Coaching at 1/3 the Cost</h3>
            <p class="text-sm text-ink-800/75 font-medium leading-relaxed">
              Most personal finance apps charge $14.99/month just to show past transactions. Plete Finance gives you a
              generous free tier and full Pro AI forecasting, simulations, and exports for just $3.99/month.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SEO FAQ Section -->
    <section id="faq" class="py-20 px-4 bg-cream-50 border-t border-ink-100">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <span class="text-xs font-extrabold uppercase tracking-widest text-pop-purple block mb-2">Frequently Asked
            Questions</span>
          <h2 class="text-3xl md:text-5xl font-black text-ink-900 mb-3">
            Everything you need to know about Plete Finance
          </h2>
          <p class="text-ink-800/70 text-base font-medium">
            Learn how our AI expense tracker, receipt OCR scanner, and financial coach work.
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="(faq, idx) in faqItems" :key="idx"
            class="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden transition-colors hover:border-pop-purple/40">
            <button type="button" @click="toggleFaq(idx)" :aria-expanded="openFaqIdx === idx"
              class="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer">
              <h3 class="text-base sm:text-lg font-bold text-ink-900">
                {{ faq.question }}
              </h3>
              <span
                class="w-8 h-8 rounded-full bg-cream-50 border border-ink-100 flex items-center justify-center shrink-0 text-ink-900 transition-transform"
                :class="{ 'rotate-180 bg-pop-lime border-pop-lime': openFaqIdx === idx }">
                <i class="pi pi-chevron-down text-xs"></i>
              </span>
            </button>
            <div v-show="openFaqIdx === idx"
              class="px-6 pb-6 text-sm sm:text-base text-ink-800/75 font-medium leading-relaxed border-t border-ink-100/60 pt-4">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final Conversion Banner -->
    <section class="py-16 px-4 bg-white">
      <div
        class="max-w-6xl mx-auto bg-ink-900 rounded-[2.5rem] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
        <div class="absolute -top-24 -left-24 w-72 h-72 bg-pop-purple/25 rounded-full blur-[100px] pointer-events-none">
        </div>
        <div
          class="absolute -bottom-24 -right-24 w-72 h-72 bg-pop-lime/20 rounded-full blur-[100px] pointer-events-none">
        </div>

        <div class="relative z-10 max-w-2xl mx-auto space-y-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold"
            style="color: #D1FF4F">
            <i class="pi pi-sparkles"></i> Built for Financial Clarity
          </span>
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to upgrade from spreadsheets to AI clarity?
          </h2>
          <p class="text-gray-300 text-base sm:text-lg font-medium">
            Join Plete Finance for free today and get your free monthly AI credits for Magic Entry, Receipt Scans, and
            Financial Coaching immediately.
          </p>
          <div class="pt-2">
            <router-link to="/signup">
              <button class="btn-cta px-8 py-4 rounded-2xl font-black text-base sm:text-lg shadow-lg cursor-pointer">
                Create Your Free Account
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-white border-t border-ink-100">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2">
          <BrandLogo :size="20" variant="on-light" />
        </div>
        <div class="flex flex-wrap justify-center gap-6 text-sm font-bold text-ink-400">
          <a href="#ai-suite" class="hover:text-ink-900">Plete AI</a>
          <a href="#features" class="hover:text-ink-900">Features</a>
          <a href="#pricing" class="hover:text-ink-900">Pricing</a>
          <a href="#faq" class="hover:text-ink-900">FAQ</a>
          <router-link to="/privacy" class="hover:text-ink-900">Privacy</router-link>
          <router-link to="/terms" class="hover:text-ink-900">Terms</router-link>
          <a href="https://twitter.com/pletefinance" target="_blank" rel="noopener noreferrer"
            class="hover:text-ink-900">Twitter</a>
        </div>
        <div class="text-ink-400 text-sm font-medium">
          © 2026 Plete Finance Inc.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'

const activeAiTab = ref('quicklog')

const aiShowcaseTabs = [
  { id: 'quicklog', label: 'Magic Entry', icon: 'pi pi-bolt' },
  { id: 'ocr', label: 'Receipt & Note OCR', icon: 'pi pi-camera' },
  { id: 'simulator', label: 'Forecast & Simulator', icon: 'pi pi-chart-line' },
  { id: 'coach', label: 'Ask Plete AI & Reports', icon: 'pi pi-comments' }
]

const selectedQuickLogIdx = ref(0)
const quickLogSamples = [
  {
    prompt: '$14.50 oat latte & croissant yesterday and $58 groceries on Friday',
    items: [
      { merchant: 'Coffee & Bakery', category: 'Food & Dining', date: 'Oct 16, 2026', amount: '14.50' },
      { merchant: 'Grocery Market', category: 'Groceries', date: 'Oct 15, 2026', amount: '58.00' }
    ]
  },
  {
    prompt: '$65 gas fill-up on Tuesday and $32 train pass today',
    items: [
      { merchant: 'Gas Station', category: 'Transportation', date: 'Oct 13, 2026', amount: '65.00' },
      { merchant: 'Metro Transit Pass', category: 'Transportation', date: 'Oct 17, 2026', amount: '32.00' }
    ]
  },
  {
    prompt: '$120 electric bill and $15.99 streaming subscription',
    items: [
      { merchant: 'Electric Utility', category: 'Utilities & Bills', date: 'Oct 17, 2026', amount: '120.00' },
      { merchant: 'Streaming Service', category: 'Entertainment', date: 'Oct 17, 2026', amount: '15.99' }
    ]
  }
]

const currentQuickLogSample = computed(() => quickLogSamples[selectedQuickLogIdx.value])

const selectedScenarioIdx = ref(0)
const scenarioSamples = [
  {
    question: 'What if I reduce dining out by $80/month?',
    analysis: 'Based on your current $420/month dining pace, trimming $80/month keeps you comfortably above your historical baseline while boosting your monthly net savings rate from 18% to 22%.',
    sixMonth: '+$480.00',
    twelveMonth: '+$960.00 (4 wks faster)'
  },
  {
    question: 'What if I add $250/month from freelance income?',
    analysis: 'Allocating an extra $250/month directly to your Emergency Fund completes your $10,000 target in 6 weeks instead of 4 months, leaving $1,500 in surplus by spring.',
    sixMonth: '+$1,500.00',
    twelveMonth: '+$3,000.00 (Goal 100%)'
  },
  {
    question: 'What if my rent increases by $150/month next lease?',
    analysis: 'A $150/month housing increase reduces your projected monthly surplus from $640 to $490. Plete AI recommends capping Discretionary Shopping at $200/mo to keep your savings timeline intact.',
    sixMonth: '-$900.00 buffer',
    twelveMonth: '+$5,880 net saved'
  }
]

const currentScenarioSample = computed(() => scenarioSamples[selectedScenarioIdx.value])

const openFaqIdx = ref(0)
const toggleFaq = (idx) => {
  openFaqIdx.value = openFaqIdx.value === idx ? -1 : idx
}

const faqItems = [
  {
    question: 'How does Plete Finance’s Magic Entry work?',
    answer: 'With Magic Entry, you can type your income, expenses or general transactions in plain language such as "$14.50 coffee and lunch yesterday and $58 groceries on Friday." Plete AI automatically extracts each transaction’s merchant, amount, date, and matches it to your custom budget categories. Nothing is written to your records until you review and confirm it.'
  },
  {
    question: 'Can I scan paper receipts and handwritten notes into my budget?',
    answer: 'Yes! Plete Finance includes Vision OCR extraction for JPG, PNG, WebP, and HEIC images. You can snap a photo of a supermarket receipt, restaurant bill, or even a handwritten sticky note, and Plete AI extracts the merchant, date, total amount, and category in seconds while flagging any low-confidence fields for your review.'
  },
  {
    question: 'Do I need to link my bank account to use Plete Finance?',
    answer: 'No. Plete Finance is designed for privacy-first financial clarity without requiring bank logins or third-party credential sharing. You get the speed of AI natural-language logging, receipt scanning, and one-click recurring bill imports while keeping 100% control over your financial data.'
  },
  {
    question: 'What are Predictive Budget Forecasts and the What-If Savings Simulator?',
    answer: 'Predictive Budget Forecasts analyze your current month’s spending velocity and recurring bills to project your end-of-month surplus or category risk. The What-If Savings Scenario Simulator lets you test financial decisions like cutting dining out by $80/month or adding freelance income to see 6-month and 12-month goal impacts without altering your real ledger.'
  },
  {
    question: 'Is Plete Finance free to use, and what does the Premium plan include?',
    answer: 'Plete Finance offers a Free Forever Starter plan that includes unlimited manual transactions, budgets, and savings goals, plus recurring monthly AI credits (15 Magic Entries, 3 Receipt OCR scans, 5 Ask Plete AI chats, 3 Coach Q&As, 1 Forecast, and 2 Simulations every month). Upgrading to Premium ($3.99/month) unlocks unlimited AI features, 10+ years of historical trend analytics, and instant PDF & Excel data exports.'
  },
  {
    question: 'Does Plete Finance support multiple currencies and PDF/Excel exports?',
    answer: 'Yes. You can configure your workspace in major global currencies including USD ($), EUR (€), GBP (£), NGN (₦), CAD, and AUD during onboarding or in Settings, and export audit-ready PDF or Excel financial reports anytime on the Premium plan.'
  }
]
</script>

<style scoped></style>