export interface Service {
    id: number;
    name: string;
    price: string;
    groupId?: number;
    isActive: boolean;
}

export type ServiceCreate = Omit<Service, 'id'>;

export interface ServiceGroup {
    id: number;
    name: string;
}

export type ServiceGroupCreate = Omit<ServiceGroup, 'id'>;
