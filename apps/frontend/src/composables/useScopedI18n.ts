import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';
import { getEnumName } from "@/i18n/enumRegistry.ts";

export function useScopedI18n() {
  const { t: globalT } = useI18n();
  const instance = getCurrentInstance();
  const componentName = instance?.type.name;

  const t = (key: string, options?: any): string => {
    const scopedKey = componentName ? `${componentName}.${key}` : key;
    return globalT(scopedKey, options);
  }

  const translateEnum = (enumObj: object, value: string | number): string => {
    const enumName = getEnumName(enumObj);

    if (!enumName) {
      console.error('Enum is not registered');
      return String(value);
    }

    const key = `ENUMS.${enumName}.${value}`;
    const translated = globalT(key);

    return translated === key ? String(value) : translated;
  };

  return { t, translateEnum };
}
