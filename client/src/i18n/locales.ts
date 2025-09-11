// Available locales
export const LOCALES = {
  ENGLISH: 'en',
  RUSSIAN: 'ru',
} as const;

export type LocaleType = typeof LOCALES[keyof typeof LOCALES];

export const LOCALE_NAMES = {
  [LOCALES.ENGLISH]: 'English',
  [LOCALES.RUSSIAN]: 'Русский',
};