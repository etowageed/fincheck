<template>
    <div>
        <h1>Dashboard</h1>
        <br>

        <UserDashboard />

        <RouterLink to="/transactions">
            <Button label="Back to transactions" />
        </RouterLink>
    </div>
</template>

<script setup>
import UserDashboard from '@/components/dashboard/UserDashboard.vue';

</script>