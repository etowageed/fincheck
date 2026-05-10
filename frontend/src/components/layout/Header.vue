<template>
    <header class="bg-primary shadow-sm border-b border-default px-6 py-4 fixed top-0 left-0 right-0 z-20">
        <div class="flex justify-between items-center">
            <div class="flex items-center">
                <button class="mr-4 text-secondary hover:text-primary lg:hidden" @click="$emit('toggle-sidebar')" aria-label="Toggle navigation menu">
                    <i class="pi pi-bars text-xl"></i>
                </button>
                <span class="text-xl md:text-2xl font-bold tracking-tight text-primary leading-snug">Plete Finance</span>
            </div>

        </div>
    </header>
</template>

<script setup>
defineEmits(['toggle-sidebar']);
</script>