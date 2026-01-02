import fetcher from "@/queries/fetcher";
import type { Service, ServiceGroup } from "@shared/types/service";

export const serviceQueries = {
  getAll(): Promise<Service[]> {
    return fetcher.get<Service[]>('/service');
  },
  getGroups(): Promise<ServiceGroup[]> {
    return fetcher.get<ServiceGroup[]>('/service/group');
  }
};
