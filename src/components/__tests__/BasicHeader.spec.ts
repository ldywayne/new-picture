import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BasicHeader from '../BasicHeader.vue'
import { useLoginUserStore } from '@/stores/userLoginUserStore'

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/user/login', component: { template: '<div />' } },
      { path: '/user/info', component: { template: '<div />' } },
      { path: '/admin/userManage', component: { template: '<div />' } },
      { path: '/admin/pictureManage', component: { template: '<div />' } },
      { path: '/add-picture', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
    ],
  })

const mountBasicHeader = async (options?: { userRole?: string; withUserId?: boolean }) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const wrapper = mount(BasicHeader, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'a-row': { template: '<div><slot /></div>' },
        'a-col': { template: '<div><slot /></div>' },
        'a-menu': { template: '<ul></ul>' },
        'a-dropdown': { template: '<div><slot /><slot name="overlay" /></div>' },
        'a-space': { template: '<div><slot /></div>' },
        'a-avatar': { template: '<div></div>' },
        'a-button': { template: '<button><slot /></button>' },
        'a-menu-item': { template: '<div><slot /></div>' },
        'a-menu-divider': { template: '<hr />' },
        LogoutOutlined: { template: '<span></span>' },
        ProfileOutlined: { template: '<span></span>' },
        HomeOutlined: { template: '<span></span>' },
        AppstoreOutlined: { template: '<span></span>' },
        UserOutlined: { template: '<span></span>' },
        PlusOutlined: { template: '<span></span>' },
        InboxOutlined: { template: '<span></span>' },
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })

  const store = useLoginUserStore()

  if (options?.userRole) {
    store.setLoginUser({
      id: options.withUserId === false ? null : 1,
      userName: 'test-user',
      userAvatar: '',
      userRole: options.userRole,
    })
    await wrapper.vm.$nextTick()
  }

  return { wrapper, router, store }
}

describe('BasicHeader', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('非管理员用户不展示后台菜单', async () => {
    const { wrapper } = await mountBasicHeader()
    const items = (wrapper.vm as any).items as any[]
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
    const hasAdmin = items.some(
      (item) => typeof item?.key === 'string' && item.key.startsWith('/admin'),
    )
    expect(hasAdmin).toBe(false)
  })

  it('管理员用户展示后台菜单', async () => {
    const { wrapper } = await mountBasicHeader({ userRole: 'admin' })
    const items = (wrapper.vm as any).items as any[]
    const hasAdmin = items.some(
      (item) => typeof item?.key === 'string' && item.key.startsWith('/admin'),
    )
    expect(hasAdmin).toBe(true)
  })

  it('未登录时显示登录按钮', async () => {
    const { wrapper } = await mountBasicHeader({ userRole: '', withUserId: false })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('登录')
  })

  it('点击登录按钮时跳转到登录页并带上 redirect', async () => {
    const { wrapper, router } = await mountBasicHeader({ userRole: '', withUserId: false })
    const pushSpy = vi.spyOn(router, 'push')
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(pushSpy).toHaveBeenCalledTimes(1)
    const arg = pushSpy.mock.calls[0][0] as any
    expect(arg.path).toBe('/user/login')
    expect(arg.query).toBeDefined()
    expect(arg.query.redirect).toBeTruthy()
    expect(arg.replace).toBe(true)
  })
})

