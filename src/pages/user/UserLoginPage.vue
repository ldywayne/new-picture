<template>
  <div id="userLoginPage">
    <h2 class="title">用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码!' },
          { min: 8, message: '密码长度不能小于8位!' },
        ]"
      >
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

/**
 * 默认跳转首页
 */
const DEFAULT_REDIRECT_PATH = '/'

/**
 * 规范化 redirect 参数
 * @param redirect 可能是 string | string[] | undefined
 */
const normalizeRedirectParam = (redirect: unknown): string | undefined => {
  const value = Array.isArray(redirect) ? redirect[0] : redirect
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * 获取安全的重定向地址
 * 防止开放重定向漏洞，只允许站内跳转
 */
const getSafeRedirectPath = (redirect: unknown): string => {
  const normalized = normalizeRedirectParam(redirect)
  if (!normalized) return DEFAULT_REDIRECT_PATH

  // 情况1：以 / 开头的站内路径
  if (normalized.startsWith('/')) {
    return normalized
  }

  // 情况2：完整 URL，需校验是否同源
  try {
    const url = new URL(normalized)
    if (url.origin !== window.location.origin) {
      return DEFAULT_REDIRECT_PATH
    }
    // 同源地址只取 pathname + search + hash
    const path = url.pathname || '/'
    return `${path}${url.search}${url.hash}`
  } catch {
    // 解析异常，回退到首页
    return DEFAULT_REDIRECT_PATH
  }
}

// 提交登录表单：成功后根据 redirect 参数进行安全重定向
const handleSubmit = async (values: FormState) => {
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      // 登录成功后，刷新登录用户信息
      await userLoginUserStore.fetchLoginUser()
      message.success('登录成功')

      // 计算安全的跳转地址
      const redirectQuery = route.query.redirect
      const role = userLoginUserStore.loginUser?.userRole
      const isAdmin = role === 'admin'

      let targetPath = getSafeRedirectPath(redirectQuery)

      // 权限兜底：非管理员如果尝试跳转到 /admin，强制回首页
      if (!isAdmin && targetPath.startsWith('/admin')) {
        targetPath = DEFAULT_REDIRECT_PATH
      }

      // 执行跳转
      router.replace(targetPath)
    } else {
      message.error('登录失败' + (res.data.message || ''))
    }
  } catch (e: unknown) {
    message.error('登录失败' + (e instanceof Error ? e.message : ''))
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
