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
import { useRouter, useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { userLoginUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'

// 路由工具：
// - router 用于导航跳转
// - route 读取当前地址上的 query 参数（例如登录页上的 redirect）
const router = useRouter()
const route = useRoute()
// 登录用户状态管理
const userLoginUserStore = useLoginUserStore()

interface FormState {
  userAccount: string
  userPassword: string

}

const formState = reactive<FormState>({
  userAccount: '',
  userPassword: '',
})
// 提交登录表单：成功后根据 redirect 参数进行安全重定向
const handleSubmit = async (values: any) => {
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      // 登录成功后，刷新登录用户信息
      await userLoginUserStore.fetchLoginUser()
      message.success('登录成功')
      // 从登录页 URL 上读取来源地址，例如 /user/login?redirect=/admin/userManage
      const redirectParam = route.query.redirect as string | undefined
      // 当前登录用户角色，用于限制非管理员跳转到 /admin
      const role = userLoginUserStore.loginUser?.userRole
      if (redirectParam) {
        try {
          // 情况1：站内相对路径，例如 "/", "/about", "/admin/userManage"
          if (redirectParam.startsWith('/')) {
            if (redirectParam.startsWith('/admin') && role !== 'admin') {
              // 非管理员不允许回跳到后台，降级到首页
              router.replace('/')
            } else {
              // 使用 replace，避免返回历史栈时又回到登录页
              router.replace(redirectParam)
            }
          } else {
            // 情况2：完整 URL（可能来自拦截器注入），需校验同源以防跳转到外站
            const url = new URL(redirectParam)
            if (url.origin === window.location.origin) {
              if (url.pathname.startsWith('/admin') && role !== 'admin') {
                router.replace('/')
              } else {
                // 同源完整 URL，直接以 location 刷新到目标地址
                window.location.href = redirectParam
              }
            } else {
              // 非同源地址，安全起见不跳转，回到首页
              router.replace('/')
            }
          }
        } catch {
          // 参数异常（无法解析为 URL 等），统一回到首页
          router.replace('/')
        }
      } else {
        // 无 redirect 参数，默认回到首页
        router.replace('/')
      }
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
