import React from "react";
import { FormattedMessage } from 'react-intl';
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
          <CardTitle className="text-2xl">
            <FormattedMessage id="login.title" defaultMessage="Welcome to IdeaHub" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage id="login.description" defaultMessage="Collaborative idea management platform" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={login}
              disabled={isLoading}
              className="w-full bg-[#fee600] hover:bg-[#fdd600] text-black"
            >
              {isLoading ? 
                <FormattedMessage id="login.buttonLoading" defaultMessage="Logging in..." /> : 
                <FormattedMessage id="login.button" defaultMessage="Login to System" />
              }
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>
                <FormattedMessage id="login.backendInfo" defaultMessage="Java backend with Keycloak authentication" />
              </p>
              <p className="mt-2 text-xs">
                <FormattedMessage id="login.tempNote" defaultMessage="Temporary placeholder for demonstration" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}