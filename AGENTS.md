# Repository Guidelines

## Project Structure & Module Organization
- `dev/app` hosts the Next.js 15 game client. Key folders: `src/app` for route entries, `src/game` for Phaser scenes, `src/components` for UI blocks, `src/stores` for Zustand state, and `public` for shared assets. Keep Tailwind tokens in `tailwind.config.ts`.
- `dev/school/sherlock-esl` contains archived static assets; use it only as reference when porting legacy flows.

## Build, Test, and Development Commands
- `cd dev/app && npm install` installs runtime and build dependencies.
- `npm run dev` launches the Next.js dev server with hot reloads; visit `http://localhost:3000/menu` to reach the main menu.
- `npm run build` creates the production bundle; `npm start` runs the compiled output.
- `npm run lint` enforces the ESLint + `eslint-config-next` rules; `npm run type-check` runs `tsc --noEmit` to validate types before pushing.

## Coding Style & Naming Conventions
- Use TypeScript, React hooks, and 2-space indentation. Route files follow the App Router naming (e.g. `src/app/menu/page.tsx`); shared components stay in PascalCase under `src/components`.
- Favor Tailwind utility classes; keep reusable Tailwind snippets in `src/lib`.
- Run `npm run lint` before committing; no Prettier is configured, so align formatting with existing files.

## Testing Guidelines
- Automated tests are not yet configured. Validate changes by running `npm run lint`, `npm run type-check`, and exercising flows locally in the dev server.
- When adding tests, colocate unit tests beside the code (`*.test.tsx`) and ensure they run via `npm test` once the script exists.

## Commit & Pull Request Guidelines
- Follow the existing imperative style (`Fix game loading issues`). Keep scope focused and include context in the body when needed.
- PRs should list the feature or fix, mention affected routes/scenes, include screenshots or clips for visual changes, and state the manual test commands executed.

## Security & Configuration Tips
- Copy `dev/app/.env.local.example` to `.env.local` and fill Supabase and analytics keys. Never commit real credentials.
- Prefer configuring environment-specific URLs through env vars rather than hardcoding inside scenes or services.
