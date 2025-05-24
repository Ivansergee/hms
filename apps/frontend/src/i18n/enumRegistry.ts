const enumRegistry = new WeakMap<object, string>();

export function registerEnum(enumObj: object, enumName: string): void {
  enumRegistry.set(enumObj, enumName);
}

export function getEnumName(enumObj: object): string | undefined {
  return enumRegistry.get(enumObj);
}
