<template>
  <div id="addPicturePage">
    <h2 v-if="!route.query?.id">创建图片</h2>
    <h2 v-else>编辑图片</h2>
    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType"
      >>
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :onSuccess="handleSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <UrlPictureUpload :picture="picture" :onSuccess="handleSuccess" />
      </a-tab-pane>
    </a-tabs>

    <!-- <PictureUpload :picture="picture" :onSuccess="handleSuccess" />
    <UrlPictureUpload :picture="picture" :onSuccess="handleSuccess" /> -->

    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="doSearch"
      style="margin-bottom: 16px"
    >
      <a-form-item label="图片名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="输入图片名称" />
      </a-form-item>
      <a-form-item label="图片简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          :auto-size="{ minRows: 2, maxRows: 4 }"
          placeholder="输入图片简介"
        />
      </a-form-item>
      <a-form-item label="图片分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="输入图片分类"
          :options="categoryOptions"
        />
      </a-form-item>
      <a-form-item label="图片标签" name="tags">
        <a-select
          mode="tags"
          v-model:value="pictureForm.tags"
          placeholder="输入图片标签"
          :options="tagOptions"
        />
      </a-form-item>
      <a-form-item>
        <div class="buttons">
          <a-button style="width: 100%" type="primary" html-type="submit">{{
            route.query?.id ? '编辑' : '创建'
          }}</a-button>
          <a-button v-if="!route.query?.id" style="width: 100%; margin-top: 16px" @click="doReset"
            >重置</a-button
          >
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  listPictureTagCategoryUsingGet,
  getPictureVoByIdUsingGet,
} from '@/api/pictureController'
import { useRouter, useRoute } from 'vue-router'
// 定义上传方式
const uploadType = ref<string>('file')

const router = useRouter()

// 定义图片对象
const picture = ref<any>(null)
// 定义上传成功后的回调函数
const handleSuccess = (newPicture: any) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const pictureForm = reactive({
  name: '',
  introduction: '',
  category: '',
  tags: [] as string[],
})
const doSearch = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    message.error('请先上传图片')
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    if (route.query?.id) {
      message.success('图片信息编辑成功')
    } else {
      message.success('图片信息创建成功')
    }
    //创建成功后跳转图片详情页
    router.push({
      path: `/picture-detail/${pictureId}`,
    })
  } else {
    message.error(res.data.message || '图片信息创建失败，请重试')
  }
}
// 重置
const doReset = () => {
  pictureForm.name = ''
  pictureForm.introduction = ''
  pictureForm.category = ''
  pictureForm.tags = []
  picture.value = null
}
//获取图片分类列表和标签列表
const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])
//获取图片分类和标签的函数
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryOptions.value = (res.data.data.categoryList as any[]).map((item: any) => ({
      label: item.name,
      value: item,
    }))
    tagOptions.value = (res.data.data.tagList as any[]).map((item: any) => ({
      label: item.name,
      value: item,
    }))
  }
}
// 页面加载时获取分类和标签选项
onMounted(() => {
  getTagCategoryOptions()
})
//获取老数据
const route = useRoute()
const getOldPicture = async () => {
  //获取图片id
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name ?? ''
      pictureForm.introduction = data.introduction ?? ''
      pictureForm.category = data.category ?? ''
      pictureForm.tags = data.tags ?? []
    }
  }
}
// 页面加载时获取老数据
onMounted(() => {
  getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
  width: 720px;
  margin: 0 auto;
}
.buttons {
  /* margin-top: 16px; */
  display: flex;
  flex-direction: column;
  /* width: 100%; */
}
</style>
