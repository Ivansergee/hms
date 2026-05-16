<template>
  <div>
    <a-typography-text strong>
      {{ title }}:
    </a-typography-text>
    <a-space v-if="oldValue !== newValue">
      <a-typography-text type="danger">
        {{ oldValue }}
      </a-typography-text>
      <ArrowRightOutlined />
      <a-typography-text type="success">
        {{ newValue }}
      </a-typography-text>
    </a-space>
    <a-typography-text v-else>
      {{ oldValue }}
    </a-typography-text>
  </div>
</template>
<script setup lang="ts">
import { ArrowRightOutlined } from '@ant-design/icons-vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  oldValue: {
    type: [String, Number],
    required: false,
  },
  newValue: {
    type: [String, Number],
    required: false,
  },
});
</script>
<style scoped>

</style>
