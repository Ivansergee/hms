import fetcher from "@/queries/fetcher.ts";
import type { Service, ServiceGroup } from "@shared/types/service.ts";

export const serviceQueries = {
  getAll(): Promise<Service[]> {
    return fetcher.get<Service[]>('/service');
  },
  getGroups(): Promise<ServiceGroup[]> {
    return fetcher.get<ServiceGroup[]>('/service/group');
  }
};
