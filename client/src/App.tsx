import React, { useEffect } from "react";
import { IntlProvider } from 'react-intl';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMessages } from "@/i18n";
import { auth } from "@/lib/auth";
import Home from "@/pages/home";

interface AppProps {
  locale: string;
  token?: string;
}

function App({ locale, token }: AppProps) {
  useEffect(() => {
    if (token) {
      auth.setExternalToken(token);
    }
  }, [token]);

  return (
    <IntlProvider
      locale={locale}
      messages={getMessages(locale)}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Home />
        </TooltipProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
}

export default App;
