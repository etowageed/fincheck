<template>
    <header class="bg-white shadow-sm border-b px-6 py-4 fixed top-0 left-0 right-0 z-20">
        <div class="flex justify-between items-center">
            <div class="flex items-center">
                <button 
                    class="mr-4 text-gray-600 hover:text-gray-900 lg:hidden"
                    @click="$emit('toggle-sidebar')"
                >
                    <i class="pi pi-bars text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-blue-600">FinCheck</h1>
            </div>

        </div>
    </header>
</template>

<script setup>
defineEmits(['toggle-sidebar']);
</script>