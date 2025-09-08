# Ideas Widget Package Structure

## Directory Structure

```
widget-ideas/
├── ui/                     # UI Components
│   ├── home.tsx           # Main widget component
│   ├── idea-card.tsx      # Individual idea display
│   ├── create-idea-modal.tsx
│   ├── idea-detail-modal.tsx
│   ├── filters-bar.tsx
│   ├── language-switcher.tsx
│   ├── not-found.tsx
│   ├── button.tsx         # UI primitives
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── form.tsx
│   ├── avatar.tsx
│   ├── card.tsx
│   ├── toaster.tsx
│   └── tooltip.tsx
├── lib/                   # Utilities
│   ├── queryClient.ts     # React Query setup
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom hooks
│   └── use-toast.ts       # Toast notifications
├── config/                # Configuration
│   └── i18n.ts           # Internationalization setup
├── index.ts              # Main exports
└── standalone.tsx        # Self-contained widget with providers
```

## Main Exports

- `IdeasWidget` - The main widget component (requires providers)
- `StandaloneIdeasWidget` - Self-contained widget with all providers included
- `CreateIdeaModal`, `IdeaDetailModal`, etc. - Individual components for custom integration

## Integration Options

### 1. Standalone (Easiest)
```tsx
import { StandaloneIdeasWidget } from './widget-ideas/standalone';
<StandaloneIdeasWidget />
```

### 2. With existing providers
```tsx
import { IdeasWidget } from './widget-ideas';
// Use within your existing QueryClientProvider
```

### 3. Individual components
```tsx
import { CreateIdeaModal } from './widget-ideas';
// Use specific components as needed
```

## Dependencies

The widget is self-contained and includes all necessary UI components and utilities. Only requires React Query and i18next as external dependencies.