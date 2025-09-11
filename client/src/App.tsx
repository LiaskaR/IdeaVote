import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { IntlProvider } from 'react-intl';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LOCALES, defaultLocale, getMessages } from "@/i18n";
import Home from "@/pages/home";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && Object.values(LOCALES).includes(savedLocale as any)) {
      setLocale(savedLocale);
    }
  }, []);

  return (
    <IntlProvider
      locale={locale}
      messages={getMessages(locale)}
      defaultLocale={LOCALES.ENGLISH}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default App;
