<script setup>
import { useGameStore } from '~/stores/Game';

const gameStore = useGameStore();


</script>

<template>
    <div>
        <p v-for="item in gameStore.getMalusLevel" class="alert alert-danger d-block my-1" >{{item.description}}</p>
    </div>
</template>