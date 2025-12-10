<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :custom-request="handleUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽图片上传</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
const loading = ref<boolean>(false)
const imageUrl = ref<string>('')
interface Props {
  picture?: any
  onSuccess?: (newPicture: any) => void
}
const props = defineProps<Props>()

// 上传前的文件类型和大小验证
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}
// 上传文件
const handleUpload = async ({ file }: { file: File }) => {
  loading.value = true
  const params = props.picture ? { id: props.picture.id } : {}
  const res = await uploadPictureUsingPost(params, {}, file)
  if (res.data.code === 0 && res.data.data) {
    message.success('上传成功')
    //将上传成功的信息传给父组件
    props.onSuccess?.(res.data.data)
  } else {
    message.error(res.data.message || '上传失败，请重试')
  }
  loading.value = false
}
</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
  /* border: 1px solid #999; */
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
