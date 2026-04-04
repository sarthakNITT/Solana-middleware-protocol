# Sendra — Landing Page

A premium, dark-themed landing page for Sendra — a Solana transaction reliability layer.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Framer Motion** (scroll animations, entrance animations)
- **DM Sans** + **JetBrains Mono** (Google Fonts)

## Project Structure

```
app/
  layout.tsx       ← Root layout with font imports
  page.tsx         ← Main landing page (all components inline)
  globals.css      ← Tailwind base + font config
tailwind.config.ts
package.json
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

## File placement

Place these files in your Next.js App Router project:

| File            | Destination         |
|-----------------|---------------------|
| `page.tsx`      | `app/page.tsx`      |
| `layout.tsx`    | `app/layout.tsx`    |
| `globals.css`   | `app/globals.css`   |
| `tailwind.config.ts` | root          |
| `package.json`  | root                |

## Sections

1. **Hero** — Bold heading with parallax fade-out, stats strip
2. **Scroll-Lit Text** — Words light up from grey → white on scroll (Framer Motion `useScroll`)
3. **Pipeline Flow** — Simulate → Optimize → Route → Send → Retry
4. **Features Grid** — 4 core capability cards with hover glows
5. **Demo Terminal** — Animated live log stream with restart button
6. **CTA Band** — Final call to action
7. **Footer** — Minimal

## Key Design Decisions

- **Color**: Pure `#080808` base, subtle `indigo-500` accent glow
- **Typography**: DM Sans (light/extralight headings), JetBrains Mono (terminal, labels)
- **Grid background**: SVG dot grid at 3.5% opacity with radial gradient overlay
- **Animations**: All entrance animations use `useInView` with `once: true`
