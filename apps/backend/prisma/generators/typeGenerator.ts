import { writeFile, mkdir } from 'fs/promises';
import path from 'node:path';

import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
import { convertPrismaType, GeneratorPropertyType, parseDecorators } from "./utils";

enum TypeGeneratorProperties {
    IGNORE = 'ignore',
    NAME = 'name',
}

const propertyTypeByName: Record<TypeGeneratorProperties, GeneratorPropertyType> = {
    [TypeGeneratorProperties.IGNORE]: GeneratorPropertyType.BOOLEAN,
    [TypeGeneratorProperties.NAME]: GeneratorPropertyType.STRING,
}

generatorHandler({
    onManifest() {
        return {
            defaultOutput: './generated/types',
        };
    },
    async onGenerate(options: GeneratorOptions) {
        let interfacesContent = ``;
        let enumsContent = `// Auto-generated from Prisma schema\n\n`;
        const interfacesImports = new Set<string>();

        const enums: string[] = [];

        for (const model of options.dmmf.datamodel.enums) {
            const modelParams = parseDecorators('typeGen', propertyTypeByName, model.documentation);

            if (modelParams.ignore) {
                continue;
            }

            const enumName = modelParams.name ?? model.name;
            enums.push(enumName as string);

            enumsContent += `export enum ${enumName} {\n`;

            for (const value of model.values) {
                enumsContent += `  ${value.name} = '${value.name}',\n`;
            }

            enumsContent += `}\n\n`;
        }

        for (const model of options.dmmf.datamodel.models) {
            const modelParams = parseDecorators('typeGen', propertyTypeByName, model.documentation);

            if (modelParams.ignore) {
                continue;
            }

            const interfaceName =  modelParams.name ?? model.name;

            interfacesContent += `export interface ${interfaceName} {\n`;

            for (const field of model.fields) {
                const fieldParams = parseDecorators('typeGen', propertyTypeByName, field.documentation);
                if (fieldParams.ignore) {
                    continue;
                }

                const optional = field.isRequired ? '' : '?';
                const tsType = convertPrismaType(field.type);
                if (enums.includes(tsType)) {
                    interfacesImports.add(`import { ${tsType} } from "./enums";\n`);
                }
                interfacesContent += `  ${field.name}${optional}: ${tsType};\n`;
            }

            interfacesContent += `}\n\n`;
        }

        interfacesContent = `// Auto-generated from Prisma schema\n${[...interfacesImports].join('')}\n${interfacesContent}`;

        const outputFile = options.generator.output;
        if (!outputFile || !outputFile.value) {
            throw new Error('No output file specified');
        }

        const outputDir = path.resolve(outputFile.value);
        await mkdir(outputDir, { recursive: true });
        await writeFile(path.join(outputDir, 'types.ts'), interfacesContent);
        await writeFile(path.join(outputDir, 'enums.ts'), enumsContent);
    }
})
