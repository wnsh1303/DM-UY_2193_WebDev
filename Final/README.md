# Finance Daily

A minimal, responsive financial news website built as the final project for **DM-UY 2193 Introduction to Web Development** at NYU. The site delivers stock, currency, cryptocurrency, and macroeconomic news with embedded live market charts and data visualizations.

## Live Demo

**[https://wnsh1303.github.io/DM-UY_2193_WebDev/](https://wnsh1303.github.io/DM-UY_2193_WebDev/)**

Hosted on GitHub Pages.

## Overview

Finance Daily is a multi-page news site that grew out of a Midterm project. The Midterm version was a static HTML site with three page types (home, category, article) and a responsive layout. For the Final, the site was rearchitected so that every article lives in a single JSON data file (`articles.json`) and every page renders dynamically from that data — making content updates a one-line change instead of rewriting HTML.

The site also integrates two third-party visualization libraries:
- **TradingView** widgets for live stock, currency, and crypto price charts
- **Chart.js** for custom economic indicator charts (CPI, GDP, Fed Funds Rate, etc.)

## Features

### Inherited from Midterm
- Home page with featured article and category previews
- Dedicated category pages (Stocks, Currencies, Cryptos, Economics)
- Article detail page with metadata (author, date, source)
- Fully responsive layout (mobile / tablet / desktop)

### Added in Final
- **JSON-driven content** — All 33 articles live in `articles.json`; every page fetches and renders dynamically
- **Single-template article page** — One `article.html` serves every article, routed via `?id=` URL parameter
- **Search page** with multi-condition filtering:
  - Category radio (single-select)
  - Source checkboxes with "All sources" toggle (multi-select)
  - Full-text search across title, source, author, description, and content
  - Newest / Oldest sorting
  - Progressive "Load More" rendering (5 results at a time)
- **TradingView Ticker Tape** in the global header (S&P 500, NASDAQ, BTC, EUR/USD)
- **TradingView Advanced Chart** auto-injected into every Stocks / Currencies / Cryptos article based on the article's `ticker` field
- **Chart.js economic indicator charts** auto-rendered on Economics articles from each article's `chartData` object
- **Hero image** at the top of every article body, sourced from the article's `image` field

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Data | Static JSON (`articles.json`) |
| Charts | [Chart.js](https://www.chartjs.org/) v4.4.7 (CDN) |
| Live charts | [TradingView Widgets](https://www.tradingview.com/widget/) (embed scripts) |

No build tools, no frameworks, no backend — the entire site runs as static files served from any HTTP server.

## Project Structure

```
Final_Project/
├── index.html              # Home page
├── stocks.html             # Category page — Stocks
├── currencies.html         # Category page — Currencies
├── cryptos.html            # Category page — Cryptos
├── economics.html          # Category page — Economics
├── article.html            # Single article template (uses ?id= query)
├── search.html             # Search page
├── style.css               # All site styles
├── script.js               # All site logic (rendering, search, charts)
├── articles.json           # All article data
├── img/                    # Article hero images
└── README.md
```

## Running Locally

Because the site uses `fetch()` to load `articles.json`, opening the HTML files directly via `file://` will be blocked by the browser's CORS policy. A local HTTP server is required.

### Option 1: VS Code Live Server

1. Install the **Live Server** extension by Ritwick Dey
2. Right-click `index.html` → **Open with Live Server**
3. The site opens at `http://127.0.0.1:5500`

### Option 2: Python

```bash
# from the Final_Project directory
python -m http.server 8000
# then visit http://localhost:8000
```

### Option 3: Node.js

```bash
npx serve .
```

## Architectural Highlights

### Single-template article page

Every article — whether stocks, currencies, cryptos, or economics — is rendered by a single `article.html` template. The page reads `?id=stocks-3` from the URL, looks up the matching record in `articles.json`, and assembles the body dynamically. This means 33 articles share one HTML file and one rendering function (`renderArticlePage` in `script.js`).

### Conditional visualization based on data shape

The article renderer inspects each article's data and picks the right visualization automatically:

- If `article.ticker` is set and not `"none"` → inject a TradingView Advanced Chart
- If `article.chartData` is set → render a Chart.js chart from the embedded dataset
- Otherwise → text-only article

This keeps the HTML clean and lets new data types be added by editing only `articles.json`.

### Multi-condition search

The search page combines three filters with AND logic (category × source × text), where text search itself is OR-matched across five fields (title, source, author, description, content). All comparisons are lowercased for case-insensitive matching, and every filter change re-runs the search instantly — no "Apply" button needed.

## What I Learned

- **Data / view separation** — JSON-driven rendering is dramatically more maintainable than hardcoded HTML. Adding a new article is a single JSON entry; no markup duplication, no risk of inconsistency between pages.
- **Asynchronous JavaScript** — `fetch()` + Promises for loading data, and the importance of running from an HTTP server (not `file://`) to avoid CORS blocks.
- **Third-party widget integration** — TradingView's embed pattern requires creating a `<script>` tag and writing JSON config to its `textContent` (not `innerHTML`), which is a non-obvious detail.
- **State synchronization** — Wiring multiple filter inputs (radios, checkboxes, an "All" toggle) so that they stay consistent both ways was a small but instructive exercise.

## Issues Encountered

The most significant blocker was that `fetch()` is blocked under the `file://` protocol because the browser treats the origin as `null` and rejects cross-origin requests. The Midterm version, which used only static HTML and `<img>` tags, did not have this issue because those resource types are exempt. Solution: switched to running the site through VS Code Live Server, which serves files over `http://127.0.0.1:5500`.

## Next Steps

If I had more time and tools, I would:

- **Backend** — Build a Node.js + Express + MongoDB backend so articles can be created and edited through an admin interface instead of by hand-editing JSON
- **Real news API** — Integrate a live feed (NewsAPI, Alpha Vantage) so the homepage reflects actual current news
- **User accounts** — Sign-in, bookmarks, reading history
- **Dark mode toggle**
