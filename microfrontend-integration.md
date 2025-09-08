# IdeaHub MicroFrontend Integration Guide

## Overview

The IdeaHub Ideas Widget has been prepared as a self-contained widget that can be easily integrated into other applications as a MicroFrontend. The widget is structured as a single, independent module with all necessary dependencies.

## Quick Integration Methods

### Option 1: Standalone Widget (Recommended)

Copy the entire `client/src/widget-ideas/` directory to your host application and use:

```typescript
import { StandaloneIdeasWidget } from './path/to/widget-ideas/standalone';

function App() {
  return (
    <div>
      <h1>My Application</h1>
      <StandaloneIdeasWidget />
    </div>
  );
}
```

### Option 2: Manual Setup with Providers

```typescript
import { IdeasWidget } from './path/to/widget-ideas';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './path/to/widget-ideas/ui/tooltip';
import { queryClient } from './path/to/widget-ideas/lib/queryClient';
import './path/to/widget-ideas/config/i18n'; // Initialize translations

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IdeasWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

## Required Dependencies

Ensure your host application has these dependencies installed:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.60.5",
    "react-i18next": "^13.0.0",
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^7.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "lucide-react": "^0.400.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## Module Federation Setup (Advanced)

For a true microfrontend architecture using Module Federation:

### 1. Configure Module Federation in your host application

Add to your vite.config.ts:

```typescript
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    federation({
      name: 'HostApp',
      remotes: {
        IdeasWidget: {
          from: 'webpack',
          format: 'var', 
          external: 'http://localhost:5000/assets/remoteEntry.js',
          externalType: 'url',
        },
      },
      shared: ['react', 'react-dom', 'react-i18next', '@tanstack/react-query'],
    }),
  ],
});
```

### 2. Build the Ideas Widget as Remote

Use the provided configuration:

```bash
# Build the microfrontend (when working)
npx vite build --config vite.microfrontend.config.ts
```

### 3. Import and use in your React application

```typescript
import React, { Suspense } from 'react';

// Import the microfrontend
const IdeasWidget = React.lazy(() => import('IdeasWidget/IdeasWidget'));

function App() {
  return (
    <div>
      <h1>My Application</h1>
      <Suspense fallback={<div>Loading Ideas Widget...</div>}>
        <IdeasWidget />
      </Suspense>
    </div>
  );
}
```

## Features Exposed

The microfrontend exposes:

- **`IdeasWidget`**: Complete ideas management widget with:
  - Idea listing with voting functionality
  - Create new ideas modal
  - Idea detail view with comments
  - Bilingual support (English/Russian)
  - Responsive design

## Dependencies

The microfrontend shares these dependencies with the host:
- `react` (^18.0.0)
- `react-dom` (^18.0.0) 
- `react-i18next`
- `@tanstack/react-query`

## Styling

The widget includes its own Tailwind CSS styling. Make sure your host application doesn't conflict with these styles, or include the microfrontend in an isolated container.

## API Requirements

The widget expects these API endpoints to be available:

- `GET /api/ideas` - List ideas
- `GET /api/ideas/:id` - Get idea details
- `GET /api/ideas/:id/comments` - Get idea comments
- `POST /api/ideas` - Create new idea
- `POST /api/ideas/:id/vote` - Vote on idea
- `POST /api/ideas/:id/comments` - Add comment

Make sure these endpoints are available in your host application's backend.