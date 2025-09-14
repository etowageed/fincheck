<!-- filepath: /home/gideon-etowa/workspace/code/fincheck/frontend/fincheck-frontend/src/components/categories/CategoryCard.vue -->
<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-4 hover:shadow-md transition-shadow">
        <!-- Category Header -->
        <div class="flex justify-between items-start mb-3">
            <div>
                <h3 class="font-semibold text-primary">{{ category.name }}</h3>
                <p v-if="category.description" class="text-sm text-secondary mt-1">{{ category.description }}</p>
            </div>

            <!-- Category Type Badge -->
            <div class="flex gap-1">
                <span v-if="category.isGlobalDefault" class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    Default
                </span>
                <span v-else-if="category.overridesGlobalDefault"
                    class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                    Custom
                </span>
                <span v-else class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    Personal
                </span>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-4">
            <!-- Edit Button -->
            <Button icon="pi pi-pencil" size="small" severity="secondary" outlined @click="$emit('edit', category)"
                class="flex-1" label="Edit" />

            <!-- Restore Button (for overridden categories) -->
            <Button v-if="category.overridesGlobalDefault" icon="pi pi-undo" size="small" severity="info" outlined
                @click="$emit('restore', category)" class="flex-1" label="Restore" />

            <!-- Delete Button -->
            <Button icon="pi pi-trash" size="small" severity="danger" outlined @click="$emit('delete', category)"
                class="flex-1" :label="category.isGlobalDefault ? 'Hide' : 'Delete'" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    category: {
        type: Object,
        required: true
    }
});

defineEmits(['edit', 'delete', 'restore']);
</script>