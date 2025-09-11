// i18n setup for react-intl
import { createIntl, createIntlCache } from 'react-intl';
import { LOCALES } from './locales';
import { messages } from './messages/index';

export { LOCALES };

// This is optional but highly recommended
// since it prevents memory leak
const cache = createIntlCache();

// Get user's preferred language from localStorage or browser
const getInitialLocale = (): string => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && Object.values(LOCALES).includes(savedLocale as any)) {
    return savedLocale;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  return Object.values(LOCALES).includes(browserLang as any) ? browserLang : LOCALES.ENGLISH;
};

export const defaultLocale = getInitialLocale();

// Create intl instance for imperative usage (outside React components)
export const intl = createIntl(
  {
    locale: defaultLocale,
    messages: messages[defaultLocale as keyof typeof messages],
  },
  cache
);

// Function to switch language
export const switchLanguage = (locale: string) => {
  localStorage.setItem('locale', locale);
  window.location.reload(); // Reload to apply new language
};

// Get messages for a specific locale
export const getMessages = (locale: string) => {
  return messages[locale as keyof typeof messages] || messages[LOCALES.ENGLISH];
};