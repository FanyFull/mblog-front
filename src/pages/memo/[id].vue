<template>
  <div>
    <Memo :memo="memoData" :id="route.params.id[0]" v-if="memoData" />
    <template v-else>
      <div class="flex justify-center text-lg">需要登录才能访问</div>
      <div class="flex items-center justify-center mt-4">
        <n-button type="primary" class="px-6" @click="router.push('/')">去首页</n-button>
      </div>
    </template>
    <CommentInput :memo-id="memoData.id" v-if="memoData.enableComment === 1 && sessionStorage.OPEN_COMMENT" />

    <div
      class="text-sm my-4 bg-white dark:bg-gray-7 p-4 rd dark:text-white"
      v-if="commentResp.list && commentResp.list.length > 0"
    >
      评论列表
    </div>
    <Comment :comment="data" :index="index" v-for="(data, index) in commentResp.list" :key="data.id" />
  </div>
</template>

<script setup lang="ts">
import CommentInput from '@/components/CommentInput.vue'
import type { QueryCommentResponse } from '@/types/comment'
import type { MemoDTO } from '@/types/memo'

const route = useRoute()
const sessionStorage = useSessionStorage('config', {
  OPEN_COMMENT: false,
})
const memoData = ref<MemoDTO>({} as MemoDTO)
const router = useRouter()
const page = ref(1)
const commentResp: Ref<QueryCommentResponse> = ref({} as QueryCommentResponse)

onMounted(async () => {
  await reload()
})
const reload = async () => {
  const { data, error } = await useMyFetch('/api/memo/' + route.params.id)
    .post()
    .json()
  if (error.value) return

  memoData.value = data.value
  await loadComments()
}

const loadComments = async () => {
  const { data, error } = await useMyFetch('/api/comment/query')
    .post({
      page: page.value,
      size: 100,
      memoId: memoData.value.id,
    })
    .json()
  if (error.value) return
  commentResp.value = data.value
}

commetSavedBus.on(reload)
</script>

<style scoped></style>
