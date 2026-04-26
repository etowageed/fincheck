<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Financial Goals</h1>
            <Button v-if="authStore.isPremium" label="Create Goal" icon="pi pi-plus" class="btn-cta" @click="openGoalDialog" />
        </div>

        <div v-if="!authStore.isPremium" class="bg-secondary border border-default rounded-lg p-8 text-center">
            <i class="pi pi-lock text-4xl text-muted mb-4"></i>
            <h2 class="text-xl font-bold mb-2">Premium Feature</h2>
            <p class="text-secondary mb-4">Unlock goal tracking to supercharge your savings and financial planning.</p>
            <RouterLink to="/pricing">
                <Button label="Upgrade Now" class="btn-cta" />
            </RouterLink>
        </div>

        <div v-else>
            <div v-if="authStore.user?.goals?.length === 0" class="text-center py-12 bg-secondary rounded-lg border border-default">
                <i class="pi pi-star text-4xl text-muted mb-4"></i>
                <h2 class="text-lg font-semibold text-primary mb-2">No Goals Set</h2>
                <p class="text-secondary mb-4">You haven't created any financial goals yet.</p>
                <Button label="Create Your First Goal" class="btn-cta" @click="openGoalDialog" />
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="goal in authStore.user.goals" :key="goal._id" class="p-6 bg-secondary rounded-xl border border-default shadow-sm hover:shadow-md transition-shadow relative group">
                    <div class="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button icon="pi pi-trash" text severity="danger" size="small" @click="deleteGoal(goal)" v-tooltip.top="'Delete Goal'" />
                    </div>
                    
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-accent-blue">
                            <i :class="['pi', goal.icon || 'pi-star']" class="text-xl"></i>
                        </div>
                        <h3 class="text-lg font-bold text-primary">{{ goal.name }}</h3>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-sm text-secondary">Progress</span>
                            <span class="text-lg font-bold" :class="goal.currentAmount >= goal.targetAmount ? 'text-accent-green' : 'text-primary'">
                               {{ Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) }}%
                            </span>
                        </div>
                        <ProgressBar :value="Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)" 
                                     :showValue="false" 
                                     class="h-3 rounded-full" />
                    </div>

                    <div class="bg-primary rounded-lg border border-default p-3 flex justify-between items-center text-sm">
                        <div>
                            <p class="text-muted text-xs">Saved</p>
                            <p class="font-semibold text-primary">{{ formatCurrency(goal.currentAmount) }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-muted text-xs">Target</p>
                            <p class="font-semibold text-primary">{{ formatCurrency(goal.targetAmount) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="showGoalDialog" modal header="Set Financial Goal" :style="{ width: '400px' }">
            <div class="flex flex-col gap-4 mt-2">
                <div class="flex flex-col gap-2">
                    <label for="goalName" class="font-semibold text-sm">Goal Name</label>
                    <InputText id="goalName" v-model="goalForm.name" placeholder="e.g. New Car, Vacation" :class="{ 'p-invalid': goalErrors.name }" />
                    <small v-if="goalErrors.name" class="p-error">{{ goalErrors.name }}</small>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="goalAmount" class="font-semibold text-sm">Target Amount</label>
                    <InputNumber id="goalAmount" v-model="goalForm.targetAmount" mode="currency" :currency="currentCurrency" :locale="currentLocale" :class="{ 'p-invalid': goalErrors.targetAmount }" />
                    <small v-if="goalErrors.targetAmount" class="p-error">{{ goalErrors.targetAmount }}</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" severity="secondary" outlined @click="showGoalDialog = false" :disabled="isSaving" />
                <Button label="Save Goal" class="btn-cta" @click="saveGoal" :loading="isSaving" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import { deleteGoal as apiDeleteGoal } from '@/services/auth';

const authStore = useAuthStore();
const { preferredCurrency: currentCurrency, preferredLocale: currentLocale, formatCurrency } = useCurrencyFormatter();

const showGoalDialog = ref(false);
const isSaving = ref(false);
const goalForm = ref({ name: '', targetAmount: null });
const goalErrors = ref({});

const openGoalDialog = () => {
    goalForm.value = { name: '', targetAmount: null };
    goalErrors.value = {};
    showGoalDialog.value = true;
};

const saveGoal = async () => {
    goalErrors.value = {};
    if (!goalForm.value.name) goalErrors.value.name = 'Goal name is required';
    if (!goalForm.value.targetAmount || goalForm.value.targetAmount <= 0) goalErrors.value.targetAmount = 'Valid amount is required';
    
    if (Object.keys(goalErrors.value).length > 0) return;

    isSaving.value = true;
    try {
        await authStore.addGoal({ name: goalForm.value.name, targetAmount: goalForm.value.targetAmount });
        showGoalDialog.value = false;
    } catch (err) {
        console.error('Failed to save goal', err);
    } finally {
        isSaving.value = false;
    }
};

const deleteGoal = async (goal) => {
    if (confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
        try {
            await apiDeleteGoal(goal._id);
            await authStore.checkAuth();
        } catch(err) {
            console.error('Failed to delete goal', err);
        }
    }
}
</script>
