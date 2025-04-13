export enum GeneratorPropertyType {
    BOOLEAN = 'boolean',
    STRING = 'string',
    ARRAY = 'array',
}

export function parseDecorators(
    decoratorName: string,
    propertyTypes: Record<string, GeneratorPropertyType>,
    doc?: string,
): Record<string, string | string[] | boolean> {
    const decorators: Record<string, string | string[] | boolean> = {};

    if (!doc) {
        return decorators;
    }

    for (const line of doc.split('\n')) {
        const parameter = line.split(`@${decoratorName}.`)[1];
        const [property, value] = parameter.split('=').map(s => s.trim());

        if (!parameter || !property) {
            continue;
        }
        switch (propertyTypes[property]) {
            case GeneratorPropertyType.BOOLEAN:
                decorators[property] = true;
                break;
            case GeneratorPropertyType.STRING:
                decorators[property] = value;
                break;
            case GeneratorPropertyType.ARRAY:
                decorators[property] = JSON.parse(value.replace(/'/g, '"'));
                break;
            default:
                throw new Error('Unsupported property type');
        }
    }

    return decorators;
}

export function convertPrismaType(prismaType: string): string {
    switch (prismaType) {
        case 'String':
        case 'DateTime':
            return 'string';
        case 'Int':
            return 'number';
        default:
            return prismaType;
    }
}
