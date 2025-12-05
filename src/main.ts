// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
// 引入中文语言包
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import '@/access'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Antd)
app.config.globalProperties.$antLocale = zhCN
app.mount('#app')
