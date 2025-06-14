import { defineStore } from "pinia";
import type { Service, ServiceGroup } from "@shared/types/service.ts";
import { ref } from "vue";
import { serviceQueries } from "@/queries/serviceQueries.ts";

export const useServiceStore = defineStore('services', () => {
  const services = ref<Service[]>([]);
  const groups = ref<ServiceGroup[]>([]);

  const fetch = async () => {
    services.value = await serviceQueries.getAll();
    groups.value = await serviceQueries.getGroups();
  };

  const getById = (id: number): Service | undefined => {
    return services.value.find(service => service.id === id);
  };

  return {
    services,
    groups,
    fetch,
    getById,
  };
});
