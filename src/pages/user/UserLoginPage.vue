<template>
  <div id="userLoginPage">
    <h2 class="title">用户登录</h2>
    <div class="desc">
      企业级智能协同云图库
    </div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item name="userPassword" :rules="[
        { required: true, message: '请输入密码!' },
        { min: 8, message: '密码长度不能小于8位!' },
      ]">
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <div class="tips">
        没有账号？
        <router-link to="/user/register">去注册</router-link>
      </div>
      <a-form-item>
        <a-button type="primary" style="width: 100%" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
id
<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserLoginUserStore } from '@/stores/userLoginUserStore'
import { userLoginUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'

const router = useRouter()
// 登录用户状态管理
const userLoginUserStore = useUserLoginUserStore()

interface FormState {
  userAccount: string
  userPassword: string

}

const formState = reactive<FormState>({
  userAccount: '',
  userPassword: '',
})
const handleSubmit = async (values: any) => {
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      // 登录成功后，刷新登录用户信息
      await userLoginUserStore.fetchLoginUser()
      message.success('登录成功')
      router.push({
        path: '/',
        replace: true,// 登录成功后，替换当前路由，避免用户点击返回按钮后，返回登录页
      })
    } else {
      message.error('登录失败' + (res.data.message || ''))
    }
  } catch (e: any) {
    message.error('登录失败' + (e.message || ''))
  }
  // 登录

}

</script>
<style scoped>
#userLoginPage {
  margin: 0 auto;
  max-width: 360px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.desc {
  text-align: center;
  /* font-size: 14px; */
  color: #999;
  margin-bottom: 20px;
}

.tips {
  text-align: right;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}
</style>
