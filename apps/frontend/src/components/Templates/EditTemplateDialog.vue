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
    width="80vw"
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
    <div contenteditable="true" v-html="fileContent" />
    <iframe v-if="pdfUrl" :src="pdfUrl" style="width: 100%; height: 600px;" />
  </a-modal>
</template>
<script setup lang="ts">

import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { ref } from "vue";
import type { FileType } from "ant-design-vue/es/upload/interface";
import { UploadOutlined } from '@ant-design/icons-vue';
import PizZip from "pizzip";

interface Props {
  isOpen: boolean;
}

defineOptions({ name: 'EditTemplateDialog' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'close'): void
}>();

const isLoading = ref<boolean>(false);
const fileContent = ref<string>();
const pdfUrl = ref<string>();

const onClose = (): void => {
  emit('close');
};

const handleBeforeUpload = async (file: FileType) => {
  if (!file.name.endsWith('.docx')) {
    return false
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer;
    if (!arrayBuffer) {
      return;
    }
    const zip = new PizZip(arrayBuffer); // fileBuffer = ArrayBuffer from file
    const docXml = zip.file("word/document.xml")?.asText();
    if (docXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXml, "application/xml");
      console.log(xmlDoc)

      const texts = xmlDoc.getElementsByTagName("w:t");

      for (let i = 0; i < texts.length; i++) {
        console.log(`Text ${i}: ${texts[i].textContent}`);
      }
    }
  }
  reader.readAsArrayBuffer(file)

  return false // prevent default upload
}
</script>
<style scoped>

</style>
