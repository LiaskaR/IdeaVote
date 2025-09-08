import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/language-switcher";
import logoPath from "@assets/4 оп_1751020306764.png";

export default function Login() {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoPath} alt="IdeaHub" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">{t('auth.welcome')}</CardTitle>
          <CardDescription>
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={login}
              disabled={isLoading}
              className="w-full bg-[#fee600] hover:bg-[#fdd600] text-black"
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>{t('auth.backendInfo')}</p>
              <p className="mt-2 text-xs">
                {t('auth.demoNote')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}