// import { writeFile, mkdir } from 'fs/promises';
// import path from 'node:path';
//
// import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
// import { convertPrismaType, GeneratorPropertyType, parseDecorators } from "./utils";
//
// enum ModelGeneratorProperties {
//     IGNORE = 'ignore',
//     NAMESPACE = 'namespace',
//     METHODS = 'methods',
// }
//
// const propertyTypeByName: Record<ModelGeneratorProperties, GeneratorPropertyType> = {
//     [ModelGeneratorProperties.IGNORE]: GeneratorPropertyType.BOOLEAN,
//     [ModelGeneratorProperties.NAMESPACE]: GeneratorPropertyType.STRING,
//     [ModelGeneratorProperties.METHODS]: GeneratorPropertyType.ARRAY,
// }
//
// interface ModelPropertiesTypes {
//     [ModelGeneratorProperties.IGNORE]: boolean;
//     [ModelGeneratorProperties.NAMESPACE]: string;
//     [ModelGeneratorProperties.METHODS]: string[];
// }
//
// generatorHandler({
//     onManifest() {
//         return {
//             defaultOutput: './generated/models',
//         };
//     },
//     async onGenerate(options: GeneratorOptions) {
//         let modelContent = '';
//         const modelImports = new Set<string>(["import { t } from 'elysia';"]);
//
//         for (const model of options.dmmf.datamodel.models) {
//             if (!model.documentation) {
//                 continue;
//             }
//             const modelParams = parseDecorators('modelGen', model.documentation, propertyTypeByName);
//
//             if (modelParams.ignore || !modelParams.namespace) {
//                 continue;
//             }
//
//             const namespace = modelParams.namespace as string;
//             const methods = modelParams.methods as string[];
//             console.log(methods);
//
//             modelContent += `export const ${namespace} = {\n`;
//
//             for (const field of model.fields) {
//                 if (!field.documentation) {
//                     continue;
//                 }
//                 const fieldParams = parseDecorators('modelGen', field.documentation, propertyTypeByName);
//                 if (fieldParams.ignore) {
//                     continue;
//                 }
//
//                 const optional = field.isRequired ? '' : '?';
//                 const tsType = convertPrismaType(field.type);
//                 if (enums.includes(tsType)) {
//                     interfacesImports.add(`import { ${tsType} } from "./enums";\n`);
//                 }
//                 interfacesContent += `  ${field.name}${optional}: ${tsType};\n`;
//             }
//
//             interfacesContent += `}\n\n`;
//         }
//     }
// })
