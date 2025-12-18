<template>
    <div class="min-h-screen bg-tertiary py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto bg-primary shadow rounded-lg p-8 border border-default">
            <h1 class="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
            <div class="prose  max-w-none text-secondary space-y-4">
                <p>Last updated: December 2025</p>

                <h2 class="text-xl font-semibold text-primary mt-6">1. Information We Collect</h2>
                <p>We only collect the following personal information when you create an account:</p>
                <ul class="list-disc pl-5">
                    <li><strong>Name:</strong> To personalize your experience.</li>
                    <li><strong>Email Address:</strong> To authenticate your account and send important notifications.
                    </li>
                </ul>
                <p>We do not collect any other personal identification information.
                </p>

                <h2 class="text-xl font-semibold text-primary mt-6">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, such as to track
                    your income and expenses and generate reports.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">3. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect your personal data against
                    unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at support@fincheck.com.</p>

                <div class="mt-8 pt-6 border-t border-default">
                    <RouterLink to="/signup"
                        class="text-accent-blue hover:text-blue-800  font-medium">
                        &larr; Back to Sign Up
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
