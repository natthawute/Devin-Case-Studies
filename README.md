# Devin Case Studies Explorer

A static web app for exploring the customer case studies published at
[devin.ai/customers](https://devin.ai/customers), organized by use-case
category, industry, and company size — from big-picture overview down to
the full story of each case.

## Features

- **Overview dashboard** — headline stats plus faceted chips for use cases,
  industries, and company sizes (with counts).
- **Filter & search** — combine facets and free-text search to narrow the
  card grid.
- **Drill down** — each card opens a detail page with key metrics, customer
  quotes, the full story, and a link to the original case study.

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
```

## Data pipeline

- `data/raw/*.trim.txt` — text content extracted from each case-study page.
- `scripts/meta.json` — hand-curated metadata per case (industry, company
  size, region, use-case tags, key metrics, summary).
- `scripts/build_data.py` — merges the two into `src/data.json`
  (run via `npm run data`).
