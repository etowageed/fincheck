<template>
    <div
        class="min-h-screen bg-primary text-primary font-sans selection:bg-accent-yellow selection:text-black overflow-x-hidden">
        <!-- Navigation -->
        <nav
            class="fixed w-full z-50 bg-primary/90 backdrop-blur-lg border-b border-default transition-all duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-20 items-center">
                    <div class="flex items-center gap-3 group cursor-pointer" @click="$router.push('/')">
                        <div
                            class="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-blue/20 group-hover:scale-105 transition-transform">
                            <i class="pi pi-chart-pie font-bold text-xl"></i>
                        </div>
                        <span
                            class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">FinCheck</span>
                    </div>
                    <div class="hidden md:flex items-center gap-8">
                        <a href="#features"
                            class="text-sm font-medium text-secondary hover:text-primary transition-colors">Features</a>
                        <a href="#testimonials"
                            class="text-sm font-medium text-secondary hover:text-primary transition-colors">Stories</a>
                        <a href="#pricing"
                            class="text-sm font-medium text-secondary hover:text-primary transition-colors">Pricing</a>
                        <div class="flex items-center gap-4 ml-4">
                            <router-link to="/login"
                                class="text-sm font-bold text-primary hover:text-accent-blue transition-colors">Log
                                in</router-link>
                            <router-link to="/signup">
                                <button
                                    class="bg-primary text-primary border-2 border-primary px-6 py-2.5 rounded-full text-sm font-bold hover:bg-transparent hover:text-primary transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] dark:shadow-white dark:border-white">
                                    Start Free
                                </button>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
            <!-- Background Blobs -->
            <div
                class="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent-blue/10 rounded-full blur-3xl -z-10 animate-pulse-slow">
            </div>
            <div class="absolute top-40 right-0 w-[400px] h-[400px] bg-accent-green/10 rounded-full blur-3xl -z-10">
            </div>

            <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-bold mb-8 animate-fade-in-up border border-accent-blue/20">
                <span class="w-2 h-2 rounded-full bg-accent-blue animate-ping"></span>
                Voted #1 Personal Finance Tool 2025
            </div>

            <h1
                class="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in-up delay-100">
                Master your money.<br />
                <span
                    class="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-green to-accent-blue animate-gradient-x">
                    Build your future.
                </span>
            </h1>

            <p
                class="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-secondary mb-12 leading-relaxed animate-fade-in-up delay-200">
                Stop wondering where your money goes. FinCheck gives you the clarity and control you need to achieve
                financial freedom.
            </p>

            <div class="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up delay-300">
                <router-link to="/signup" class="w-full sm:w-auto">
                    <button
                        class="w-full sm:w-auto bg-accent-yellow text-gray-900 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-xl shadow-accent-yellow/20">
                        Get Started for Free
                    </button>
                </router-link>
                <a href="#demo"
                    class="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-primary bg-tertiary hover:bg-secondary transition-all">
                    <i class="pi pi-play-circle text-2xl text-accent-blue"></i>
                    Watch Demo
                </a>
            </div>

            <!-- Dashboard Preview -->
            <div class="mt-24 relative mx-auto max-w-6xl animate-fade-in-up delay-500 perspective-1000">
                <div
                    class="relative bg-primary rounded-3xl border-8 border-tertiary shadow-2xl overflow-hidden transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                    <img src="https://placehold.co/1200x800/1f2937/ffffff?text=FinCheck+Dashboard+Preview"
                        alt="Dashboard" class="w-full h-auto" />

                    <!-- Floating Cards -->
                    <div
                        class="absolute -right-10 top-20 bg-primary p-4 rounded-2xl shadow-xl border border-default animate-float hidden md:block">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <i class="pi pi-arrow-up"></i>
                            </div>
                            <div>
                                <p class="text-xs text-secondary">Income</p>
                                <p class="font-bold text-accent-green">+$4,250.00</p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="absolute -left-10 bottom-20 bg-primary p-4 rounded-2xl shadow-xl border border-default animate-float-delayed hidden md:block">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <i class="pi pi-shopping-cart"></i>
                            </div>
                            <div>
                                <p class="text-xs text-secondary">Groceries</p>
                                <p class="font-bold text-accent-red">-$124.50</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Proof -->
        <section class="py-12 border-y border-default bg-secondary/50">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-sm font-bold text-secondary uppercase tracking-widest mb-8">Trusted by smart investors
                    from</p>
                <div
                    class="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <span class="text-2xl font-bold font-serif">Forbes</span>
                    <span class="text-2xl font-bold font-serif">WSJ</span>
                    <span class="text-2xl font-bold font-mono">TechCrunch</span>
                    <span class="text-2xl font-bold font-sans">Bloomberg</span>
                    <span class="text-2xl font-bold font-serif">WIRED</span>
                </div>
            </div>
        </section>

        <!-- Features Grid -->
        <section id="features" class="py-32 bg-primary relative">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-24">
                    <h2 class="text-4xl md:text-5xl font-extrabold mb-6">Everything you need to grow</h2>
                    <p class="text-xl text-secondary max-w-2xl mx-auto">We've packed the power of a professional CFO
                        into a simple, friendly interface that actually makes finance fun.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Feature 1 -->
                    <div
                        class="md:col-span-2 bg-tertiary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div class="relative z-10 max-w-md">
                            <div
                                class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 text-accent-blue">
                                <i class="pi pi-wallet text-3xl"></i>
                            </div>
                            <h3 class="text-3xl font-bold mb-4">Smart Budgeting</h3>
                            <p class="text-lg text-secondary leading-relaxed">Automatically categorize your transactions
                                and set realistic budgets. We'll notify you before you overspend, keeping your goals on
                                track without the stress.</p>
                        </div>
                        <div
                            class="absolute right-0 bottom-0 w-1/2 h-3/4 bg-primary rounded-tl-[2.5rem] border-t border-l border-default p-6 shadow-xl translate-y-10 translate-x-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
                            <!-- Mock UI -->
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="font-bold">Monthly Budget</span>
                                    <span class="text-accent-green">On Track</span>
                                </div>
                                <div class="w-full bg-tertiary rounded-full h-3">
                                    <div class="bg-accent-blue h-3 rounded-full w-3/4"></div>
                                </div>
                                <div class="flex gap-3 mt-4">
                                    <div class="h-20 w-full bg-tertiary rounded-xl"></div>
                                    <div class="h-20 w-full bg-tertiary rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2 -->
                    <div
                        class="bg-tertiary rounded-[2.5rem] p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div
                            class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-8 text-accent-green">
                            <i class="pi pi-chart-line text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Deep Insights</h3>
                        <p class="text-secondary mb-8">Visualize your spending patterns with beautiful, interactive
                            charts.</p>
                        <div
                            class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-accent-green/10 to-transparent">
                        </div>
                    </div>

                    <!-- Feature 3 -->
                    <div
                        class="bg-tertiary rounded-[2.5rem] p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div
                            class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-8 text-accent-yellow">
                            <i class="pi pi-shield text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Bank-Grade Security</h3>
                        <p class="text-secondary mb-8">Your data is encrypted with 256-bit SSL. We never sell your
                            personal information.</p>
                    </div>

                    <!-- Feature 4 -->
                    <div
                        class="md:col-span-2 bg-tertiary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div class="flex flex-col md:flex-row items-center gap-12">
                            <div class="flex-1 relative z-10">
                                <div
                                    class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-8 text-accent-red">
                                    <i class="pi pi-bell text-3xl"></i>
                                </div>
                                <h3 class="text-3xl font-bold mb-4">Real-time Alerts</h3>
                                <p class="text-lg text-secondary leading-relaxed">Get notified instantly about large
                                    transactions, bill due dates, and unusual activity. Stay in the loop, always.</p>
                            </div>
                            <div class="flex-1 w-full">
                                <div
                                    class="bg-primary rounded-2xl p-6 shadow-lg border border-default transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <div class="flex items-center gap-4 mb-4 border-b border-default pb-4">
                                        <div
                                            class="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center text-accent-red">
                                            <i class="pi pi-exclamation-circle"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold">Unusual Spending</p>
                                            <p class="text-xs text-secondary">Just now</p>
                                        </div>
                                    </div>
                                    <p class="text-sm text-secondary">We noticed a large transaction of $499.00 at Apple
                                        Store. Was this you?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials -->
        <section id="testimonials" class="py-32 bg-secondary border-t border-default">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-4xl font-extrabold text-center mb-16">Loved by thousands</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-primary p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                        <div class="flex gap-1 text-accent-yellow mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-lg text-secondary mb-6">"FinCheck completely changed how I look at money. I
                            finally feel in control of my future."</p>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                                <p class="font-bold">Sarah J.</p>
                                <p class="text-sm text-secondary">Freelance Designer</p>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-primary p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform md:-translate-y-4">
                        <div class="flex gap-1 text-accent-yellow mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-lg text-secondary mb-6">"The automated categorization is a game changer. I used
                            to spend hours on spreadsheets, now it takes minutes."</p>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                                <p class="font-bold">Michael R.</p>
                                <p class="text-sm text-secondary">Software Engineer</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-primary p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                        <div class="flex gap-1 text-accent-yellow mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i
                                class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-lg text-secondary mb-6">"Simple, beautiful, and effective. It's the only finance
                            app that stuck with me for more than a month."</p>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                                <p class="font-bold">Jessica T.</p>
                                <p class="text-sm text-secondary">Small Business Owner</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-32 px-4">
            <div
                class="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center border-4 border-accent-yellow relative overflow-hidden shadow-2xl">
                <!-- Decorative Elements -->
                <div
                    class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent-yellow/20 rounded-full blur-3xl animate-pulse-slow">
                </div>
                <div
                    class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent-blue/20 rounded-full blur-3xl animate-pulse-slow delay-700">
                </div>

                <h2 class="text-5xl md:text-6xl font-extrabold mb-8 relative z-10">Ready to take charge?</h2>
                <p class="text-xl md:text-2xl text-secondary mb-12 max-w-2xl mx-auto relative z-10">
                    Join thousands of users who have stopped wondering where their money goes. Start your journey today.
                </p>
                <div class="relative z-10 flex flex-col items-center gap-4">
                    <router-link to="/signup">
                        <button
                            class="bg-black text-white dark:bg-white dark:text-black px-12 py-5 rounded-full text-xl font-bold hover:scale-105 transition duration-300 shadow-lg">
                            Create Free Account
                        </button>
                    </router-link>
                    <p class="text-sm text-muted flex items-center gap-2">
                        <i class="pi pi-check-circle text-accent-green"></i> No credit card required
                        <span class="mx-2">•</span>
                        <i class="pi pi-check-circle text-accent-green"></i> Cancel anytime
                    </p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-secondary py-16 border-t border-default">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div class="col-span-1 md:col-span-2">
                        <div class="flex items-center gap-2 mb-6">
                            <div class="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center text-white">
                                <i class="pi pi-chart-pie font-bold"></i>
                            </div>
                            <span class="text-2xl font-bold">FinCheck</span>
                        </div>
                        <p class="text-secondary max-w-sm">The smartest way to track your personal finances. Secure,
                            simple, and powerful.</p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6">Product</h4>
                        <ul class="space-y-4 text-secondary">
                            <li><a href="#" class="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" class="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" class="hover:text-primary transition-colors">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6">Company</h4>
                        <ul class="space-y-4 text-secondary">
                            <li><a href="#" class="hover:text-primary transition-colors">About</a></li>
                            <li><a href="#" class="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="mailto:support@fincheck.com"
                                    class="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div class="pt-8 border-t border-default flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="text-sm text-muted">
                        © 2025 FinCheck Inc. All rights reserved.
                    </div>
                    <div class="flex gap-6 text-sm text-secondary">
                        <router-link to="/terms" class="hover:text-primary transition-colors">Terms</router-link>
                        <router-link to="/privacy" class="hover:text-primary transition-colors">Privacy</router-link>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
// No script needed for static landing page
</script>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes gradient-x {

    0%,
    100% {
        background-size: 200% 200%;
        background-position: left center;
    }

    50% {
        background-size: 200% 200%;
        background-position: right center;
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
    animation: float 6s ease-in-out infinite 3s;
}

.animate-gradient-x {
    animation: gradient-x 3s ease infinite;
}

.animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-100 {
    animation-delay: 100ms;
}

.delay-200 {
    animation-delay: 200ms;
}

.delay-300 {
    animation-delay: 300ms;
}

.delay-500 {
    animation-delay: 500ms;
}

.delay-700 {
    animation-delay: 700ms;
}

.perspective-1000 {
    perspective: 1000px;
}
</style>