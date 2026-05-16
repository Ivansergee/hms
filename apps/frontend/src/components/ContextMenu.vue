<template>
  <div ref="menuRef">
    <a-menu
      v-if="modelValue"
      v-model:open-keys="openKeys"
      class="context-menu"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      mode="vertical"
      :items="items"
      @click="onClick"
    />
  </div>
</template>
<script setup lang="ts">
import type { ItemType } from 'ant-design-vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { type PropType, ref, watch } from 'vue';
import type { Key } from 'ant-design-vue/es/_util/type';
import { useEventListener } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  items: {
    type: Array as PropType<ItemType[]>,
    required: true,
  },
  position: {
    type: Object as PropType<{ x: number; y: number }>,
    required: true,
  },
});
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  itemClick: [key: Key];
}>();

useEventListener(document, 'mousedown', (e: MouseEvent) => {
  onClickOutside(e);
});

const menuRef = ref<HTMLElement | undefined>();
const openKeys = ref<Key[]>([]);

const onClick = ({ key }: MenuInfo): void => {
  emit('itemClick', key);
  emit('update:modelValue', false);
};

const onClickOutside = (e: MouseEvent) => {
  if (props.modelValue && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('update:modelValue', false);
  }
};

const onRClick = (e: MouseEvent) => {
  e.preventDefault();
  emit('update:modelValue', false);
};

let rclickCleanup: () => void;

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        rclickCleanup = useEventListener(document, 'contextmenu', onRClick);
      }, 50);
    } else {
      rclickCleanup?.();
    }
  },
);
</script>
<style scoped>
.context-menu {
  position: fixed;
  z-index: 2000;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 13px;
}

.context-menu :deep(.ant-menu) {
  padding: 4px 0;
  border-radius: 6px;
}

.context-menu :deep(.ant-menu-item) {
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
}
</style>
