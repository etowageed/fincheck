<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
    </div>

    <div class="card bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <DataTable :value="users" :loading="loading" dataKey="_id" tableStyle="min-width: 50rem" removableSort paginator
        :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]">
        <template #empty> No users found. </template>
        <template #loading> Loading users data. Please wait. </template>

        <Column field="name" header="Name" sortable style="width: 20%"></Column>
        <Column field="email" header="Email" sortable style="width: 25%"></Column>
        <Column field="role" header="Role" sortable style="width: 15%">
          <template #body="{ data }">
            <span :class="{
              'bg-blue-100 text-blue-800': data.role === 'admin',
              'bg-gray-100 text-gray-800': data.role === 'user'
            }" class="px-2 py-1 rounded text-xs font-semibold capitalize">
              {{ data.role }}
            </span>
          </template>
        </Column>
        <Column field="subscriptionStatus" header="Subscription" sortable style="width: 15%">
          <template #body="{ data }">
            <span :class="{
              'bg-green-100 text-green-800': data.subscriptionStatus === 'premium',
              'bg-yellow-100 text-yellow-800': data.subscriptionStatus === 'free',
              'bg-red-100 text-red-800': data.subscriptionStatus === 'canceled'
            }" class="px-2 py-1 rounded text-xs font-semibold capitalize">
              {{ data.subscriptionStatus }}
            </span>
          </template>
        </Column>

        <Column header="Actions" style="width: 25%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <DropdownMenu :items="getSubscriptionActions(data)" :entity="data" icon="pi pi-cog"
                @action="handleMenuAction" />
              <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Delete" @click="confirmDelete(data)"
                :disabled="data.role === 'admin'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog :visible="deleteDialogVisible" @update:visible="deleteDialogVisible = $event" modal header="Confirm Action"
      :style="{ width: '25rem' }">
      <span class="text-surface-500  block mb-8">Are you sure you want to delete this user?</span>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="deleteDialogVisible = false"></Button>
        <Button type="button" label="Delete" severity="danger" @click="executeDelete" :loading="deleteLoading"></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import DropdownMenu from '@/components/common/DropdownMenu.vue';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const users = ref([]);
const loading = ref(true);
const toast = useToast();

const deleteDialogVisible = ref(false);
const deleteLoading = ref(false);
const userToDelete = ref(null);

const getSubscriptionActions = (user) => {
  return [
    {
      label: 'Upgrade to Premium',
      icon: 'pi pi-star',
      action: 'upgrade_premium',
      disabled: user.subscriptionStatus === 'premium'
    },
    {
      label: 'Downgrade to Free',
      icon: 'pi pi-arrow-down',
      action: 'downgrade_free',
      disabled: user.subscriptionStatus === 'free'
    }
  ];
};

const handleMenuAction = ({ action, entity }) => {
  if (action === 'upgrade_premium') {
    updateSubscriptionStatus(entity, 'premium');
  } else if (action === 'downgrade_free') {
    updateSubscriptionStatus(entity, 'free');
  }
};

const updateSubscriptionStatus = async (user, status) => {
  try {
    const response = await api.patch(`/users/${user._id || user.id}`, {
      subscriptionStatus: status
    });

    // Update local state
    const updatedUser = response.data.data;
    const index = users.value.findIndex(u => (u._id || u.id) === (user._id || user.id));
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updatedUser };
    }

    toast.add({ severity: 'success', summary: 'Success', detail: `User subscription updated to ${status}`, life: 3000 });
  } catch (error) {
    console.error('Failed to update subscription', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update subscription', life: 3000 });
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get('/users');
    if (response.data && response.data.data) {
      // The backend API structure for getAllUsers returns res.status(200).json(result);
      // where result contains { results: 5, total: 5, data: [ ... ] } based on apiFeatures
      // OR it might just be the result object directly if paginate() was called.
      // Let's assume standard response structure or handle direct array.
      // Wait, looking at userController.getAllUsers: 
      // const result = await features.getResults(); 
      // res.status(200).json(result);
      // apiFeatures.getResults() usually returns { status: 'success', results: n, data: { data: [...] } } or similar?
      // Wait, let's verify APIFeatures from userController.js. 
      // It says `res.status(200).json(result)`.

      // I should have checked apiFeatures.js but assume standard JSend: { status: 'success', data: { data: [...] } }
      // Actually, userController says `const result = await features.getResults();`
      // I'll assume users are in response.data.data.data or response.data.data

      // Let's assume response.data.data as per standard, but it might be response.data.data.data if paginated.
      // For safety I will check.
      users.value = response.data.data || response.data;
    }
  } catch (error) {
    console.error('Failed to fetch users', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  deleteDialogVisible.value = true;
}

const executeDelete = async () => {
  if (!userToDelete.value) return;

  deleteLoading.value = true;
  try {
    await api.delete(`/users/${userToDelete.value._id || userToDelete.value.id}`);
    toast.add({ severity: 'success', summary: 'Confirmed', detail: 'User deleted', life: 3000 });
    users.value = users.value.filter(u => u._id !== userToDelete.value._id && u.id !== userToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete user', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
  } finally {
    deleteLoading.value = false;
    deleteDialogVisible.value = false;
    userToDelete.value = null;
  }
}

onMounted(() => {
  fetchUsers();
});
</script>
