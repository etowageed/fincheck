<template>
    <div>
        this is the transactions page
        <UserTransactions />

        <RouterLink to="/dashboard"><Button label="Go to Dashboard" /></RouterLink>

        <br>
        <br>

        <Logout />

    </div>
</template>

<script setup>
import UserTransactions from '@/components/dashboard/UserTransactions.vue';
import Logout from '@/components/auth/Logout.vue';

</script>
