<template>
  <a-button
    @click="isTemplateDialogVisible = true"
  >
    Add
  </a-button>
<!--  <a-table-->
<!--    class="scroll-table"-->
<!--    :columns="columns"-->
<!--    :data-source="tableRows"-->
<!--    :pagination="false"-->
<!--    :row-class-name="getRowClassName"-->
<!--    :custom-row="customRow"-->
<!--    size="small"-->
<!--    bordered-->
<!--    :scroll="{ y: '390px' }"-->
<!--  >-->
<!--  </a-table>-->
  <EditTemplateDialog
    :is-open="isTemplateDialogVisible"
    @close="isTemplateDialogVisible = false"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";

interface Props {
}

const props = defineProps<Props>();
const emit = defineEmits();

const isTemplateDialogVisible = ref<boolean>(false);

</script>
<style scoped>

</style>
