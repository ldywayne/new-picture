<template>
  <div id="userInfo">
    <a-layout style="min-height: 80vh; background: none">
      <a-layout-header class="header">
        <div class="header-content">
          <a-avatar
            class="avatar"
            :size="90"
            style="margin-right: 16px"
            icon="user"
            :src="loginUserStore.loginUser.userAvatar"
          />
          <div class="user-info">
            <span class="title">{{ loginUserStore.loginUser?.userName }}</span>
            <span class="description">{{ loginUserStore.loginUser?.userProfile || '暂无' }}</span>
            <div class="tag-container">
              <a-tag class="tag" color="blue">{{
                loginUserStore.loginUser?.userRole === 'admin' ? '管理员' : '普通用户'
              }}</a-tag>
              <!-- <a-tag class="tag" color="blue">管理员</a-tag> -->
            </div>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <!-- 栅格：左右两栏 -->
        <a-row :gutter="24">
          <!-- 右侧：基本信息卡片 -->
          <a-col :xs="24">
            <div class="baseInfo">
              <h2>个人信息</h2>
              <a-button type="link" @click="handleUpdate"> <FormOutlined />更新信息 </a-button>
            </div>

            <a-form
              v-if="updateMode === false"
              :labelCol="{ span: 5 }"
              :wrapperCol="{ span: 19 }"
              labelAlign="left"
            >
              <a-form-item label="用户ID"> {{ loginUserStore.loginUser?.id }}</a-form-item>
              <a-form-item label="账户"> {{ loginUserStore.loginUser?.userAccount }}</a-form-item>
              <a-form-item label="用户名"> {{ loginUserStore.loginUser?.userName }}</a-form-item>
              <a-form-item label="简介">
                {{ loginUserStore.loginUser?.userProfile || '暂无' }}</a-form-item
              >
              <a-form-item label="创建时间">
                {{
                  dayjs(loginUserStore.loginUser?.createTime).format('YYYY-MM-DD HH:mm:ss')
                }}</a-form-item
              >
              <!-- <a-form-item label="VIP"> {{
                loginUserStore.loginUser?.vipCode || '无'
              }}</a-form-item> -->
            </a-form>
            <a-form
              v-if="updateMode === true"
              :labelCol="{ span: 5 }"
              :wrapperCol="{ span: 10 }"
              labelAlign="left"
            >
              <a-form-item label="用户ID">
                <a-input :value="loginUserStore.loginUser?.id" disabled
              /></a-form-item>
              <a-form-item label="账户">
                <a-input :value="loginUserStore.loginUser?.userAccount" disabled
              /></a-form-item>
              <a-form-item label="用户名">
                <a-input v-model:value="editForm.userName"
              /></a-form-item>
              <a-form-item label="简介">
                <a-input v-model:value="editForm.userProfile"
              /></a-form-item>

              <!-- <a-form-item label="VIP"> {{
                loginUserStore.loginUser?.vipCode || '无'
              }}</a-form-item> -->
              <a-form-item :wrapperCol="{ span: 19, offset: 5 }">
                <a-space>
                  <a-button type="primary" @click="handleSave">保存</a-button>
                  <a-button @click="handleCancel">取消</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-col>
        </a-row>
      </a-layout-content>
      <!-- <a-layout-footer>Footer</a-layout-footer> -->
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { FormOutlined } from '@ant-design/icons-vue'
import { updateUserUsingPost } from '@/api/userController'

const loginUserStore = useLoginUserStore()
//定义设置模式
const updateMode = ref(false)

// 编辑模式的临时表单数据
const editForm = ref({
  userName: '',
  userProfile: '',
})

// 切换到编辑模式
const handleUpdate = () => {
  // 初始化编辑表单的值
  if (loginUserStore.loginUser) {
    editForm.value.userName = loginUserStore.loginUser.userName || ''
    editForm.value.userProfile = loginUserStore.loginUser.userProfile || ''
  }
  updateMode.value = true
}

// 保存修改
const handleSave = async () => {
  try {
    //安全处理：检查用户是否登录
    if (!loginUserStore.loginUser) {
      message.error('用户未登录，无法更新信息')
      return
    }
    // 调用更新接口
    const res = await updateUserUsingPost({
      id: loginUserStore.loginUser.id,
      userName: editForm.value.userName,
      userProfile: editForm.value.userProfile,
    })
    if (res.data.code === 0) {
      message.success('更新成功')
      // 刷新用户信息
      await loginUserStore.fetchLoginUser()
      updateMode.value = false
    } else {
      message.error('更新失败：' + (res.data.message || ''))
    }
  } catch (error) {
    message.error('更新失败：' + (error as Error).message)
  }
}

// 取消编辑
const handleCancel = () => {
  updateMode.value = false
  // 清空编辑表单
  editForm.value = {
    userName: '',
    userProfile: '',
  }
}
</script>
<style scoped>
#userInfo {
  margin: 0 auto;
  max-width: 1200px;
}

#userInfo .header {
  background: white;
  margin-bottom: 12px;
  border-radius: 6px;
  height: 160px;
}

#userInfo .content {
  background: white;
  padding: 20px;
  border-radius: 6px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.title {
  font-size: 24px;
  font-weight: bold;
  /* margin-bottom: 60px; */
  margin-left: 30px;
  display: inline-block;
  /* 或 block */
  line-height: 1;
  padding: 0;
}

.description {
  font-size: 14px;
  color: #666;
  margin-left: 30px;
  display: inline-block;
  /* 或 block */
  line-height: 1;
  padding: 0;
  /* height: 30px; */
  /* margin-bottom: 60px; */
}

.tag-container {
  line-height: 1;
}

.tag {
  /* display: inline-block; */
  margin-left: 30px;
}

.user-info {
  display: flex;
  /* 弹性布局 */
  flex-direction: column;
  /* 主轴垂直 → 上下排 */
  gap: 18px;
  /* 两行间距，可自己调 */
  margin-bottom: 5px;
}

.baseInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
