<template>
  <a-typography-title :level="3">
    {{ t('templates') }}
  </a-typography-title>
  <TemplatesTable />
</template>
<script setup lang="ts">
import { useScopedI18n } from '@/composables/useScopedI18n.ts';

defineOptions({ name: 'TemplatesView' });
const { t } = useScopedI18n();

</script>
<style scoped>

</style>
