import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/4 оп_1751020306764.png";

export default function Login() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoPath} alt="IdeaHub" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">Добро пожаловать в IdeaHub</CardTitle>
          <CardDescription>
            Платформа для совместного управления идеями
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={login}
              disabled={isLoading}
              className="w-full bg-[#fee600] hover:bg-[#fdd600] text-black"
            >
              {isLoading ? "Входим..." : "Войти в систему"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>Java backend с Keycloak авторизацией</p>
              <p className="mt-2 text-xs">
                Временная заглушка для демонстрации
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}