<template>
  <div class="tray-container">
    <TrayItem
      v-for="item in trayStore.trayItems"
      :key="item.id"
      :data="item"
      is-unsaved
      @remove="onRemove(item.id)"
      @restore="onRestore(item.id)"
    />
  </div>
</template>
<script setup lang="ts">
import { useTrayStore } from "@/stores/trayStore.ts";

const emit = defineEmits<{
  (event: 'restore', bookingId: number): void;
}>();

const trayStore = useTrayStore();

const onRemove = (id: number): void => {
  trayStore.remove(id);
};
const onRestore = (id: number): void => {
  emit('restore', id);
};
</script>
<style scoped>
.tray-container {
  position: absolute;
  bottom: 5px;
  right: 5px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
