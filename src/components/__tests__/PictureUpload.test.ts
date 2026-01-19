import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PictureUpload from '@/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

// Mock 外部依赖
vi.mock('ant-design-vue', async () => {
  const actual = await vi.importActual('ant-design-vue')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  }
})

vi.mock('@/api/pictureController', () => ({
  uploadPictureUsingPost: vi.fn(),
}))

// Mock Ant Design Vue 组件
// 这里我们需要模拟 a-upload 的行为，特别是它的 props 调用
const AUploadStub = {
  name: 'AUpload',
  props: ['beforeUpload', 'customRequest'],
  template: `
    <div class="ant-upload-stub">
      <slot />
    </div>
  `,
  // 暴露方法供测试调用
  methods: {
    triggerBeforeUpload(file: File) {
      return this.beforeUpload ? this.beforeUpload(file) : true
    },
    triggerCustomRequest(options: any) {
      return this.customRequest ? this.customRequest(options) : Promise.resolve()
    },
  },
}

// 注册全局组件 stub
const globalOptions = {
  stubs: {
    'a-upload': AUploadStub,
    'loading-outlined': true,
    'plus-outlined': true,
  },
}

describe('PictureUpload.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始状态渲染上传按钮', () => {
    const wrapper = mount(PictureUpload, { global: globalOptions })
    expect(wrapper.find('.ant-upload-text').text()).toBe('点击或拖拽图片上传')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('传入 picture 属性时渲染图片', () => {
    const wrapper = mount(PictureUpload, {
      props: {
        picture: { url: 'https://example.com/test.jpg', id: 1 },
      },
      global: globalOptions,
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/test.jpg')
  })

  describe('beforeUpload 校验', () => {
    it('拦截非图片类型文件', async () => {
      const wrapper = mount(PictureUpload, { global: globalOptions })
      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })

      const file = new File([''], 'test.txt', { type: 'text/plain' })
      // @ts-ignore - 调用 stub 组件的方法
      const result = uploadComponent.vm.triggerBeforeUpload(file)

      expect(result).toBe(false)
      expect(message.error).toHaveBeenCalledWith('You can only upload JPG file!')
    })

    it('拦截过大的文件 (>2MB)', async () => {
      const wrapper = mount(PictureUpload, { global: globalOptions })
      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })

      // 模拟 3MB 文件
      const file = {
        size: 3 * 1024 * 1024,
        type: 'image/jpeg',
      } as unknown as File

      // @ts-ignore
      const result = uploadComponent.vm.triggerBeforeUpload(file)

      expect(result).toBe(false)
      expect(message.error).toHaveBeenCalledWith('Image must smaller than 2MB!')
    })

    it('允许合法文件通过', async () => {
      const wrapper = mount(PictureUpload, { global: globalOptions })
      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })

      const file = {
        size: 1 * 1024 * 1024,
        type: 'image/png',
      } as unknown as File

      // @ts-ignore
      const result = uploadComponent.vm.triggerBeforeUpload(file)

      expect(result).toBe(true)
      expect(message.error).not.toHaveBeenCalled()
    })
  })

  describe('handleUpload 上传逻辑', () => {
    it('上传成功应调用 API 并触发 onSuccess', async () => {
      const onSuccessSpy = vi.fn()
      const mockResponse = { data: { code: 0, data: { id: 123, url: 'new.jpg' } } }
      // @ts-ignore
      uploadPictureUsingPost.mockResolvedValue(mockResponse)

      const wrapper = mount(PictureUpload, {
        props: { onSuccess: onSuccessSpy },
        global: globalOptions,
      })

      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      // @ts-ignore - 触发自定义上传
      await uploadComponent.vm.triggerCustomRequest({ file })
      await flushPromises() // 等待异步操作完成

      // 验证 loading 状态（由于是瞬时的，这里主要验证最终状态）
      // 如果要验证 loading=true 的中间状态，需要更精细的控制 Promise resolve 时机

      expect(uploadPictureUsingPost).toHaveBeenCalledWith({}, {}, file)
      expect(message.success).toHaveBeenCalledWith('上传成功')
      expect(onSuccessSpy).toHaveBeenCalledWith(mockResponse.data.data)
    })

    it('更新已有图片时应携带 id 参数', async () => {
      const mockPicture = { id: 999, url: 'old.jpg' }
      // @ts-ignore
      uploadPictureUsingPost.mockResolvedValue({ data: { code: 0, data: {} } })

      const wrapper = mount(PictureUpload, {
        props: { picture: mockPicture },
        global: globalOptions,
      })

      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })
      const file = new File([''], 'update.jpg')

      // @ts-ignore
      await uploadComponent.vm.triggerCustomRequest({ file })

      expect(uploadPictureUsingPost).toHaveBeenCalledWith({ id: 999 }, {}, file)
    })

    it('上传失败应提示错误信息', async () => {
      // @ts-ignore
      uploadPictureUsingPost.mockResolvedValue({
        data: { code: 500, message: 'Server Error' },
      })

      const wrapper = mount(PictureUpload, { global: globalOptions })
      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })

      // @ts-ignore
      await uploadComponent.vm.triggerCustomRequest({ file: new File([''], 'f.jpg') })
      await flushPromises()

      expect(message.error).toHaveBeenCalledWith('Server Error')
      expect(message.success).not.toHaveBeenCalled()
    })

    it('网络异常应提示默认错误', async () => {
      // @ts-ignore
      uploadPictureUsingPost.mockResolvedValue({
        data: { code: 500, message: null },
      })

      const wrapper = mount(PictureUpload, { global: globalOptions })
      const uploadComponent = wrapper.findComponent({ name: 'AUpload' })

      // @ts-ignore
      await uploadComponent.vm.triggerCustomRequest({ file: new File([''], 'f.jpg') })
      await flushPromises()

      expect(message.error).toHaveBeenCalledWith('上传失败，请重试')
    })
  })
})
