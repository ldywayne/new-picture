<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh;">
      <a-layout-header class="header">
        <BasicHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://www.codefather.cn" target="_blank">
          云图库2.0 by luodongyang
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<script setup lang="ts">
import BasicHeader from "@/components/BasicHeader.vue";



</script>

<style scoped>
#basic-layout .header {
  /* border: 1px solid red; */
  background-color: white;
  padding-inline: 20px;
  margin-bottom: 12px;
}

#basic-layout .content {
  /* border: 1px solid red; */
  background-color: white;
  padding: 20px;
  margin-bottom: 30px;
}

#basic-layout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
