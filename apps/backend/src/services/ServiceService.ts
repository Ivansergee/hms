import { prisma } from "../../prisma/prisma";
import { ServiceCreate } from "@shared/types/service";

export class ServiceService {
    getAll() {
        return prisma.service.findMany();
    }
    getAllGroups() {
        return prisma.serviceGroup.findMany();
    }
    create(data: ServiceCreate) {
        return prisma.service.create({ data });
    }
    edit(serviceId: number, data: ServiceCreate) {
        return prisma.service.update({
            where: { id: serviceId },
            data,
        });
    }
    delete(serviceId: number) {
        return prisma.service.delete({where: { id: serviceId }});
    }
}