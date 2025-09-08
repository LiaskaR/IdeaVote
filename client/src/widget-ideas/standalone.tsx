import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/toaster";
import { queryClient } from "./lib/queryClient";
import IdeasWidget from "./ui/home";
import "./config/i18n";

// Standalone wrapper component for the Ideas Widget
// This component includes all necessary providers and setup
export const StandaloneIdeasWidget: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="standalone-ideas-widget">
          <IdeasWidget />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default StandaloneIdeasWidget;