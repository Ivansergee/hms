<template>
  <a-modal
    :open="isOpen"
    :confirm-loading="isLoading"
    :mask-closable="false"
    :closable="false"
    :title="t('newBooking')"
    :body-style="{
      'overflow-y': 'auto',
      'min-height': '55vh',
      'max-height': '78vh'
    }"
    width="90vw"
  >
    <template #footer>
      <a-button
        type="default"
        @click="onClose"
      >
        Close
      </a-button>
      <a-button
        type="primary"
        @click="onClose"
      >
        Save
      </a-button>
    </template>
    <a-upload
      :before-upload="handleBeforeUpload"
      :show-upload-list="false"
      accept=".docx"
    >
      <a-button>
        <UploadOutlined />
        Upload
      </a-button>
    </a-upload>
    <!--    <DocumentEditor-->
    <!--      v-if="uploadedFileUrl"-->
    <!--      documentServerUrl="http://192.168.3.2:8765"-->
    <!--      id="docEditor"-->
    <!--      height="500px"-->
    <!--      :config="{-->
    <!--        document: {-->
    <!--          fileType: 'docx',-->
    <!--          title: 'Template.docx',-->
    <!--          url: uploadedFileUrl,-->
    <!--          key: String(Date.now()),-->
    <!--        },-->
    <!--        editorConfig: {-->
    <!--          mode: 'edit',-->
    <!--          customization: {-->
    <!--            compactHeader: true,-->
    <!--            compactToolbar: true,-->
    <!--            toolbarNoTabs: true,-->
    <!--            hideRightMenu: true,-->
    <!--            hideRulers: true,-->
    <!--            comments: false,-->
    <!--            chat: false,-->
    <!--            feedback: false,-->
    <!--            help: false,-->
    <!--            autosave: false,-->
    <!--            plugins: false,-->
    <!--            macros: false,-->
    <!--            forcesave: false,-->
    <!--            review: {-->
    <!--              showReviewChanges: false,-->
    <!--              trackChanges: false,-->
    <!--              hideReviewDisplay: true,-->
    <!--            },-->
    <!--            logo: {-->
    <!--              visible: false,-->
    <!--            },-->
    <!--            goback: false,-->
    <!--            close: {-->
    <!--              visible: false,-->
    <!--              text: '',-->
    <!--            },-->
    <!--            pointerMode: 'select',-->
    <!--          }-->
    <!--        },-->
    <!--      }"-->
    <!--    />-->
  </a-modal>
</template>
<script setup lang="ts">
import { useScopedI18n } from '@/composables/useScopedI18n';
import { ref } from 'vue';
import type { FileType } from 'ant-design-vue/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons-vue';
import fetcher from '@/queries/fetcher';
import { DocumentEditor } from '@onlyoffice/document-editor-vue';

interface DocParagraph {
  text: string;
  nodes: Element[];
}

interface Props {
  isOpen: boolean;
}

defineOptions({ name: 'EditTemplateDialog' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{(event: 'close'): void
}>();

const isLoading = ref<boolean>(false);
const uploadedFileUrl = ref<string>();

const onClose = (): void => {
  emit('close');
};

const handleBeforeUpload = async (file: FileType) => {
  if (!file.name.endsWith('.docx')) {
    return false;
  }

  const formData = new FormData();
  formData.append('file', file);

  uploadedFileUrl.value = await fetcher.post<string>('/template/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return false;
};
</script>
<style scoped>

</style>
