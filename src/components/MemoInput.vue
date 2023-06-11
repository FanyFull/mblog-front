<template>
  <div class="p-2 bg-white rd fc gap-2 sticky top-0 shadow-xl z-99 dark:bg-gray-7 mb-2">
    <n-mention
      :theme-overrides="mentionThemeOverrides"
      type="textarea"
      placeholder="输入你要记录的吧"
      show-count
      prefix="#"
      :options="tags"
      v-model:value="memoSaveParam.content"
      v-if="tags && tags.length > 0"
      @paste="paste"
      :autosize="{
        minRows: 3,
        maxRows: 10,
      }"
    />
    <!-- <n-input
      :theme-overrides="inputThemeOverrides"
    /> -->
    <n-input
      :theme-overrides="inputThemeOverrides"
      v-else
      type="textarea"
      placeholder="输入你要记录的吧"
      show-count
      v-model:value="memoSaveParam.content"
      @paste="paste"
      :autosize="{
        minRows: 3,
        maxRows: 10,
      }"
    />
    <div class="fr gap-2 items-center">
      <n-select 
        v-model:value="memoSaveParam.visibility" 
        :options="visibilityOptions" 
        :theme-overrides="selectThemeOverrides"
        class="w-32" 
        size="small" />
      <n-upload :multiple="true" name="files" :show-file-list="false" :custom-request="customRequest" ref="uploadRef">
        <div
          class="i-carbon:cloud-upload cursor-pointer text-gray-500 hover:text-blue text-lg dark:text-blue-3"
        ></div>
      </n-upload>
      <n-popover :show="emojiShow" @clickoutside="emojiShow = false">
        <template #trigger>
          <div
            class="i-carbon:face-wink cursor-pointer hover:text-blue text-lg dark:text-blue-3"
            @click="emojiShow = true"
          ></div>
        </template>
        <emoji-picker ref="pickerRef" @emoji-click="emojiClicked"></emoji-picker>
      </n-popover>
      <!-- <n-button @click="toggleDrauuBus.emit()" size="tiny" text> 随手画 </n-button> -->
      <n-switch
        :theme-overrides="switchThemeOverrides"
        v-model:value="memoSaveParam.enableComment"
        size="small"
        checked-value="1"
        unchecked-value="0"
        v-if="sessionStorage.OPEN_COMMENT"
      >
        <!-- <template #checked> 允许评论 </template>
        <template #unchecked> 禁止评论 </template> -->
        <template #checked> 不评 </template>
        <template #unchecked> 允评 </template>
      </n-switch>
      <!-- <n-button type="primary" class="ml-auto px-8 bg-hex-1d9bf0 border-none" @click="saveMemo"> 记录 </n-button> -->
      <!-- <n-button type="primary" color="#1d9bf0" class="btn-blue ml-auto px-8 bg-hex-5dc45d dark:bg-hex-1d9bf0 border-none text-black dark:text-white hover:bg-red-400" @click="saveMemo"> 记录 </n-button> -->
      <n-button type="primary" color="#1d9bf0" text-color="#ffffff" class="btn-blue ml-auto px-8" @click="saveMemo"> 记录 </n-button>
    </div>

    <div class="fr" v-if="uploadFiles">
      <n-image-group>
        <n-space>
          <div class="relative" v-for="(img, index) in uploadFiles" :key="index">
            <n-image
              width="100"
              height="100"
              lazy
              class="rd hover:shadow-2xl"
              :src="img.url + (img.suffix || '')"
              :preview-src="img.url"
              :intersection-observer-options="{
                root: '#image-scroll-container',
              }"
            >
              <template #placeholder>
                <div
                  style="
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #0001;
                  "
                >
                  Loading
                </div>
              </template>
            </n-image>
            <div class="deleteBtn" @click="deleteResource(img.publicId)"></div>
          </div>
        </n-space>
      </n-image-group>
    </div>

    <Drauu />
  </div>
</template>

<script setup lang="ts">
import { getVisbilitys, type MemoSaveParam, type MemoDTO } from '@/types/memo'
import { type Tag } from '@/types/tag'
import { type MentionOption, type UploadCustomRequestOptions, type UploadInst } from 'naive-ui'
import 'emoji-picker-element'

// fanyfull 调整主题变量 start
import { type SelectProps, type ButtonProps, type InputProps, type MentionProps, type SwitchProps } from 'naive-ui'
  type SelectThemeOverrides = NonNullable<SelectProps['themeOverrides']>
  type ButtonThemeOverrides = NonNullable<ButtonProps['themeOverrides']>
  type InputThemeOverrides = NonNullable<InputProps['themeOverrides']>
  type MentionThemeOverrides = NonNullable<MentionProps['themeOverrides']>
  type SwitchThemeOverrides = NonNullable<SwitchProps['themeOverrides']>

  const selectThemeOverrides: SelectThemeOverrides = {
    menuBoxShadow:
      '0 6px 16px -9px rgba(0, 0, 0, .08), 0 9px 28px 0 rgba(0, 0, 0, .05), 0 12px 48px 16px rgba(0, 0, 0, .03)',
    peers: {
      InternalSelection: {
        // textColor: '#FF0000',
        // heightMedium: '42px',
        borderHover: '1px solid #ffffff',
        borderFocus: '1px solid #ffffff',
        borderActive: '1px solid #ffffff'
      }
    }
  }
  const inputThemeOverrides: InputThemeOverrides = {
    borderHover: '1px solid #ffffff',
    borderFocus: '1px solid #ffffff',
    caretColor: '#638FE2FF'
  }
  const mentionThemeOverrides: MentionThemeOverrides = {
    peers: {
      Input: {
        borderHover: '1px solid #ffffff',
        borderFocus: '1px solid #ffffff',
        caretColor: '#638FE2FF'
      }
    }
  }
  const switchThemeOverrides: SwitchThemeOverrides = {
    railColorActive: '#1d9bf0'
  }
  const buttonThemeOverrides: ButtonThemeOverrides = {
    heightMedium: '40px',
    textColor: 'rgba(24, 127, 231, 1)'
  }
