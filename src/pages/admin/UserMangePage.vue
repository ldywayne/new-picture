<template>
  <div id="UserMangePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch" style="margin-bottom: 16px">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="doReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data-source="dataList"
      :scroll="{ x: 1200, y: 400 }"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-avatar :src="record.userAvatar" />
        </template>
        <template v-if="column.dataIndex === 'userRole'">
          <a-tag :color="record.userRole === 'admin' ? 'volcano' : 'green'">
            {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="primary" @click="doEdit(record)" style="margin-right: 16px"
            >编辑</a-button
          >
          <a-button danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
    <!-- 编辑用户弹窗 -->
    <a-modal
      title="编辑用户"
      :open.sync="visible"
      :footer="null"
      width="400px"
      :closable="true"
      @cancel="visible = false"
    >
      <div>
        <a-form name="editUserForm" layout="vertical" :model="editUserForm" @finish="doSave">
          <a-form-item label="用户名" name="userName">
            <a-input v-model:value="editUserForm.userName" placeholder="输入用户名" />
          </a-form-item>
          <a-form-item label="用户角色" name="userRole">
            <a-select v-model:value="editUserForm.userRole" placeholder="选择用户角色">
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="user">普通用户</a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item label="密码" name="userPassword">
            <a-input v-model:value="editUserForm.userPassword" placeholder="输入密码" />
          </a-form-item> -->
          <a-form-item>
            <div class="buttons">
              <a-button type="primary" html-type="submit">保存</a-button>
              <a-button @click="visible = false">取消</a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { reactive, ref, onMounted, computed } from 'vue'
import {
  listUserVoByPageUsingPost,
  deleteUserUsingPost,
  updateUserUsingPost,
} from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
const loginUserStore = useLoginUserStore()

// 编辑用户弹窗可见性
const visible = ref(false)
// 编辑用户表单数据
const editUserForm = reactive({
  userName: '',
  userRole: '',
  id: '',
  // userPassword: '',
})
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 120,
    align: 'center',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 80,
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 80,
    align: 'center',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 80,
    align: 'center',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 100,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
    align: 'center',
    customRender: ({ record }: { record: any }) => {
      return dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 120,
    align: 'center',
    customRender: ({ record }: { record: any }) => {
      return dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 110,
    fixed: 'right',
    align: 'center',
  },
]
// 定义数据列表和总数
const dataList = ref<any>([])
const total = ref(0)
//搜索参数
const searchParams = reactive({
  current: 1,
  pageSize: 10,
  userAccount: '',
  userName: '',
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据列表
const fetchDataList = async () => {
  console.log('999999999', searchParams)
  // Proxy {current: 1, pageSize: 10}   ← 带壳子

  console.log('123789979', { ...searchParams })
  // { current: 1, pageSize: 10 }      ← 纯对象
  //调用接口获取数据列表
  const res = await listUserVoByPageUsingPost({
    ...searchParams, //...searchParams 就是“脱壳”——把 reactive 代理对象变成普通字面量对象，再交给接口，干净、安全、无冗余。
  })
  if (res.data.code === 0 && res.data.data) {
    console.log('5555555', res.data.data.records)

    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) || 0
  } else {
    message.error('获取数据失败' + (res.data.message || ''))
  }
}

// 删除用户
// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchDataList()
  } else {
    message.error('删除失败')
  }
}
// 编辑用户
const doEdit = (record: any) => {
  // message.info('编辑用户，ID：' + record.id)
  // 填充表单数据
  editUserForm.userName = record.userName
  editUserForm.userRole = record.userRole
  // 填充表单数据
  editUserForm.id = record.id

  // editUserForm.userPassword = record.userPassword
  // 显示弹窗
  visible.value = true
}
// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number) => `共 ${total} 条`,
  }
})
//切换页码或页大小
const onTableChange = (pag: any) => {
  searchParams.current = pag?.current ?? 1
  searchParams.pageSize = pag?.pageSize ?? searchParams.pageSize
  fetchDataList()
}
// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchDataList()
}
// 重置
const doReset = () => {
  searchParams.userAccount = ''
  searchParams.userName = ''
  doSearch()
}
// 保存编辑用户
const doSave = async () => {
  // 调用接口保存用户信息
  // 这里假设有一个 updateUserUsingPost 接口
  const res = await updateUserUsingPost({
    ...editUserForm,
    // id: editUserForm.id,
  })
  if (res.data.code === 0) {
    message.success('用户信息更新成功')
    visible.value = false
    // 刷新数据列表
    fetchDataList()
    // 更新pinia状态
    // loginUserStore.setLoginUser({
    //   ...loginUserStore.loginUser,// 保留其他字段不变不然会出现登录掉了的情况但实际上没掉，只是把整对象直接覆盖了
    //   userName: editUserForm.userName,
    //   userRole: editUserForm.userRole,
    // })
    await loginUserStore.fetchLoginUser()
  } else {
    message.error('用户信息更新失败' + (res.data.message || ''))
  }
}
// 组件挂载时，获取数据列表
onMounted(() => {
  fetchDataList()
})
</script>

<style scoped>
#UserMangePage {
}
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
