# كل الترانيم — Arabic hymn archive

React 19 + Vite + Tailwind v4 site in `web/`. Source design: `figma-Home-Screen.json` (exported by `figma-plugin/`).

## Commands (run in `web/`)
- `npm run dev` / `npm run build`
- `npm run images` — converts `assets-src/*.png` → `src/assets/*.webp` (white → transparent for logo & instruments). Add new raw Figma images to `assets-src/`, never to `src/assets/` directly.
- `npm run format` — Prettier + Tailwind class sorting. `npm run lint` — oxlint.

## Conventions
- RTL first: `<html dir="rtl">`. Use logical utilities (`ms-/me-/ps-/pe-/start/end`). In grids/flex the **first child renders on the right**.
- Colors/fonts/shadows are tokens in `src/index.css` `@theme` (from Figma). Don't hard-code hex in components.
- Fonts: `font-sans` = Tajawal (UI), `font-naskh` = Geeza Pro → Noto Naskh Arabic (hymn titles/lyrics).
- Numbers display with Arabic-Indic digits via `toArabic()` in `src/lib/format.js`.
- Calligraphy/logo PNGs render through `<Calligraphy>` (CSS mask → takes `currentColor`).
- All copy and sample data live in `src/data/content.js`. Contact details there are placeholders.
- Motion: framer-motion (`Reveal` for scroll-in, `TiltCard` for hover tilt). Respect `MotionConfig reducedMotion="user"`.
- Libraries: lenis (smooth scroll), sonner (toasts), lucide-react (UI icons), simple-icons (brand icons), clsx.
