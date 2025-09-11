import { LOCALES } from './locales';
import { messages } from './messages/index';

// Get messages for a specific locale
export const getMessages = (locale: string) => {
  return messages[locale as keyof typeof messages] || messages[LOCALES.ENGLISH];
};