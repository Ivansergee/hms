import { createI18n } from 'vue-i18n';
import { getEnumName } from '@/i18n/enumRegistry.ts';
import en from './locales/en.json';
import ru from './locales/ru.json';

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages: {
    en,
    ru,
  },
});

export const translateEnum = (enumObj: object, value: string | number): string => {
  const globalT = i18n.global.t;
  const enumName = getEnumName(enumObj);

  if (!enumName) {
    console.error('Enum is not registered');
    return String(value);
  }

  const key = `ENUMS.${enumName}.${value}`;
  const translated = globalT(key);

  return translated === key ? String(value) : translated;
};
