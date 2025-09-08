import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/toaster";
import { queryClient } from "./lib/queryClient";
import IdeasWidget, { type UserData, type IdeasWidgetProps } from "./ui/home";
import "./config/i18n";

// Default user data for standalone mode (when no user is provided by host)
const defaultUser: UserData = {
  id: 7,
  username: "Test User",
  avatar: ""
};

// Standalone wrapper component for the Ideas Widget
// This component includes all necessary providers and setup
export const StandaloneIdeasWidget: React.FC<IdeasWidgetProps> = ({ user = defaultUser, apiBaseUrl = '' }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="standalone-ideas-widget">
          <IdeasWidget user={user} apiBaseUrl={apiBaseUrl} />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default StandaloneIdeasWidget;