---
name: testing-case-studies-explorer
description: Test the Devin Case Studies Explorer web app end-to-end (dashboard, facet filters, search, detail pages). Use when verifying UI or data-pipeline changes in this repo.
---

# Testing the Case Studies Explorer

## Setup
- `npm install` then `npm run dev` — Vite serves at http://localhost:5173. No backend, no credentials needed.
- If the data pipeline changed, regenerate first: `npm run data` (runs `scripts/build_data.py data/raw` to rebuild `src/data.json`), then verify `npm run build` succeeds.

## Deriving expected values (important)
Filter counts and search results must be computed from data, not guessed. Before writing assertions, run a quick check against `src/data.json`, e.g.:

```bash
python3 -c "
import json
d=json.load(open('src/data.json'))['cases']
print(len(d), 'cases')
print(len([c for c in d if 'Testing & QA' in c['useCases']]), 'Testing & QA')
"
```

## Golden-path test flow
1. Load `#/` — assert stat boxes (case-study count, industries, categories) and "N of N case studies".
2. Click a use-case chip — count in results bar must equal the chip's count badge.
3. Add an industry chip — count must equal the intersection computed from data.json; verify exact company cards.
4. Type a distinctive word in search (pick one that matches exactly one case's company/title/summary — search only covers those three fields, not the story body).
5. Click a card — URL becomes `#/case/<slug>`; assert metric boxes, story sections, quotes, and the "Read the original case study" link.
6. Click "← All case studies" — filters reset, full grid restored.

## Gotchas
- Routing is hash-based (`#/case/<slug>`); a hard refresh on a detail page should still render it.
- Cards are sorted alphabetically by company name.
- Source pages on devin.ai duplicate every blockquote as a following paragraph; `scripts/build_data.py` dedupes them, but attribution lines can still appear as trailing paragraphs — treat as cosmetic unless content is wrong.
- If raw content needs re-scraping, pages might be fetched with `curl -sL https://devin.ai/customers/<slug>`; each page also embeds a featured (Nubank) article before the real `<h1>` — content extraction must start at the page's own `<h1>`.

## Devin Secrets Needed
None — the app is fully static and public.
