<template>
  <div class="parent">
    <div class="item" :class="{ selected: route.path === '/' }" @click="navTo('/')">
      <div class="i-carbon:home"></div>
      <div>首页</div>
    </div>
    <div class="item" :class="{ selected: route.path === '/me' }" @click="navTo('/me')" v-if="userinfo.token">
      <div class="i-carbon:person"></div>
      <div class="">我的</div>
    </div>
    <div class="item" :class="{ selected: route.path === '/settings' }" @click="navTo('/settings')" v-if="userinfo.token">
      <div class="i-carbon:settings"></div>
      <div>设置</div>
    </div>

    <div class="item" @click="logout" v-if="userinfo.token">
      <div class="i-carbon:logout"></div>
      <div>登出</div>
    </div>
    <div class="item" :class="{ selected: route.path === '/login' }" @click="navTo('/login')" v-if="!userinfo.token">
      <div class="i-carbon:login"></div>
      <div>登录</div>
    </div>
    <div class="fr gap-2 items-center justify-center">
      <div class="i-carbon:moon hover:text-blue-7 cursor-pointer" @click="toggleTheme('dark')"
        v-if="themeModelVal.theme === 'day'"></div>
      <div class="i-carbon:sun text-blue-5 text-lg hover:text-yellow-4 cursor-pointer" @click="toggleTheme('day')"
        v-if="themeModelVal.theme === 'dark'"></div>
      <a class="i-carbon:logo-github text-lg hover:text-gray-7 dark:text-blue-5 dark:hover:text-yellow-4"
        target="_blank" href="https://github.com/kingwrcy/mblog-backend"></a>
    </div>
    <div class="flex justify-center text-xs text-gray-400 pb-1 hover-text-gray-700 cursor-pointer" v-if="version">
      <a :href="'https://github.com/kingwrcy/mblog-backend/releases/tag/v' + computedVersion" target="_blank"
        class="dark:text-white no-underline">
        v{{ computedVersion }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const themeModelVal = useLocalStorage('themeModel', { theme: 'day' })
const version = import.meta.env.VITE_MBLOG_VERSION
const computedVersion = computed(() => {
  if (version) {
    if (version.startsWith('v')) {
      return version.substring(1)
    } else {
      return version
    }
  }
  return ''
})
const router = useRouter()
const route = useRoute()
const navTo = (path: string) => {
  router.push(path)
  closeDrawerBus.emit()
}
const userinfo = useStorage('userinfo', { username: '', token: '' })
const toggleTheme = (theme: string) => {
  themeChangeBus.emit({ theme })
}
const logout = () => {
  userinfo.value = {} as any
  window.location.href = '/'
}
</script>

<style scoped lang="scss">
.parent {
  @apply fc p-2 gap-2 justify-end sticky top-0;

  .item {
    // color: #1a8cd8;
    // @apply cursor-pointer list-none fr gap-1 items-center hover:text-green-600 dark:text-gray-200 justify-center;
    @apply cursor-pointer list-none fr gap-1 items-center justify-center;
    // @apply hover: text-green-600;
    @apply dark:text-gray-200;
    @apply hover:text-green-600;
    letter-spacing: 3px;

    &.selected {
      // @apply bg-gray-500 dark:bg-blue-500 px-2 py-1 rd;
      @apply bg-gray-300 dark:bg-gray-700 px-2 py-1 rd;

      .dark {
        // background-color: #1a8cd8;
      }
    }
  }
}
</style>
