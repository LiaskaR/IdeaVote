# IdeaHub MicroFrontend Integration Guide

## Overview

The IdeaHub Ideas Widget is a production-ready, self-contained microfrontend with Keycloak authentication support. It can be easily integrated into any React application using multiple deployment strategies.

**⚠️ UPDATED:** Now includes Keycloak JWT authentication integration for enterprise security.

## Quick Integration Methods

### Option 1: Standalone Widget with Keycloak (Recommended)

Copy the entire `client/src/widget-ideas/` directory to your host application and use:

```typescript
import { StandaloneIdeasWidget } from './path/to/widget-ideas/standalone';

function App() {
  // Get user data from Keycloak
  const user = {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    avatar: keycloak.tokenParsed.picture
  };

  return (
    <div>
      <h1>My Application</h1>
      <StandaloneIdeasWidget 
        user={user}
        authToken={keycloak.token}  // JWT token from Keycloak
        apiBaseUrl="https://your-api-domain.com"
      />
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
  const user = {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    avatar: keycloak.tokenParsed.picture
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IdeasWidget 
          user={user}
          authToken={keycloak.token}
          apiBaseUrl="https://your-api-domain.com"
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

## Required Dependencies

**⚠️ IMPORTANT:** This widget requires React 18.2.0 for compatibility:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^5.3.0",
    "@tanstack/react-query": "^5.60.5",
    "react-i18next": "^13.0.0",
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^7.0.0",
    "@radix-ui/react-tooltip": "^1.2.0",
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
  const user = {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    avatar: keycloak.tokenParsed.picture
  };

  return (
    <div>
      <h1>My Application</h1>
      <Suspense fallback={<div>Loading Ideas Widget...</div>}>
        <IdeasWidget 
          user={user}
          authToken={keycloak.token}
          apiBaseUrl="https://your-api-backend.com"
        />
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

## 🔐 Authentication & API Requirements

### Keycloak Integration

The widget now supports enterprise-grade Keycloak authentication:

```typescript
interface IdeasWidgetProps {
  user?: {
    id: string;          // Keycloak 'sub' claim
    username: string;    // Keycloak 'preferred_username' claim  
    avatar?: string;     // Keycloak 'picture' claim (optional)
  };
  authToken?: string;    // Raw JWT token from Keycloak
  apiBaseUrl?: string;   // Your backend API URL
}
```

### Backend Configuration

Your backend must be configured with Keycloak JWT verification:

```bash
# Environment variables
KEYCLOAK_REALM_URL=https://your-keycloak.com/realms/your-realm
KEYCLOAK_CLIENT_ID=your-client-id
JWT_SECRET=your-32-plus-character-secret-for-dev
```

### API Endpoints

The widget expects these **authenticated** API endpoints:

- `GET /api/ideas` - List ideas (public)
- `GET /api/ideas/:id` - Get idea details (public)
- `GET /api/ideas/:id/comments` - Get idea comments (public)
- `POST /api/ideas` - Create new idea (**requires authentication**)
- `POST /api/ideas/:id/vote` - Vote on idea (**requires authentication**)
- `POST /api/ideas/:id/comments` - Add comment (**requires authentication**)

All POST endpoints now automatically use the authenticated user ID from the JWT token.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Replit auto-deployment
- Docker containerization
- Cloud platform deployment (Vercel, Heroku, AWS)
- CDN deployment for microfrontends
- Environment configuration
- Performance optimization