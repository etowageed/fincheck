<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal header="Export Financial Data"
        :style="{ width: '400px' }">

        <div class="space-y-4">
            <!-- 1. Data Type Selection -->
            <div class="flex flex-col gap-2">
                <label for="dataType" class="font-semibold text-secondary">Data to Include</label>
                <Dropdown id="dataType" v-model="form.type" :options="typeOptions" optionLabel="label"
                    optionValue="value" placeholder="Select content type" />
            </div>

            <!-- 2. Time Range Selection -->
            <div class="flex flex-col gap-2">
                <label for="timeRange" class="font-semibold text-secondary">Time Range</label>
                <Dropdown id="timeRange" v-model="form.days" :options="timeRangeOptions" optionLabel="label"
                    optionValue="value" placeholder="Select time range" />
            </div>

            <!-- 3. Format Selection -->
            <div class="flex flex-col gap-2">
                <label for="formatType" class="font-semibold text-secondary">File Format</label>
                <div class="flex gap-4">
                    <div class="flex items-center">
                        <RadioButton id="formatExcel" value="excel" v-model="form.format" />
                        <label for="formatExcel" class="ml-2 text-primary">Excel (.xlsx)</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton id="formatPdf" value="pdf" v-model="form.format" />
                        <label for="formatPdf" class="ml-2 text-primary">PDF (.pdf)</label>
                    </div>
                </div>
            </div>

            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" severity="secondary" outlined @click="$emit('update:visible', false)" />
                <Button label="Download Report" icon="pi pi-download" :loading="isDownloading" @click="handleDownload"
                    :disabled="!isFormValid" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';

const props = defineProps({
    visible: Boolean,
    /**
     * Optional: pre-select the type for specific page exports (e.g., 'transactions' or 'budget').
     * If not provided, 'all' is the default.
     */
    defaultType: {
        type: String,
        default: 'all',
        validator: (value) => ['transactions', 'budget', 'income', 'expense', 'all'].includes(value)
    },
    /**
     * The label for the button that opens the modal (used by the parent).
     */
    buttonLabel: {
        type: String,
        default: 'Export Data'
    }
});

const emit = defineEmits(['update:visible', 'open-modal']);

const toast = useToast();
const isDownloading = ref(false);
const error = ref(null);

const form = ref({
    type: props.defaultType,
    days: 30,
    format: 'excel',
});

// Watch defaultType prop to ensure form.type is always in sync, especially when prop changes dynamically
watch(() => props.defaultType, (newType) => {
    form.value.type = newType;
}, { immediate: true });


const typeOptions = computed(() => {
    // Determine which options to show based on the defaultType (i.e., the context)
    if (props.defaultType === 'all') {
        return [
            { label: 'All Financial Data', value: 'all' },
            { label: 'Transactions (All)', value: 'transactions' },
            { label: 'Income Only', value: 'income' },
            { label: 'Expenses Only', value: 'expense' },
            { label: 'Budget Items Only', value: 'budget' },
        ];
    } else if (props.defaultType === 'transactions') {
        return [
            { label: 'All Transactions', value: 'transactions' },
            { label: 'Income Only', value: 'income' },
            { label: 'Expenses Only', value: 'expense' },
        ];
    } else if (props.defaultType === 'budget') {
        return [{ label: 'Budget Items Only', value: 'budget' }];
    }
    // Fallback for income/expense only pages if they are ever created
    return [{ label: 'Selected Data Type', value: props.defaultType }];
});

const timeRangeOptions = ref([
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days (3 Months)', value: 90 },
    { label: 'Last 180 Days (6 Months)', value: 180 },
    { label: 'Last 365 Days (1 Year)', value: 365 },
]);

const isFormValid = computed(() => {
    return form.value.type && form.value.days && form.value.format;
});

const handleDownload = async () => {
    if (!isFormValid.value) return;

    isDownloading.value = true;
    error.value = null;

    try {
        const queryParams = new URLSearchParams({
            format: form.value.format,
            type: form.value.type,
            days: form.value.days,
        }).toString();

        // Use the same base API URL as other services
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/users/reports/export?${queryParams}`;

        const response = await axios.get(apiUrl, {
            responseType: 'blob', // Important for downloading files
            withCredentials: true,
        });

        // 1. Get filename from headers (or default)
        let filename = `fincheck-report-${form.value.type}.${form.value.format}`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/i) || contentDisposition.match(/filename=(.+?);/i);
            if (match && match[1]) {
                filename = match[1].replace(/"/g, '').trim();
            }
        }

        // 2. Create a Blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data], {
            type: response.headers['content-type']
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Report generated and download started.', life: 3000 });
        emit('update:visible', false); // Close the modal
    } catch (err) {
        // Handle API error messages from the backend (which typically return JSON even if responseType is blob)
        if (err.response && err.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const json = JSON.parse(reader.result);
                    error.value = json.message || 'Failed to generate report.';
                } catch (e) {
                    error.value = 'Failed to generate report due to a server error.';
                }
            };
            reader.readAsText(err.response.data);
        } else {
            error.value = err.message || 'An unexpected error occurred during download.';
        }

        toast.add({ severity: 'error', summary: 'Export Failed', detail: error.value, life: 5000 });
        console.error('Export error:', err);

    } finally {
        isDownloading.value = false;
    }
};
</script>
