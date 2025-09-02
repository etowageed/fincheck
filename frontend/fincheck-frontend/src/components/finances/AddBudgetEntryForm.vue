<template>
    <div class="card flex justify-center">
        <Button label="Create Budget" @click="visible = true" />
        <Dialog v-model:visible="visible" modal header="Create Budget" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">Create your budget</span>
            <div class="flex items-center gap-4 mb-4">
                <label for="income" class="font-semibold w-24">Expected Monthly Income</label>
                <InputText id="income" class="flex-auto" autocomplete="off" type="number" />
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Save" @click="visible = false"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
</script>
