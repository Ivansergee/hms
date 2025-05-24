<template>
  <div>
    <a-typography-text strong>{{ title }}: </a-typography-text>
    <a-space v-if="oldValue !== newValue">
      <a-typography-text type="danger">{{ oldValue }}</a-typography-text>
      <ArrowRightOutlined/>
      <a-typography-text type="success">{{ newValue }}</a-typography-text>
    </a-space>
    <a-typography-text v-else>{{ oldValue }}</a-typography-text>
  </div>
</template>
<script setup lang="ts">
import { ArrowRightOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from "@/composables/useScopedI18n.ts";

interface Props {
  title: string;
  oldValue?: string | number;
  newValue?: string | number;
}

const props = defineProps<Props>();
</script>
<style scoped>

</style>
