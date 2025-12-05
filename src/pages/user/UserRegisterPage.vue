<template>
  <div id="userRegisterPage">
    <h2 class="title">用户注册</h2>
    <div class="desc">
      企业级智能协同云图库
    </div>
    <a-form ref="formRef" :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item name="userPassword" :rules="[
        { required: true, message: '请输入密码!' },
        { min: 8, message: '密码长度不能小于8位!' },
      ]">
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item name="checkPassword" :rules="[
        // { required: true, message: '请再次输入密码!' },
        { min: 8, message: '密码长度不能小于8位!' },
        {
          validator: validatePass,
          trigger: 'change'
        }
      ]">
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入密码" />
      </a-form-item>
      <div class="tips">
        已经有账号？
        <router-link to="/user/login">去登录</router-link>
      </div>
      <a-form-item>
        <a-button type="primary" style="width: 100%" html-type="submit">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
id
<script lang="ts" setup>
import { reactive, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserLoginUserStore } from '@/stores/userLoginUserStore'
import { userRegisterUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()
// 登录用户状态管理
const userLoginUserStore = useUserLoginUserStore()

interface FormState {
  userAccount: string
  userPassword: string
  checkPassword: string
}

const formState = reactive<FormState>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})
// 校验两次输入密码是否一致
const validatePass = async (_rule: Rule, value: string) => {
  if (value === '') return Promise.reject('请再次输入密码')
  if (value !== formState.userPassword) return Promise.reject('两次输入密码不一致')
  return Promise.resolve()
}
// 表单实例
const formRef = ref<any>()
// 监听密码输入，校验确认密码
watch(
  () => formState.userPassword,
  () => formRef.value?.validateFields(['checkPassword'])
)

const handleSubmit = async (values: any) => {
  if (formState.userPassword !== formState.checkPassword) {
    message.error('两次输入密码不一致!')
    return
  }
  try {
    const res = await userRegisterUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功')
      // 注册成功后，跳转到登录页
      router.push({
        path: '/user/login',
      })
    } else {
      message.error('注册失败' + (res.data.message || ''))
    }
  } catch (e: any) {
    message.error('注册失败' + (e.message || ''))
  }
  // 注册

}

</script>
<style scoped>
#userRegisterPage {
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
