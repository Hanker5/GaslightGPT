# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GaslightGPT is a TypeScript-based React ChatGPT web client with comprehensive chat history management and message editing capabilities. The name references the "Gaslit!" label that appears on edited messages. Built with React 18, TypeScript, Vite, Tailwind CSS, Radix UI, and a custom Shadcn/ui component system with light/dark theme support.

**Tech Stack**: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, Shadcn/ui, OpenAI API (gpt-4o-mini default), React Markdown + remark-gfm, Sonner (toasts)

## Development Commands

```bash
# Install dependencies
npm install

# Start local development (runs Express API on :3001 + Vite on :5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Alternative: Test with Vercel's serverless environment (requires prompts)
npm run vercel-dev
```

## Critical Architecture: Dual Backend Pattern

**This is the most important architectural concept to understand.**

The project uses TWO different backends depending on environment:

### Local Development (`npm run dev`)
- Runs Express server (`server-dev.js`) on port 3001
- Runs Vite dev server on port 5173
- Vite proxies `/api/*` requests to Express (configured in `vite.config.js`)
- Express loads `.env` file for OpenAI API key
- Full HMR for frontend code

### Production (Vercel)
- Frontend builds to static files
- Backend runs as Vercel Serverless Function (`api/chat.js`)
- No proxy - direct `/api/chat` endpoint
- Environment variables from Vercel dashboard
- `server-dev.js` is excluded via `.vercelignore`

**Important**: When modifying API logic, you must update BOTH `server-dev.js` AND `api/chat.js` to keep them in sync!

## TypeScript Architecture

### Type System

All TypeScript types are centralized in `/src/types/`:

**`types/chat.ts`** - Core domain types:
```typescript
export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  edited?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  theme: 'light' | 'dark'
  showGaslitLabels: boolean
}
```

**`types/api.ts`** - API request/response types:
```typescript
export interface ChatRequest {
  message: string
  history: Message[]
}

export interface ChatResponse {
  reply: string
}

export interface ChatError {
  error: string
  details?: string
}
```

### Component Architecture

All components are written in TypeScript (`.tsx` files):
- No `React` import needed (React 18+ JSX transform)
- Use explicit interface definitions for props
- Leverage type inference where possible
- Export interfaces for reusability

Example:
```typescript
interface ChatMessageProps {
  message: Message
  onEdit: (messageId: number, newContent: string) => void
  showGaslitLabel?: boolean
}

export function ChatMessage({ message, onEdit, showGaslitLabel = true }: ChatMessageProps) {
  // Component implementation
}
```

## Component Architecture

### Shadcn/ui Pattern

UI components follow Shadcn/ui philosophy:
- Components are **copied** into `/src/components/ui/` (not npm installed)
- Built on Radix UI primitives for accessibility
- Use CVA (class-variance-authority) for variants
- Forward refs for proper React integration
- Located: `/src/components/ui/` (badge, button, card, dialog, input, label, scroll-area, separator, switch, textarea)

### The `cn()` Utility

Located in `/src/lib/utils.ts`:
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Combines `clsx` (conditional classes) + `twMerge` (resolves Tailwind conflicts). Used throughout all components for className composition.

### Custom Hooks

Located in `/src/hooks/`:

