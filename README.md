# Slither

A small, browser-based Snake game built with Next.js and React.

Slither keeps the classic Snake rules while giving the game a focused neon-arcade presentation. The project is intentionally lightweight: the game state, controls, scoring, and board rendering live in a single game component with a small UI primitive for buttons.

## What it does

- 20 × 20 grid-based Snake gameplay
- Keyboard controls: Arrow keys or WASD
- On-screen directional controls for touch devices
- Play, pause, retry, and restart controls
- Score and best-score display
- Mute control UI
- Responsive arcade-style interface
- Vercel Analytics in production

## Tech stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Lucide React**
- **Vercel Analytics**
- **pnpm**

## Project structure

```text
slither/
├── app/
│   ├── globals.css       # Global styles and game presentation
│   ├── layout.tsx        # Root layout and metadata
│   └── page.tsx          # Application entry point
├── components/
│   ├── snake-game.tsx    # Game state, rules, controls and board
│   └── ui/
│       └── button.tsx    # Reusable button primitive
├── lib/
│   └── utils.ts          # Shared class-name utility
├── public/               # Application icons and static assets
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Getting started

### Requirements

- Node.js compatible with the installed Next.js version
- pnpm 12.x

### Install

```bash
pnpm install
```

### Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build
pnpm start
```

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move up | ↑ / W | Up button |
| Move down | ↓ / S | Down button |
| Move left | ← / A | Left button |
| Move right | → / D | Right button |
| Pause / resume | Space / P | Play/Pause button |
| Restart | — | Restart button |

## Game rules

- The snake starts with four segments.
- Eating food increases the score by 10.
- The snake grows when food is collected.
- Hitting the wall ends the game.
- Hitting the snake itself ends the game.
- The opposite direction cannot be selected immediately.

## Development notes

The game currently keeps its state in memory while the page is open. The displayed best score is therefore session-local and is initialized with a placeholder value in the current implementation; it is not a persistent leaderboard.

The sound control is currently a UI state toggle. There is no audio engine in the current implementation.

## Quality expectations

This repository follows the project's engineering standards for:

- clear, maintainable code
- purposeful UI and interaction design
- responsive behavior
- accessible controls and semantics
- evidence-based refactoring
- avoiding unnecessary dependencies and generated boilerplate

Changes should preserve working gameplay and should be validated with a production build before merging.

## Contributing

For changes to this repository:

1. Understand the existing game behavior before editing.
2. Keep changes focused on a clear product or engineering purpose.
3. Avoid adding libraries when the platform or existing code is sufficient.
4. Verify the relevant interaction and responsive behavior.
5. Run `pnpm build` before opening a pull request.

## Repository

GitHub: https://github.com/davidifeanyicelestine586-arch/slither
