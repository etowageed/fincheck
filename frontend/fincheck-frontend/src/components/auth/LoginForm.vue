<template>
    <div class="card flex justify-center">

        <InputText type="text" v-model="email" />
        <Password v-model="value" :feedback="true" />
    </div>
</template>

<script setup>
import { ref } from 'vue';

const value = ref(null);
const email = ref(null);
</script>