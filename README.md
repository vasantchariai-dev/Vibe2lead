# vibe2lead.diy

A free, single-page website helping British leaders learn AI by doing — not by delegating to others or waiting for training programmes.

## Overview

- **Domain:** vibe2lead.diy
- **Bluesky:** @vibe2lead.diy

## Design philosophy

Trust over polish. GOV.UK meets Money Saving Expert.

- Trustworthy, like a government service or quality newspaper
- Minimal, content-first design
- Fast loading (<1 second target)
- Mobile-first, readable typography

## Tech stack

- Static HTML/CSS
- Vanilla JavaScript (no frameworks)
- Source Serif 4 + Source Sans 3 typography
- Hosted on GitHub Pages / Netlify / Vercel

## Structure

Single page with internal anchor links:

1. Hero section with animated book
2. Step 1: Protect the time
3. Step 2: Invest in the tools
4. Step 3: Apply it to your actual job (audience-specific)
5. Step 4: Hone asking and checking
6. Step 5: Build your team's capability (audience-specific)
7. Resources
8. Glossary
9. About

## Development

Open `index.html` in a browser or serve locally:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Deployment

This is a static site. Deploy to any static hosting:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Files

- `index.html` — Main page with all content
- `styles.css` — All styles (no CSS framework)
- `script.js` — Interactions (slider, navigation, scroll)
- `favicon.svg` — Site icon
- `og-image.svg` — Social sharing image (convert to PNG for production)
