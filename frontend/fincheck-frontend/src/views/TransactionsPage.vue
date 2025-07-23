<template>
    <div>
        this is the transactions page
        <UserTransactions />

        <Logout />
    </div>
</template>

<script setup>
import UserTransactions from '@/components/dashboard/UserTransactions.vue';
import Logout from '@/components/auth/Logout.vue';

</script>
