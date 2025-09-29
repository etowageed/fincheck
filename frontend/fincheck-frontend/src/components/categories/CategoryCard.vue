<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start">
            <div>
                <h3 class="font-semibold text-primary">{{ category.name }}</h3>
                <div class="mt-2">
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

            <DropdownMenu :items="menuItems" :entity="category" @action="handleAction" />
        </div>

        <p v-if="category.description" class="text-sm text-secondary mt-3 pt-3 border-t border-default">
            {{ category.description }}
        </p>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import DropdownMenu from '../common/DropdownMenu.vue';

const props = defineProps({
    category: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['edit', 'delete', 'restore']);

// Create a dynamic list of actions for the dropdown menu
const menuItems = computed(() => {
    const items = [
        { label: 'Edit', icon: 'pi pi-pencil', action: 'edit' }
    ];

    // Conditionally add the "Restore" action if the category is an override
    if (props.category.overridesGlobalDefault) {
        items.push({ label: 'Restore Default', icon: 'pi pi-undo', action: 'restore' });
    }

    items.push({ separator: true });

    // Add the delete/hide action with a dynamic label
    items.push({
        label: props.category.isGlobalDefault ? 'Hide' : 'Delete',
        icon: 'pi pi-trash',
        action: 'delete',
        danger: true
    });

    return items;
});

// Handle the single 'action' event from the dropdown and emit the specific event upwards
const handleAction = ({ action, entity }) => {
    emit(action, entity);
};
</script>