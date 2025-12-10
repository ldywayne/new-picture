<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <BasicHeader />
      </a-layout-header>
      <a-layout-content class="content" :style="changeBackground">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://www.codefather.cn" target="_blank"> 云图库2.0 by luodongyang </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<script setup lang="ts">
import BasicHeader from '@/components/BasicHeader.vue'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const changeBackground = computed(() => {
  const nowUrl = route.path
  if (nowUrl === '/user/info') {
    return {
      background:
        'linear-gradient(to bottom, ' +
        '#3e9fff 0%, ' + // 纯蓝
        '#3e9fff 0%, ' + // 蓝→白开始
        '#efefef 40%, ' + // 蓝白过渡结束
        '#efefef 100%)',
    }
  } else if (nowUrl === '/add-picture') {
    return {
      background:
        'linear-gradient(to bottom, ' +
        '#3e9fff 0%, ' + // 纯蓝
        '#3e9fff 0%, ' + // 蓝→白开始
        '#efefef 40%, ' + // 蓝白过渡结束
        '#efefef 100%)',
    }
  } else {
    return { background: 'white' } // 其他页面背景为夜晚
  }
  // return nowUrl === '/user/info'
  //   ? {
  //     background:
  //       'linear-gradient(to bottom, ' +
  //       '#3e9fff 0%, ' +   // 纯蓝
  //       '#3e9fff 0%, ' +  // 蓝→白开始
  //       '#efefef 40%, ' +  // 蓝白过渡结束
  //       '#efefef 100%)'
  //   }
  //   : { background: 'white' };  // 其他页面背景为夜晚
})
</script>

<style scoped>
#basic-layout .header {
  /* border: 1px solid red; */
  background-color: white;
  padding-inline: 20px;
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  z-index: 1000;
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
