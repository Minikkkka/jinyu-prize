# AGENTS.md - Development Guidelines for jinyu-prize

## Project Overview
React + TypeScript + Vite application for a prize management system. Uses Supabase for backend, Tailwind CSS for styling.

## Build/Lint/Type Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run check

# Linting
npm run lint

# Preview production build
npm run preview
```

**Note:** No test runner is currently configured in this project.

## Code Style Guidelines

### Imports
- Use path alias `@/` for imports from `src/` directory
- Group imports: React/external libs → internal components → types/utils
- Example:
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Prize } from '../types';
import { Search } from 'lucide-react';
import { GameButton } from '../components/GameUI';
```

### Component Structure
- Use `React.FC` type annotation for components
- Export components as default for pages
- Export named exports for reusable UI components
- Example:
```typescript
const Home: React.FC = () => { ... };
export default Home;
```

### Naming Conventions
- Components: PascalCase (e.g., `GameButton`, `AdminDashboard`)
- Functions/variables: camelCase (e.g., `handleSearch`, `employeeId`)
- Types/Interfaces: PascalCase (e.g., `Prize`, `ExcelData`)
- Files: PascalCase for components, camelCase for utilities

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Dark mode support via `class` strategy
- Container queries and responsive prefixes (`sm:`, `md:`, `lg:`)

### TypeScript
- Not using strict mode (strict: false in tsconfig)
- Use explicit types for function parameters and returns
- Define interfaces in `src/types/index.ts`
- Use path mapping `@/*` for clean imports

### Error Handling
- Use try/catch for async operations
- Log errors with `console.error()`
- Display user-friendly error messages in UI
- Check for Supabase-specific error codes (e.g., `PGRST116`)

### State Management
- Use React `useState` for local component state
- Use Zustand for global state if needed (already in dependencies)
- Use React Router for navigation state

### Environment Variables
- Use `import.meta.env.VITE_*` prefix for env vars
- Required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Add types in `src/vite-env.d.ts` for new env vars

### Supabase Queries
- Use `.from()` with table name
- Use `.select('*')` for full records
- Handle errors with proper error codes
- Example:
```typescript
const { data, error } = await supabase
  .from('prize_list')
  .select('*')
  .eq('employee_id', id)
  .single();
```

### Hooks
- Custom hooks go in `src/hooks/`
- Use descriptive names starting with `use`
- Example: `useTheme.ts`

### File Organization
```
src/
  components/     # Reusable UI components
  pages/          # Route-level components
  hooks/          # Custom React hooks
  lib/            # Utilities and configs (supabase, utils)
  types/          # TypeScript type definitions
  assets/         # Static assets
```

### React Patterns
- Use functional components only
- Prefer destructuring in props
- Use early returns for conditional rendering
- Use `lucide-react` for icons
