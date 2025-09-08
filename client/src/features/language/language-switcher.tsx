import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === 'ru' ? 'RU' : 'EN';
  const nextLang = i18n.language === 'en' ? 'RU' : 'EN';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
      title={t('language.switchTo', { language: nextLang === 'RU' ? 'Russian' : 'English' })}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{currentLang}</span>
    </Button>
  );
}