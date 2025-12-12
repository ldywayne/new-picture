<template>
  <div class="homePage">
    <!-- 搜索框 -->
    <div class="search-box">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="onSearch"
      />
    </div>
    <a-tabs
      v-model:activeKey="selectedCategory"
      @change="onSearch"
      style="margin-left: 16px; margin-right: 16px"
    >
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane :key="category" v-for="category in categoryList" :tab="category" />
    </a-tabs>
    <div class="tag-box">
      <span style="margin-right: 8px">分类：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTags[index]"
          @change="onSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片object-fit: coverobject-fit: cover 是让图片 填满容器不变形，哪怕被裁剪——非常适合做头像、缩略图、卡片封面等。 -->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">{{ picture.category }}</a-tag>
                  <a-tag color="blue" v-for="tag in picture.tags">{{ tag }}</a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<script lang="ts" setup>
import { reactive, onMounted, ref, computed, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
// 搜索参数
const searchParams = reactive<any>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
  category: '',
  tags: [],
})
// 定义数据列表和总数
const dataList = ref<any>([])
const total = ref(0)
// 加载状态
const loading = ref(false)

// 获取数据列表
const fetchDataList = async () => {
  loading.value = true
  //添加分类和标签参数
  const params = {
    ...searchParams, //...searchParams 就是“脱壳”——把 reactive 代理对象变成普通字面量对象，再交给接口，干净、安全、无冗余。
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTags.value.forEach((useTag: boolean, index: number) => {
    if (useTag) {
      ;(params.tags as string[]).push(tagList.value[index])
    }
  })

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    console.log('5555555', res.data.data.records)

    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) || 0
  } else {
    message.error('获取数据失败' + (res.data.message || ''))
  }
  loading.value = false
}
//分页
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    // showSizeChanger: true,
    // pageSizeOptions: ['10', '20', '50'],
    // showTotal: (total: number) => `共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchDataList()
    },
  }
})
// 搜索
const onSearch = () => {
  searchParams.current = 1
  fetchDataList()
}
// 监听输入框变化（包括清空）
watch(
  () => searchParams.searchText,
  (newVal) => {
    if (newVal === '') {
      onSearch() // 只有清空时才触发
    }
  },
)

//获取图片分类列表和标签列表
const categoryList = ref<any[]>([])
const tagList = ref<any[]>([])
const selectedCategory = ref<any>('all')
const selectedTags = ref<any>([])
//获取图片分类和标签的函数
const getTagCategoryList = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList as any[]
    tagList.value = res.data.data.tagList as any[]
  }
}
// 路由实例
const router = useRouter()

// 点击图片跳转详情页
const doClickPicture = (picture: any) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}
// 页面加载时获取数据
onMounted(() => {
  fetchDataList()
  getTagCategoryList()
})
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
