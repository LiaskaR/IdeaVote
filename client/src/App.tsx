import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./widget-ideas/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./widget-ideas/ui/toaster";
import { TooltipProvider } from "./widget-ideas/ui/tooltip";
import { IdeasWidget, NotFound } from "./widget-ideas";

function Router() {
  return (
    <Switch>
      <Route path="/" component={IdeasWidget} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
