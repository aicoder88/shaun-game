# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo for "Murder on the Bullet Express", an educational ESL detective game.

- `dev/app/` - Next.js 15 application (main game client)
- `dev/school/sherlock-esl/` - Archived static assets for reference only
- `AGENTS.md` - Repository guidelines and conventions

**Important**: The main development happens in `dev/app/`. See `dev/app/CLAUDE.md` for detailed project documentation.

## Quick Start

```bash
cd dev/app
npm install
npm run dev              # Start dev server at http://localhost:3000
npm run build            # Production build
npm run lint             # ESLint checks
npm run type-check       # TypeScript validation
```

## Project Overview

A production-ready multiplayer browser game built with:
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Phaser 3** game engine for interactive gameplay
- **Supabase** for real-time multiplayer and database
- **Zustand** for state management
- **Tailwind CSS** for styling

Key URLs:
- Student interface: `http://localhost:3000/menu`
- Teacher dashboard: `http://localhost:3000/conductor`

## Architecture Highlights

### Dual-Interface System
- **Students** (`/play`) - Game canvas with inventory/journal panels
- **Teachers** (`/conductor`) - Dashboard with scene control and broadcast messaging

### Real-time Synchronization
- **GameStore** (`src/stores/gameStore.ts`) - React state + Supabase subscriptions
- **GameManager** (`src/game/GameManager.ts`) - Phaser-React bridge and scene coordinator
- Supabase Realtime channels sync room state, chat, and journal entries between teacher and students

### Game Scene Flow
Boot → Menu → Carriage → Mini-games → Accuse → Debrief

Teachers control scene transitions; students interact with suspects, collect clues, and solve mysteries.

## Key Files

### Game Engine
- `src/game/GameManager.ts` - Central coordinator between Phaser and React
- `src/game/scenes/` - Phaser game scenes (CarriageScene, MiniGames, AccuseScene, etc.)
- `src/data/case_01.json` - Case data (suspects, clues, dialogue)

### React Layer
- `src/components/PhaserGame.tsx` - Phaser canvas wrapper
- `src/components/StudentInterface.tsx` - Student UI panels
- `src/components/TeacherControls.tsx` - Teacher dashboard

### Data & State
- `src/stores/gameStore.ts` - Zustand store for multiplayer state
- `src/lib/supabase.ts` - Supabase client setup
- `src/types/` - TypeScript interfaces (database, game, case)

## Development Notes

### Environment Setup
Copy `dev/app/.env.local.example` to `dev/app/.env.local` and add Supabase credentials.

### Code Style
- TypeScript with strict mode
- 2-space indentation
- Tailwind utility classes (no custom CSS)
- Run `npm run lint` and `npm run type-check` before commits

### Testing
Automated tests not yet configured. Manual testing via:
1. Start dev server (`npm run dev`)
2. Open teacher dashboard (`/conductor`), create room
3. Open student interface (`/menu`), join with room code
4. Exercise game flows and verify real-time sync

## Repository Guidelines (from AGENTS.md)

### Commit Style
- Imperative mood: "Fix game loading issues" (not "Fixed" or "Fixes")
- Keep scope focused, add context in commit body when needed

### Pull Requests
- List feature/fix and affected routes/scenes
- Include screenshots for visual changes
- State manual test commands executed

### Security
- Never commit `.env.local` or real credentials
- Use environment variables for URLs and API keys

For complete architecture details, development patterns, and troubleshooting, see `dev/app/CLAUDE.md`.
