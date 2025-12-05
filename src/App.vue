<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from "@/Layouts/BasicLayout.vue";
import { useUserLoginUserStore } from "@/stores/userLoginUserStore";

const loginUserStore = useUserLoginUserStore();
// 从后端获取登录用户信息
loginUserStore.fetchLoginUser()
</script>
<style>
#app {}
</style>
