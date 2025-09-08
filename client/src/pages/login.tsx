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
          <CardTitle className="text-2xl">Welcome to IdeaHub</CardTitle>
          <CardDescription>
            Collaborative Idea Management Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={login}
              disabled={isLoading}
              className="w-full bg-[#fee600] hover:bg-[#fdd600] text-black"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>Node.js backend with secure authentication</p>
              <p className="mt-2 text-xs">
                Demo login for testing purposes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}