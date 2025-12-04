<template>
    <header class="bg-primary shadow-sm border-b border-default px-6 py-4 fixed top-0 left-0 right-0 z-20">
        <div class="flex justify-between items-center">
            <div class="flex items-center">
                <button 
                    class="mr-4 text-secondary hover:text-primary lg:hidden"
                    @click="$emit('toggle-sidebar')"
                >
                    <i class="pi pi-bars text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-accent-blue">FinCheck</h1>
            </div>

        </div>
    </header>
</template>

<script setup>
defineEmits(['toggle-sidebar']);
</script>