<template>
  <div ref="menuRef">
    <a-menu
      v-if="modelValue"
      class="context-menu"
      v-model:openKeys="openKeys"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      mode="vertical"
      :items="items"
      @click="onClick"
    />
  </div>
</template>
<script setup lang="ts">
import type { ItemType } from "ant-design-vue";
import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";
import { ref, watch } from "vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { useEventListener } from "@vueuse/core";

interface Props {
  modelValue: boolean;
  items: ItemType[];
  position: { x: number; y: number };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'itemClick', key: Key): void;
}>();

useEventListener(document, 'mousedown', (e: MouseEvent) => {
  onClickOutside(e);
})

const menuRef = ref<HTMLElement | undefined>();
const openKeys = ref<Key[]>([]);

const onClick = ({ key }: MenuInfo): void => {
  emit('itemClick', key);
  emit('update:modelValue', false);
}

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
  }
);
</script>
<style scoped>
.context-menu {
  position: fixed;
  z-index: 2000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
}
</style>
