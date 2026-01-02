import { defineStore } from "pinia";
import { ref } from "vue";
import type { Category } from "@shared/types/category";

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
});
