# The Last Visitor — Arcade

**The Last Visitor** has been rebuilt as an original, browser-based arcade platformer.

It keeps the name, eerie atmosphere, rain, mysterious visitor theme, and pixel-art identity, but replaces the detective interface with a fast **run / jump / stomp / collect / reach-the-door** game.

## Gameplay

- 3 handcrafted worlds
- Side-scrolling camera
- Running, acceleration, jumping and coyote-time controls
- Stompable roaming enemies
- Coins and score
- Temporary power-up
- Hazards and gaps
- 3 lives
- Keyboard and touch controls
- No external game assets
- No backend or account required

### Controls

**Desktop**
- A / D or ← / → — move
- W / ↑ / Space — jump
- P / Esc — pause

**Mobile**
- On-screen left, right and jump buttons

### Design direction

This is **Mario-like in genre and mechanical language**, but it does not use Nintendo characters, sprites, sounds, levels, music, trademarks, or other proprietary assets.

The visual direction is an original dark indie arcade style: rainy streets, empty houses, muted neon, chunky pixel shapes, and a slightly haunted atmosphere.

## Development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

The production build is written to `dist/`.

## Deployment

GitHub Actions builds the Vite app and publishes it through GitHub Pages.

Play online:

https://lukajohn.github.io/the-last-visitor/
