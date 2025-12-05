<template>
  <div id="header">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="@/assets/logo.svg" alt="logo" />
            <div class="title">
              云图库2.0
            </div>
          </div>
        </router-link>

      </a-col>
      <a-col flex="auto">
        <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick" />
      </a-col>
      <a-col flex="120px">
        <!-- 用户信息展示 -->
        <div class="login-bar">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                {{ loginUserStore.loginUser.userName ?? '未登录' }}
              </a-space>
              <template #overlay>
                <a-menu class="user-menu">
                  <!-- 纯展示区 -->
                  <a-menu-item disabled style="cursor: default;">
                    <div class="info">
                      <div class="label">账户名称</div>
                      <div class="value">{{ loginUserStore.loginUser.userAccount }}</div>
                    </div>
                    <div class="info">
                      <div class="label">账户角色</div>
                      <div class="value">{{ loginUserStore.loginUser.userRole }}</div>
                    </div>
                  </a-menu-item>

                  <a-menu-divider />

                  <!-- 操作区 -->
                  <a-menu-item key="logout" @click="handleLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" @click="handleLoginClick">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue';
import { HomeOutlined, AppstoreOutlined, UserOutlined, PlusOutlined, InboxOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { useRouter } from 'vue-router'
import { useUserLoginUserStore } from '@/stores/userLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
const loginUserStore = useUserLoginUserStore();

// 原始菜单项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },
  {
    key: '/admin/userManage',
    icon: () => h(UserOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/add-picture',
    icon: () => h(PlusOutlined),
    label: '添加图片',
    title: '添加图片',
  },
  {
    key: '/admin/pictureManage',
    icon: () => h(InboxOutlined),
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/about',
    icon: () => h(AppstoreOutlined),
    label: '关于',
    title: '关于',
  },
]
// 菜单项
const items = ref<MenuProps['items']>(originItems);
const router = useRouter()
// 点击菜单
const doMenuClick = ({ key }: { key: string }) => {
  // current.value = [key];
  console.log(key);

  router.push(key)
}

// 当前选中项
const current = ref<string[]>([]);

// 路由变化后，更新当前选中项
router.afterEach((to, from) => {
  current.value = [to.path];
})
//退回登录页
const handleLogout = async () => {
  // 调用退出登录接口
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    message.success('退出登录成功')
    loginUserStore.setLoginUser({
      id: null,
      userName: '未登录',
      userAvatar: '',
    })
    router.push({
      path: '/user/login',
      replace: true,// 登录成功后，替换当前路由，避免用户点击返回按钮后，返回登录页
    })
  } else {
    message.error('退出登录失败')
  }

}
// 登录点击事件
const handleLoginClick = () => {
  router.push({
    path: '/user/login',
    replace: true,// 登录成功后，替换当前路由，避免用户点击返回按钮后，返回登录页
  })
}
</script>
<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 25px;
  /* width: 32px; */
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}
</style>
