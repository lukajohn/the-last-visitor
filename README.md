# The Last Visitor

A free, browser-based 2D psychological detective-horror prototype set in 1960s California. The game is a fictionalized investigation inspired by the public record surrounding William Dale Archerd. Its bedroom, documents, detective, dialogue, and case reconstruction are dramatized, not historical exhibits.

**Play:** after enabling GitHub Pages and merging to `main`, the game is published at `https://lukajohn.github.io/the-last-visitor/`.

## Features

- Original pixel-art scenes rendered with the HTML5 Canvas 2D API.
- Six evidence items to discover and inspect.
- A working evidence board with three deduction pairs.
- Branching interrogation topics that require the relevant deductions.
- Two case-review outcomes, based on the player's investigation.
- Subtle environmental horror, optional generated rain ambience, and responsive controls.
- Local browser saves using versioned `localStorage` data.
- No backend, paid assets, API keys, or account system.

## Technology

- TypeScript (strict mode)
- Vite
- HTML5 Canvas 2D
- Vanilla HTML and CSS
- Web Audio API (optional ambience)
- GitHub Actions + GitHub Pages

## Local development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks and production build

```bash
npm run typecheck
npm run build
npm run preview
```

The production output is written to `dist/`.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` builds and deploys the site whenever changes are pushed to `main` (and can also be started manually).

In the repository settings, open **Pages** and set **Build and deployment → Source** to **GitHub Actions**. After the workflow succeeds, the game is available at:

`https://lukajohn.github.io/the-last-visitor/`

The Vite base path is configured for this repository's Pages URL in GitHub Actions.

## Controls

- **Mouse / touch:** inspect room objects, select evidence, and choose dialogue topics.
- **E:** inspect the currently hovered object.
- **I / J:** open the journal and collected evidence.
- **B:** open the evidence board.
- **Esc:** close the active panel or return to the title screen.

There is no timer. Audio is optional and starts only after the player enables it.

## Historical framing

The game does not reproduce actual police exhibits or claim that dramatized documents and dialogue are authentic. It distinguishes the three murder convictions from other deaths that were investigated as suspected cases. The final result is a game narrative, not a representation of a historical verdict.
