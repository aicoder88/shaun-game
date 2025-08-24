# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sherlock ESL** is a React-based educational game where students play as Sherlock Holmes on a mystery train adventure. The game progresses through three phases: Victorian steampunk, space journey, and cyborg encounter. It's designed for ESL students aged 12-15 to learn English vocabulary through immersive detective gameplay.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core State Management
- **Context API**: Game state is managed through `src/context/GameContext.tsx` using React's useReducer
- **Game State**: Centralized state includes player/teacher characters, mysteries, inventory, current carriage, and game phase
- **Actions**: Well-defined action types for state updates (SET_CURRENT_CARRIAGE, COMPLETE_MYSTERY, etc.)

### Key Components Structure
- **App.tsx**: Main application with navigation between 4 views (story, train, carriage, customize)
- **GameProvider**: Wraps the entire app providing game state context
- **Mini-Games**: Located in `src/components/MiniGames/` directory
  - `DeductionGame.tsx`: Evidence analysis and suspect accusation
  - `EvidenceSearch.tsx`: Hidden clue finding with magnifying glass
  - `LetterReconstruction.tsx`: Torn letter puzzle assembly

### Type System
- **Game Types**: Comprehensive TypeScript interfaces in `src/types/game.ts`
- **Key Interfaces**: Character, Mystery, Evidence, Suspect, GameState, MiniGame
- **Dual Character System**: Both player (Sherlock) and teacher (Dr. Watson) characters

### Styling Architecture
- **Multiple Theme Files**: `src/styles/` contains glassmorphic.css, simple.css, steampunk.css
- **CSS Variables**: Consistent color scheme using custom properties (--mystery-purple, --mystery-amber, etc.)
- **Visual Effects**: Particle system for atmospheric background animations

### Game Progression Logic
- **10 Carriages**: Each with unique mysteries spanning 3 game phases
- **Phase Transitions**: steampunk → space → cyborg as players progress
- **Unlockable Content**: Items, carriages, and customizations unlock based on progress
- **Educational Integration**: Vocabulary learning embedded in mystery-solving mechanics

## Development Notes

- Built with React 19 + TypeScript + Vite
- Uses modern ESLint config with React hooks and TypeScript rules
- No external state management libraries - relies on React Context + useReducer
- Educational game design focuses on contextual English learning through immersive storytelling