**`useLocalStorage.ts`** - Generic localStorage state management:
```typescript
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

**`useAutoResize.ts`** - Textarea auto-resize based on content:
```typescript
export function useAutoResize(textareaRef: RefObject<HTMLTextAreaElement>, value: string)
```

**`useAutoScroll.ts`** - Auto-scroll chat to bottom:
```typescript
export function useAutoScroll<T extends HTMLElement>(
  dependency: any,
  enabled: boolean = true
): RefObject<T>
```

### Chat Storage System

Located in `/src/lib/chatStorage.ts`:

Provides localStorage persistence for chat history:
- `getAllChats()`: Retrieve all conversations
- `saveChat(chat)`: Save/update a conversation
- `deleteChat(chatId)`: Delete a specific chat
- `getChatById(chatId)`: Retrieve single conversation
- `generateChatTitle(messages)`: Generate title from first message
- `clearAllChats()`: Delete all chat history
- `getTheme()` / `setTheme()`: Theme persistence

**Important**: Preserves `createdAt` timestamp when updating existing chats.

### Message Editing System

Key feature that gives the project its name:

1. Both user and assistant messages are editable (click to edit)
2. Edited messages gain `edited: true` flag in state
3. Orange badge with flame icon displays: "Gaslit!"
4. Toggle in settings shows/hides these labels
5. Implementation spans `Chat.tsx` (editing logic) and `ChatMessage.tsx` (UI)

### State Management

State is distributed across components:

**`App.tsx`** (top-level state):
- `chatHistory`: Array of all conversations
- `currentChatId`: Active conversation ID
- `messages`: Messages for current chat
- `theme`: Light/dark theme preference
- `showGaslitLabels`: Badge visibility toggle
- `settingsOpen`: Settings dialog state
- `sidebarOpen`: Sidebar visibility

**`Chat.tsx`** (chat-specific state):
- `input`: Current textarea value
- `isLoading`: API request state

No external state management library - just React hooks and props.

## Key Conventions

### Path Aliasing
`@` resolves to `src/` (configured in `vite.config.js` and `tsconfig.json`):
```typescript
import { cn } from '@/lib/utils'
import { Message } from '@/types'
```

### Theme System
- HSL-based CSS custom properties in `/src/index.css` `:root` and `.dark` sections
- Primary color: `hsl(270 91% 65%)` (bright purple)
- Orange accent: `hsl(24.6 95% 53.1%)` (for "Gaslit!" badges)
- Tailwind extended to use these variables
- Custom animations in `tailwind.config.js`: `fade-in`, `typing-dot`
- Theme toggle in Settings Dialog switches CSS classes on `<html>`

### Keyboard Shortcuts

Implemented in `App.tsx`:
- `Cmd/Ctrl + K`: Start new chat
- `Escape`: Close settings dialog

## API Request Flow

**Frontend → Backend:**
```typescript
POST /api/chat
Body: ChatRequest {
  message: "current user message",
  history: Message[]
}
```

**Backend → OpenAI:**
- Entire conversation history sent for context
- Model: `process.env.OPENAI_MODEL` (default: gpt-4o-mini)
- Returns: `ChatResponse { reply: "assistant response" }`

Both backends (Express and Vercel) implement identical logic but different execution environments.

## Important File Locations

| Purpose | File Path | Notes |
|---------|-----------|-------|
| API (production) | `/api/chat.js` | Vercel serverless function only |
| API (local dev) | `/server-dev.js` | Express server, NOT deployed |
| Root component | `/src/App.tsx` | Top-level state, chat history |
| Main chat UI | `/src/components/Chat.tsx` | Message input, API calls |
| Message display | `/src/components/ChatMessage.tsx` | Editing, copying, "Gaslit!" badge |
| Sidebar | `/src/components/Sidebar.tsx` | Chat history navigation |
| Settings | `/src/components/SettingsDialog.tsx` | Theme toggle, clear history |
| Header | `/src/components/Header.tsx` | Top navigation bar |
| Logo | `/src/components/Logo.tsx` + `LogoIcon.tsx` | SVG logo components |
| Chat storage | `/src/lib/chatStorage.ts` | localStorage management |
| Custom hooks | `/src/hooks/*.ts` | Reusable React hooks |
| Type definitions | `/src/types/*.ts` | TypeScript interfaces |
| Theme colors | `/src/index.css` | `:root` and `.dark` CSS variables |
| Vite proxy | `/vite.config.js` | Lines 12-18, proxies `/api` to :3001 |
| Tailwind config | `/tailwind.config.js` | Animations, theme extensions |
| TypeScript config | `/tsconfig.json` | Compiler options, path aliases |
| UI components | `/src/components/ui/*.tsx` | Shadcn/ui pattern components |
| Utils | `/src/lib/utils.ts` | `cn()` function |

## Common Development Tasks

### Adding a New Feature
1. Define TypeScript types in `/src/types/` if needed
2. Create component in `/src/components/` as `.tsx` file
3. Import into `App.tsx` or parent component and integrate with state
4. Use `cn()` for styling with Tailwind classes
5. If adding API logic, update BOTH `server-dev.js` AND `api/chat.js`

### Adding a New Shadcn/ui Component
1. Component code goes in `/src/components/ui/[component].tsx`
2. Use Radix UI primitives as base (already installed)
3. Apply Tailwind classes and CVA for variants
4. Forward refs for proper React integration
5. Export component and any related types

### Styling Changes
- Theme colors: Modify HSL values in `/src/index.css` `:root` and `.dark`
- Component styles: Use Tailwind via `cn()` utility
- Animations: Add to `tailwind.config.js` `keyframes` section
- Dark mode: Add `.dark` variant classes as needed

### Adding localStorage Features
- Use existing functions in `/src/lib/chatStorage.ts` or add new ones
- Follow pattern: try/catch, JSON.parse/stringify, error logging
- Export pure functions (no React hooks in this file)

### Testing Locally vs Production
- Local: `npm run dev` uses Express + Vite proxy
- Production-like: `npm run vercel-dev` (requires Vercel CLI, prompts on first run)
- Build test: `npm run build && npm run preview`
- Type check: `npm run build` (Vite checks types during build)

## Environment Variables

**Required**: `OPENAI_API_KEY`
**Optional**: `OPENAI_MODEL` (defaults to gpt-4o-mini)

**Local setup**:
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Never commit `.env` (already in `.gitignore`)

**Vercel setup**:
1. Add in Vercel dashboard → Settings → Environment Variables
2. Redeploy after adding

## Debugging Common Issues

**API not responding**:
- Verify correct backend is running (check ports: 3001 for Express, 5173 for Vite)
- Check `.env` file exists with valid API key
- Review browser Network tab for request/response
- For local dev, confirm Vite proxy config is correct

**Styling issues**:
- Ensure `cn()` is used for conditional classes
- Check Tailwind purge config in `tailwind.config.js` `content` array
- Verify HSL values in CSS custom properties
- Check both `:root` and `.dark` selectors for theme colors

**TypeScript errors**:
- Run `npm run build` to check for type errors
- Ensure imports use `@/` path alias correctly
- Check that all props interfaces are properly defined
- Verify types are exported from `/src/types/index.ts`

**Build failures**:
- Confirm all imports use correct paths (relative or `@` alias)
- Check Node.js version (v18+ recommended, specified in `.nvmrc`)
- Verify all dependencies in `package.json`
- Ensure TypeScript config is correct (`tsconfig.json`)

**Chat history issues**:
- Clear localStorage: `localStorage.clear()` in browser console
- Check browser Storage tab (F12 → Application → Local Storage)
- Verify `chatStorage.ts` functions are preserving `createdAt` timestamps

## Design Philosophy

GaslightGPT follows clean, accessible design principles:

1. **No "AI slop" patterns**: Removed excessive purple gradients, over-centered layouts, uniform rounded corners, and stacked backdrop blurs
2. **Varied spacing**: Different border radii (sm, md, lg, xl) and padding for visual hierarchy
3. **Subtle depth**: Single-layer shadows for depth without visual complexity
4. **Theme-aware colors**: CSS custom properties for automatic light/dark adaptation
5. **Accessibility first**: Built on Radix UI for keyboard navigation, focus management, and screen reader support
6. **Orange accents**: "Gaslit!" badges use orange (#f97316) instead of purple for visual distinction

## Unique Aspects

1. **Dual backend architecture**: Express (dev) + Vercel Functions (prod) - must keep in sync
2. **TypeScript throughout**: Full type safety from types through components
3. **"Gaslit" naming**: Playful branding around message editing feature
4. **Full message editing**: Both user AND assistant messages editable (rare in chat UIs)
5. **Shadcn/ui implementation**: Components copied/customized, not npm package
6. **HSL theme system**: Modern, flexible color system with CSS custom properties
7. **Chat history management**: localStorage-based persistence with multiple conversations
8. **Custom hooks**: Reusable logic for localStorage, auto-resize, auto-scroll
9. **Merged SVG logo**: Custom chat bubble + flame icon as single SVG component
10. **Toast notifications**: User feedback for all actions via Sonner
