# PhaserX

PhaserX is a high-speed, 8-bit futuristic lane-dodging game built with Phaser 4 and TypeScript. Pilot a ship through falling barriers, survive each phase, and unlock all five factory transmissions.

## Features

- Infinite left and right lanes with keyboard controls (`A` / `D` or `←` / `→`).
- Four difficulty modes with distinct lives, timers, and acceleration intervals.
- Five unlockable phases, each with its own soundtrack.
- In-game timer, hull display, speed surges, fullscreen play, and a pause menu.

## Story

A company owns every planet and exploits the workers who keep it running. The player steals a ship after uncovering proof of the abuse. Across five phases—The Boss, The Staff, The Product, The Company, and The Factory—the player chooses whether the rebellion protects workers, pursues revenge, or lives with a compromise. Every phase includes a briefing and aftermath decision; the accumulated choices decide the final outcome for the planets.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local address printed by Vite (normally `http://localhost:8080`).

## Build

```bash
pnpm build
```

This writes the deployable static site to `dist/`.

## Deploy to Cloudflare

The project is configured for Cloudflare Workers static assets in [wrangler.jsonc](./wrangler.jsonc). The Cloudflare build command is `pnpm build` and the static output directory is `dist`.

To deploy from your machine:

```bash
pnpm exec wrangler login
pnpm cf:deploy
```

To preview the static deployment configuration locally:

```bash
pnpm cf:dev
```

## Audio credits

- Music: [Multifaros — The Factory](https://freemusicarchive.org/music/Multifaros/The_Factory/)
- Sound effects: [freesound_community](https://pixabay.com/pt/users/freesound_community-46691455/) (ship flight and velocity surge)
- Sound effects: [universfield](https://pixabay.com/pt/users/universfield-28281460/) (barrier near-miss swoosh)

## License

MIT © cassiofernando. See [LICENSE](./LICENSE).
