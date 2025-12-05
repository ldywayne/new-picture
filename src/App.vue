<template>
  <a-config-provider :locale="zhCN">
    <div id="app">
      <BasicLayout />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import BasicLayout from "@/Layouts/BasicLayout.vue";
// import { useLoginUserStore } from "@/stores/userLoginUserStore";
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// const loginUserStore = useLoginUserStore();
// // 从后端获取登录用户信息
// loginUserStore.fetchLoginUser()
</script>
<style>
#app {}
</style>
