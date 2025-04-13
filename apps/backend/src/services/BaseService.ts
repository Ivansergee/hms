type Delegate<T> = {
    findMany: () => Promise<T[]>;
    findUnique: (args: any) => Promise<T | null>;
    create: (args: any) => Promise<T>;
    update: (args: any) => Promise<T>;
    delete: (args: any) => Promise<T>;
};

export class BaseService<T, TCreate, TUpdate> {
    constructor(protected readonly model: Delegate<T>) {}

    getAll(): Promise<T[]> {
        return this.model.findMany();
    }

    getById(id: number): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    create(data: TCreate): Promise<T> {
        return this.model.create({ data });
    }

    update(id: number, data: TUpdate): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    delete(id: number): Promise<T> {
        return this.model.delete({ where: { id } });
    }
}
