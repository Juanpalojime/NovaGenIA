# NovaGenIA Frontend

Modern React + TypeScript frontend for the NovaGenIA AI image generation platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Vitest** - Testing framework

## Project Structure

```
app/src/
├── modules/              # Feature modules
│   ├── creative/        # Text-to-Image generation
│   │   ├── components/  # UI components
│   │   ├── stores/      # Zustand stores
│   │   └── CreativeDashboard.tsx
│   ├── studio/          # Advanced Pro Studio
│   ├── estudio/         # Asset Library
│   ├── training/        # Model Training
│   └── settings/        # Application Settings
├── store/               # Global state management
│   ├── useGlobalStore.ts
│   └── useGlobalStore.test.ts
├── lib/                 # Utilities
│   ├── api.ts          # API client
│   └── api.test.ts
├── layouts/             # Layout components
│   └── MainLayout.tsx
├── components/          # Shared components
│   ├── SystemBoot.tsx
│   └── ui/             # UI primitives
└── tests/               # Test setup
    └── setup.ts
```

## State Management

### Zustand Stores

#### Global Store (`useGlobalStore`)
- User profile and settings
- Theme management
- API endpoint configuration
- Notifications
- Connection logs

#### Generation Store (`useGenerationStore`)
- Generation parameters (mode, steps, CFG)
- Seed management
- Aspect ratios
- Presets (style, lighting, camera)
- Img2Img and ControlNet settings
- Face Swap configuration
- Magic Prompt

#### Library Store (`useLibraryStore`)
- Asset management
- Selection and favorites
- Search and filtering
- Undo/Redo history
- Gallery fetching

#### Training Store (`useTrainingStore`)
- Training configuration
- Dataset management
- Job monitoring
- Magic Mode auto-tuning

## Features

### Creative Dashboard
Main text-to-image generation interface with:
- Prompt console with Magic Prompt
- Mode selector (Extreme Speed, Speed, Quality)
- Aspect ratio selector
- Advanced settings panel
- Generation history

### Pro Studio
Advanced generation controls:
- Img2Img transformation
- ControlNet integration
- Face Swap
- Batch generation
- Parameter fine-tuning

### Asset Library
Image management system:
- Grid/List view modes
- Search and tag filtering
- Favorites
- Bulk operations
- Download options

### Training Center
Custom model training:
- Dataset upload
- Training configuration
- Progress monitoring
- Model management

### Settings
Application configuration:
- Theme selection (Light/Dark)
- API endpoint
- User preferences
- System information

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Runs on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Testing

### Run Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

**Test Coverage:**
- 88 tests across stores and utilities
- Comprehensive store testing
- API integration tests

## API Integration

### Configuration

Set API endpoint in Settings or via `useGlobalStore`:

```typescript
import { useGlobalStore } from '@/store/useGlobalStore'

const { setApiEndpoint } = useGlobalStore()
setApiEndpoint('http://localhost:7860')
```

### API Client

The `api.ts` utility provides:
- Dynamic API URL resolution
- Ngrok header injection
- Fetch wrapper with error handling

```typescript
import { apiFetch, getApiUrl } from '@/lib/api'

// Make API call
const response = await apiFetch('/generate', {
  method: 'POST',
  body: JSON.stringify(payload)
})
```

## Component Development

### Creating a New Module

1. Create module directory in `src/modules/`
2. Add components, stores, and types
3. Create main page component
4. Add route in `App.tsx`
5. Add navigation in `MainLayout.tsx`

### Example Module Structure

```
src/modules/mymodule/
├── components/
│   ├── MyComponent.tsx
│   └── MyComponent.test.tsx
├── stores/
│   ├── useMyStore.ts
│   └── useMyStore.test.ts
├── types.ts
└── MyModulePage.tsx
```

## Styling

### TailwindCSS

Custom configuration in `tailwind.config.js`:
- Custom color palette
- Dark mode support
- Custom animations
- Responsive breakpoints

### Theme System

Themes managed via `useGlobalStore`:
- Light/Dark modes
- Accent color customization
- Persistent preferences

## Performance Optimization

### Code Splitting

Lazy load heavy components:

```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Memoization

Use React.memo for expensive components:

```typescript
import { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering
})
```

## Deployment

### Build
```bash
npm run build
```

Output in `dist/` directory.

### Static Hosting

Deploy `dist/` to:
- Vercel
- Netlify
- GitHub Pages
- Any static host

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:7860
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Troubleshooting

### Module Not Found

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

Regenerate TypeScript declarations:
```bash
npx tsc --noEmit
```

### Test Failures

Clear test cache:
```bash
npm run test -- --clearCache
```

## Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use ESLint and Prettier
4. Follow component structure conventions

## License

MIT License - See LICENSE file for details

