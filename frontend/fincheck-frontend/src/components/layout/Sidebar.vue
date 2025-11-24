<template>
    <aside 
        class="bg-white shadow-sm border-r w-64 h-screen fixed left-0 top-0 pt-20 transition-transform duration-300 z-30"
        :class="[
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
    >
        <div class="flex flex-col h-full">
            <!-- Navigation Section -->
            <nav class="flex-1 px-4 py-6">
                <div class="space-y-2">
                    <!-- Navigation Links -->


                    <RouterLink to="/transactions"
                        class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        active-class="bg-blue-50 text-blue-600"
                        @click="$emit('close-mobile')"
                    >
                        <i class="pi pi-list mr-3"></i>
                        Transactions
                    </RouterLink>

                    <RouterLink to="/dashboard"
                        class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        active-class="bg-blue-50 text-blue-600"
                        @click="$emit('close-mobile')"
                    >
                        <i class="pi pi-home mr-3"></i>
                        Dashboard
                    </RouterLink>



                    <RouterLink to="/budget"
                        class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        active-class="bg-blue-50 text-blue-600"
                        @click="$emit('close-mobile')"
                    >
                        <i class="pi pi-wallet mr-3"></i>
                        Budget
                    </RouterLink>

                    <RouterLink to="/categories"
                        class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        active-class="bg-blue-50 text-blue-600"
                        @click="$emit('close-mobile')"
                    >
                        <i class="pi pi-tags mr-3"></i>
                        Categories
                    </RouterLink>
                </div>
            </nav>

            <!-- Bottom Section -->
            <div class="px-4 py-6 border-t">
                <div class="space-y-2">
                    <!-- Dark Mode Toggle -->
                    <Button>
                        <ToggleDarkMode />
                    </Button>
                    <!-- Settings Link -->
                    <RouterLink to="/settings"
                        class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        active-class="bg-blue-50 text-blue-600"
                        @click="$emit('close-mobile')"
                    >
                        <i class="pi pi-cog mr-3"></i>
                        Settings
                    </RouterLink>

                    <!-- Logout Button -->
                    <Logout />

                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
    isMobileOpen: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close-mobile']);
</script>