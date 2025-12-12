<template>
  <div id="PictureMangePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch" style="margin-bottom: 16px">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="searchParams.searchText" placeholder="输入关键词" />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.category" placeholder="输入图片类型" />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
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
      :scroll="{ x: 1900, y: 400 }"
      :pagination="pagination"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-avatar :src="record.url" />
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-tag
            v-for="tag in JSON.parse(record.tags || '[]')"
            :key="tag"
            style="margin-right: 4px"
          >
            {{ tag }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{
            record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '未知时间'
          }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ record.editTime ? dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') : '未知时间' }}
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>图片格式：{{ record.picFormat }}</div>
          <div>图片宽度：{{ record.picWidth }}</div>
          <div>图片高度：{{ record.picHeight }}</div>
          <div>图片宽高比：{{ record.picScale }}</div>
          <div>图片大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            :href="`/add-picture/?id=${record.id}`"
            target="_blank"
            style="margin-right: 16px"
            >编辑</a-button
          >
          <a-button danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { reactive, ref, onMounted, computed } from 'vue'
import {
  listPictureByPageUsingPost,
  deletePictureUsingPost,
  updatePictureUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
const loginUserStore = useLoginUserStore()

// 编辑图片弹窗可见性
const visible = ref(false)
// 编辑图片表单数据
const editPictureForm = reactive({
  pictureName: '',
  pictureRole: '',
  id: '',
  // picturePassword: '',
})
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 160,
    align: 'center',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 80,
    align: 'center',
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 180,
    align: 'center',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
    width: 160,
    align: 'center',
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 120,
    align: 'center',
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 120,
    align: 'center',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 160,
    // align: 'center',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    width: 180,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    align: 'center',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 180,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
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
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
  category: '',
  tags: [],
  //pictureName: '',
})
// 获取数据列表
const fetchDataList = async () => {
  console.log('999999999', searchParams)
  // Proxy {current: 1, pageSize: 10}   ← 带壳子

  console.log('123789979', { ...searchParams })
  // { current: 1, pageSize: 10 }      ← 纯对象
  //调用接口获取数据列表
  const res = await listPictureByPageUsingPost({
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

// 删除图片
// 删除数据
const doDelete = async (id: any) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchDataList()
  } else {
    message.error('删除失败')
  }
}
// 编辑图片
const doEdit = (record: any) => {
  // message.info('编辑图片，ID：' + record.id)
  // 填充表单数据
  editPictureForm.pictureName = record.pictureName
  editPictureForm.pictureRole = record.pictureRole
  // 填充表单数据
  editPictureForm.id = record.id

  // editPictureForm.picturePassword = record.picturePassword
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
  // searchParams.pictureAccount = ''
  // searchParams.pictureName = ''
  doSearch()
}

// 组件挂载时，获取数据列表
onMounted(() => {
  fetchDataList()
})
</script>

<style scoped>
#PictureMangePage {
}
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
