<template>
    <div class="relative">
        <Button :icon="icon" :severity="severity" :size="size" :text="text" @click="toggleMenu($event)"
            :aria-haspopup="true" :aria-expanded="menuVisible" :disabled="disabled" />
        <Menu ref="menuRef" :model="menuItems" :popup="true" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    items: {
        type: Array,
        required: true,
        // Expected format: 
        // [
        //   { label: 'Edit', icon: 'pi pi-pencil', action: 'edit' },
        //   { separator: true },
        //   { label: 'Delete', icon: 'pi pi-trash', action: 'delete', danger: true }
        // ]
    },
    entity: {
        type: Object,
        required: true,
        // The data object that will be passed to action handlers
    },
    disabled: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: 'pi pi-ellipsis-v'
    },
    severity: {
        type: String,
        default: 'secondary'
    },
    size: {
        type: String,
        default: 'small'
    },
    text: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['action']);

const menuRef = ref(null);
const menuVisible = ref(false);

const menuItems = computed(() => {
    return props.items.map(item => {
        if (item.separator) {
            return { separator: true };
        }

        return {
            label: item.label,
            icon: item.icon,
            class: item.danger ? 'text-red-600' : '',
            command: () => handleAction(item.action, item)
        };
    });
});

const toggleMenu = (event) => {
    if (menuRef.value) {
        menuRef.value.toggle(event);
        menuVisible.value = !menuVisible.value;
    }
};

const handleAction = (action, menuItem) => {
    menuVisible.value = false;

    // Emit the action with entity data and menu item config
    emit('action', {
        action,
        entity: props.entity,
        menuItem
    });
};
</script>