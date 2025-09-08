# IdeaHub Deployment & MicroFrontend Integration Guide

## 🚀 Deployment Options

### 1. Replit Deployment (Recommended for Quick Start)

#### Auto-Deploy with Replit
1. Your application is already configured for Replit deployment
2. Click the **Deploy** button in your Replit environment
3. Select **Autoscale** deployment
4. Your app will be available at `https://your-replit-name.username.replit.app`

#### Manual Replit Deploy
```bash
# Build the application
npm run build

# Deploy using Replit CLI (if available)
replit deploy
```

### 2. Production Deployment

#### Build Commands
```bash
# Standard full-stack build
npm run build

# MicroFrontend-only build
npx vite build --config vite.microfrontend.config.ts

# Database setup (if needed)
npm run db:push
```

#### Environment Variables for Production
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Keycloak Authentication
KEYCLOAK_REALM_URL=https://your-keycloak.com/realms/your-realm
KEYCLOAK_CLIENT_ID=your-client-id
JWT_SECRET=your-32-plus-character-secret-for-dev-mode

# Server Configuration
NODE_ENV=production
PORT=5000
```

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY shared/ ./shared/

# Expose port and start
EXPOSE 5000
CMD ["npm", "start"]
```

#### Cloud Platform Deployment

**Vercel/Netlify (Frontend Only)**
```bash
# Build microfrontend for CDN deployment
npx vite build --config vite.microfrontend.config.ts
# Deploy the dist/microfrontend folder
```

**Heroku/Railway/Render (Full-Stack)**
```json
// package.json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## 🧩 MicroFrontend Integration

### Option 1: Copy & Paste Integration (Simplest)

Copy the `client/src/widget-ideas/` directory to your host application:

```typescript
import { StandaloneIdeasWidget } from './widget-ideas/standalone';

function App() {
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
        authToken={keycloak.token}  // Keycloak JWT token
        apiBaseUrl="https://your-api-domain.com"
      />
    </div>
  );
}
```

### Option 2: Module Federation (True MicroFrontend)

#### 1. Host Application Setup

Install dependencies:
```bash
npm install @originjs/vite-plugin-federation
```

Configure `vite.config.ts` in your host app:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'HostApp',
      remotes: {
        IdeasWidget: {
          external: 'https://your-ideas-widget-domain.com/assets/remoteEntry.js',
          format: 'esm',
          from: 'vite'
        }
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@tanstack/react-query': { singleton: true }
      }
    })
  ]
});
```

#### 2. Use in Host Application

```typescript
import React, { Suspense } from 'react';

// Import the remote microfrontend
const IdeasWidget = React.lazy(() => import('IdeasWidget/IdeasWidget'));

function App() {
  // Get user data from your authentication system
  const user = {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    avatar: keycloak.tokenParsed.picture
  };

  return (
    <div>
      <h1>My Host Application</h1>
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

#### 3. Build & Deploy MicroFrontend

```bash
# Build the microfrontend
npx vite build --config vite.microfrontend.config.ts

# Deploy dist/microfrontend to your CDN/hosting
# The remoteEntry.js will be available at: 
# https://your-domain.com/assets/remoteEntry.js
```

### Option 3: NPM Package Integration

Package and publish the widget as an NPM package:

```bash
# In your widget project
npm pack
# Creates rest-express-1.0.0.tgz

# In host application
npm install ./path/to/rest-express-1.0.0.tgz
```

```typescript
import { IdeasWidget } from 'rest-express/widget-ideas';
// Use as any other component
```

## 🔐 Authentication Integration

### Keycloak Integration

The widget expects these props for authentication:

```typescript
interface IdeasWidgetProps {
  user?: {
    id: string;          // Keycloak sub claim
    username: string;    // Keycloak preferred_username
    avatar?: string;     // Keycloak picture claim (optional)
  };
  authToken?: string;    // Raw JWT token from Keycloak
  apiBaseUrl?: string;   // Your backend API URL
}
```

### Backend API Requirements

Your backend must handle Keycloak JWT verification:

```typescript
// Example middleware for your host backend
app.use('/api', authenticateKeycloak); // Verify JWT tokens

// Required API endpoints:
// GET /api/ideas
// POST /api/ideas (authenticated)
// POST /api/ideas/:id/vote (authenticated)  
// POST /api/ideas/:id/comments (authenticated)
```

## 📦 Required Dependencies

For host applications using the widget:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
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

## 🎨 Styling Considerations

### Isolated Styling
The widget includes scoped Tailwind CSS. To avoid conflicts:

```css
/* In your host app, scope widget styles */
.ideas-widget-container {
  /* Widget styles are isolated here */
}
```

### Custom Theme Integration
Override widget colors by setting CSS variables:

```css
.ideas-widget-container {
  --primary: 210 40% 50%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other theme variables */
}
```

## 🔄 Real-Time Features (Optional)

For real-time updates, extend the backend with WebSocket support:

```typescript
// Backend extension for real-time
import { WebSocketServer } from 'ws';

// Broadcast idea updates to all connected clients
wss.broadcast = function(data) {
  wss.clients.forEach(client => {
    client.send(JSON.stringify(data));
  });
};
```

## 🚀 Performance Optimization

### Production Optimizations

```typescript
// vite.config.ts for production builds
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tooltip']
        }
      }
    }
  }
});
```

### CDN Deployment
Deploy static assets to a CDN for better performance:

```bash
# Build for CDN
npx vite build --config vite.microfrontend.config.ts

# Upload dist/microfrontend to AWS S3, Cloudflare, etc.
# Update remoteEntry URL in host applications
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Configure your backend to allow cross-origin requests
2. **Authentication Failures**: Ensure JWT_SECRET or KEYCLOAK_REALM_URL is set
3. **Module Federation Issues**: Check shared dependencies versions match
4. **Styling Conflicts**: Use CSS isolation or namespace your styles

### Debug Mode
Enable debug logging:

```bash
DEBUG=ideas-widget:* npm run dev
```

## 📝 License & Support

- **License**: MIT
- **React Version**: 18.2.0 compatible
- **Browser Support**: Modern browsers (ES2020+)
- **Mobile Support**: Responsive design included

---

This widget is production-ready and can be deployed across various platforms and integrated into existing applications with minimal setup!