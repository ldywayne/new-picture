import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'
// 登录用户状态管理
export const useLoginUserStore = defineStore('loginUser', () => {
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
  /**
   * 设置登录用户
   * @param newLoginUser 新的登录用户对象
   * setLoginUser 是“手动把任意对象整个丢进内存，立刻让系统认为这就是当前登录人”——它绕过了后端校验，
   * 也绕过了登录流程，所以用错就会直接把真正的登录信息覆盖掉，看起来就像“登录状态掉了”。
   * 所以不要局部覆盖（不要只传 { userName: xxx }）要是一个完整的用户对象。
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return {
    loginUser,
    fetchLoginUser,
    setLoginUser,
  }
})
