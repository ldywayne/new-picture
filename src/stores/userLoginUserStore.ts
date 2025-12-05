import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'
// 登录用户状态管理
export const useUserLoginUserStore = defineStore('loginUser', () => {
  //初始化登录用户
  const loginUser = ref<any>({
    userName: '未登录',
  })
  //获取登录用户
  async function fetchLoginUser() {
    // 从后端获取登录用户信息
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
    // 模拟登录用户
    // 测试用户登录，3 秒后登录
    // setTimeout(() => {
    //   loginUser.value = { userName: '测试用户', id: 1 }
    // }, 3000)
  }
  //设置登录用户
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return {
    loginUser,
    fetchLoginUser,
    setLoginUser,
  }
})
