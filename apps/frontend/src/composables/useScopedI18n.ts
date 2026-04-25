import { useI18n } from 'vue-i18n';
import { getCurrentInstance } from 'vue';

export function useScopedI18n() {
  const { t: globalT } = useI18n();
  const instance = getCurrentInstance();
  const componentName = instance?.type.name;

  const t = (key: string, options?: any): string => {
    const scopedKey = componentName ? `${componentName}.${key}` : key;
    return globalT(scopedKey, options);
  }

  return { t };
}
