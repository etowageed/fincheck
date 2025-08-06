<template>
    <div>
        this is the transactions page
        <UserTransactions />

        <RouterLink to="/dashboard">Go to Dashboard</RouterLink>
        <Logout />
    </div>
</template>

<script setup>
import UserTransactions from '@/components/dashboard/UserTransactions.vue';
import Logout from '@/components/auth/Logout.vue';

</script>
