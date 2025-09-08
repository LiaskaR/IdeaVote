# IdeaHub MicroFrontend Integration Guide

## Overview

The IdeaHub Ideas Widget has been configured as a MicroFrontend that can be consumed by other applications using Module Federation.

## Build Commands

To build the microfrontend:

```bash
# Build the microfrontend
npx vite build --config vite.microfrontend.config.ts

# The built files will be in dist/microfrontend/
# The main entry point will be remoteEntry.js
```

## Integration in Host Application

### 1. Configure Module Federation in your host application

Add to your vite.config.ts (or webpack config):

```typescript
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    // ... other plugins
    federation({
      name: 'HostApp',
      remotes: {
        IdeasWidget: {
          from: 'webpack',
          format: 'var',
          external: '/path/to/ideas-widget/remoteEntry.js',
          externalType: 'url',
        },
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```

### 2. Import and use in your React application

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

export default App;
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