<template>
  <div class="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片详情">
          <a-image
            :src="picture?.url"
            :preview-src-list="[picture?.url]"
            style="max-height: 600px; object-fit: contain"
          />
        </a-card>
      </a-col>
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture?.user?.userAvatar" />
                <span>{{ picture?.user?.userName }}</span>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">{{ picture?.name || '未知' }}</a-descriptions-item>
            <a-descriptions-item label="简介">{{
              picture?.introduction || '未知'
            }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{
              picture?.category || '默认'
            }}</a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture?.tags" :key="tag">{{ tag }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">{{
              picture?.picFormat || '未知'
            }}</a-descriptions-item>
            <a-descriptions-item label="宽度">{{
              picture?.picWidth || '未知'
            }}</a-descriptions-item>
            <a-descriptions-item label="高度">{{
              picture?.picHeight || '未知'
            }}</a-descriptions-item>
            <a-descriptions-item label="宽高比">{{ picture?.picScale }}</a-descriptions-item>
            <a-descriptions-item label="大小">{{
              formatSize(picture?.picSize) || '未知'
            }}</a-descriptions-item>
          </a-descriptions>
          <!-- 操作按钮 -->
          <a-space wrap>
            <a-button type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button v-if="canEdit" type="default" @click="doEdit">
              编辑
              <template #icon>
                <EditOutlined />
              </template>
            </a-button>
            <a-button v-if="canEdit" danger @click="doDelete">
              删除
              <template #icon>
                <DeleteOutlined />
              </template>
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { reactive, onMounted, ref, computed, watch } from 'vue'
import { getPictureVoByIdUsingGet, deletePictureUsingPost } from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { formatSize, downloadImage } from '@/utils/index'
import { useLoginUserStore } from '@/stores/userLoginUserStore'

// 定义数据
const picture = ref<any>({})
const props = defineProps<{
  id: string | number
}>()
// 加载状态
const loading = ref(false)
const route = useRoute()
const getOldPicture = async () => {
  //获取图片id
  const id = route.query?.id
  console.log('898989', id, props.id)

  const res = await getPictureVoByIdUsingGet({ id: props.id })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data
    picture.value = data
  } else {
    message.error(res.data.message || '获取图片详情失败')
  }
}
// 页面加载时获取数据
onMounted(() => {
  getOldPicture()
})

// 编辑图片
const router = useRouter()

const doEdit = () => {
  router.push({
    path: '/add-picture',
    query: {
      id: props.id,
    },
  })
}
// 删除图片
const doDelete = () => {
  Modal.confirm({
    title: '确认删除吗？',
    okText: '确认',
    okType: 'danger',
    onOk: async () => {
      const res = await deletePictureUsingPost({ id: props.id })
      if (res.data.code === 0) {
        message.success('删除成功')
        router.push({
          path: '/',
        })
      } else {
        message.error(res.data.message || '删除失败')
      }
    },
  })
}
//获取权限
const loginUserStore = useLoginUserStore()

// 是否具有编辑权限
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 未登录不可编辑
  if (!loginUser.id) {
    return false
  }
  // 仅本人或管理员可编辑
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})
// 下载图片
// 处理下载
const doDownload = () => {
  downloadImage(picture.value.url)
}
</script>
<style scoped>
.homePage {
  margin-bottom: 20px;
}
.homePage .search-box {
  margin: 0 auto 16px;
  max-width: 480px;
}
.tag-box {
  margin-bottom: 20px;
  margin-left: 16px;
}
</style>