// fanyfull 调整主题变量 end

const tags = ref<Array<MentionOption>>()
const sessionStorage = useSessionStorage('config', {
  OPEN_COMMENT: false,
})
let memoSaveParam: Partial<MemoSaveParam> = reactive({
  visibility: 'PUBLIC',
  publicIds: [],
})

interface UploadItem {
  url: string
  publicId: string
  suffix: string
  storageType: string
}

const uploadRef = ref<UploadInst | null>(null)

let uploadFiles = ref<Array<UploadItem>>([])

const emojiShow = ref(false)

const visibilityOptions = getVisbilitys()

onMounted(async () => {
  const { data, error } = await useMyFetch('/api/tag/list').post().json()
  if (error.value) return
  const tagList = data.value as Array<Tag>
  tags.value = tagList.map((r) => {
    return {
      label: r.name.substring(1),
      value: r.name.substring(1),
    }
  })
})

const paste = async (e: any) => {
  if (e.clipboardData.files[0]) {
    await upload(e.clipboardData.files[0])
  }
}

const emojiClicked = async (event: { detail: any }) => {
  const textArea = document.querySelector('textarea') as HTMLTextAreaElement
  const emojiVal = event.detail.unicode
  if (textArea.selectionStart || textArea.selectionStart === 0) {
    var startPos = textArea.selectionStart
    var endPos = textArea.selectionEnd
    memoSaveParam.content =
      textArea.value.substring(0, startPos) + emojiVal + textArea.value.substring(endPos, textArea.value.length)
    await nextTick()
    textArea.focus()
    textArea.setSelectionRange(endPos + emojiVal.length, endPos + emojiVal.length)
  } else {
    memoSaveParam.content += ' ' + emojiVal + ' '
  }
  emojiShow.value = false
}

const saveMemo = async () => {
  const url = memoSaveParam.id ? '/api/memo/update' : '/api/memo/save'
  memoSaveParam.enableComment = parseInt(memoSaveParam.enableComment as any)
  const { error } = await useMyFetch(url).post(memoSaveParam).json()
  if (!error.value) {
    memoSaveParam.id = undefined
    memoSaveParam.content = ''
    memoSaveParam.publicIds = []
    memoSaveParam.visibility = 'PUBLIC'
    uploadFiles.value = []
    changedMemoBus.emit()
  }
}

editMemoBus.on((memo: MemoDTO) => {
  const content = memo.tags + memo.content
  memoSaveParam.id = memo.id
  memoSaveParam.content = content
  memoSaveParam.publicIds = memo.resources.map((r) => r.publicId)
  memoSaveParam.priority = memo.priority
  memoSaveParam.visibility = memo.visibility
  memoSaveParam.enableComment = memo.enableComment + ''
  uploadFiles.value = structuredClone(toRaw(memo.resources))
})

const userinfo = useStorage('userinfo', { token: '' })

const upload = async (file: File) => {
  const uploadUrl = `${import.meta.env.VITE_BASE_URL}/api/resource/upload`
  const uploadHeaders = {
    token: userinfo.value.token,
  }
  const formData = new FormData()
  formData.append('files', file)

  const { data, error } = await useMyFetch(uploadUrl, {
    body: formData,
    headers: uploadHeaders,
  })
    .post()
    .json()
  if (!error.value) {
    data.value.forEach((item: any) => {
      if (item.storageType === 'LOCAL') {
        item.url = import.meta.env.VITE_BASE_URL + item.url
      }
    })
    uploadFiles.value.push(...data.value)
    memoSaveParam.publicIds = uploadFiles.value.map((r) => r.publicId)
    uploadRef.value?.clear()
  }
}

const customRequest = async ({ file }: UploadCustomRequestOptions) => {
  await upload(file.file as File)
}

const deleteResource = (publicId: string) => {
  const idx = uploadFiles.value.findIndex((r) => r.publicId === publicId)
  if (idx >= 0) {
    uploadFiles.value.splice(idx, 1)
  }
  const idx2 = memoSaveParam.publicIds?.findIndex((r) => r === publicId)
  if (memoSaveParam.publicIds && idx2 != null && idx2 >= 0) {
    memoSaveParam.publicIds.splice(idx2, 1)
  }
}
</script>

<style scoped lang="scss">
::v-deep(.n-upload) {
  width: auto;
  display: flex;
}

.deleteBtn {
  @apply i-carbon:close-filled text-red-400 hover:text-red-700 cursor-pointer absolute top-2 right-2 fw-500;
}

emoji-picker {
  width: 400px;
  height: 300px;
}
@media screen and (max-width: 640px) {
  emoji-picker {
    width: 100%;
    --num-columns: 6;
    --category-emoji-size: 1rem;
  }
}

::v-deep(.n-button) {
  // background-color: #983f3f;
  // border-color: #983f3f;
  // border: 1px solid red;
  // border: none;
}

/*
::v-deep(.n-button .n-button__content) {
  color: #ffffff;
}
*/
</style>
