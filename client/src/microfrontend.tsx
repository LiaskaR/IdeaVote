import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./widget-ideas/ui/tooltip";
import { Toaster } from "./widget-ideas/ui/toaster";
import { queryClient } from "./widget-ideas/lib/queryClient";
import IdeasWidget from "./widget-ideas/ui/home";
import "./widget-ideas/config/i18n";
import "./index.css";

// MicroFrontend wrapper component for the Ideas Widget
export const MicroFrontendWrapper: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="microfrontend-ideas-widget">
          <IdeasWidget />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Export for module federation
export default MicroFrontendWrapper;

// Also export the raw widget for more flexible integration
export { default as IdeasWidget } from "./widget-ideas/ui/home";