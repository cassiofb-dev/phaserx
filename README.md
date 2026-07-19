# PhaserX

PhaserX is a high-speed, 8-bit futuristic lane-dodging game built with Phaser 4 and TypeScript. Pilot a ship through falling barriers, survive each phase, and unlock all five factory transmissions.

## Features

- Infinite left and right lanes with keyboard controls (`A` / `D` or `←` / `→`).
- Four difficulty modes with distinct lives, timers, and acceleration intervals.
- Five unlockable phases, each with its own soundtrack.
- In-game timer, hull display, speed surges, fullscreen play, and a pause menu.

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
- Sound effects: [freesound_community](https://pixabay.com/pt/users/freesound_community-46691455/)

## License

MIT © cassiofernando. See [LICENSE](./LICENSE).
