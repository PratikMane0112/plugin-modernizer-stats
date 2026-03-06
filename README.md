# Plugin Modernizer Stats Visualization

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A static visualization site prototype for tracking the modernization & migration progress of the [Jenkins Plugin Modernizer Tool](https://github.com/jenkins-infra/plugin-modernizer-tool). This project consumes data stored in the [Metadata Repository](https://github.com/jenkins-infra/metadata-plugin-modernizer) during migration and modernization of a plugin (w.r.t applied recipe & scheduled github action workflows) by plugin modernizer tool.

## Project Goal

This project will make the exploration of `metadata-plugin-modernizer` data smooth and with the additional power of UI components (such as dashboard, charts, graphs, etc) will make end to end stats analysis for each plugin & recipe in a more efficient way. 

- **Global Migration Status** — Success, failure, and pending rates across 400+ plugins.
- **Recipe Performance** — Which modernization recipes are failing most frequently, with per-recipe drill-down.
- **Per-Plugin Reports** — Detailed migration history including baselines, code changes, PR status, CI check runs & tags.
- **Timeline & Tags** — Monthly migration trends and tag-based categorization.

### Pages

| Route           | Page          | Description                                                                                        |
|-----------------|---------------|----------------------------------------------------------------------------------------------------|
| `/`             | Dashboard     | Summary stats, migration/PR status charts, recipe performance, timeline, tags, top-failing recipes |
| `/plugins`      | Plugin List   | Virtualized, searchable list of all plugins with GitHub links                                      |
| `/plugins/:name`| Plugin Detail | Full migration history — status, PRs, timestamps, failed migrations CSV                            |
| `/recipes`      | Recipe List   | All recipes with success rate badges and debounced search                                          |
| `/recipes/:id`  | Recipe Detail | Per-recipe status chart, plugin application table                                                  |

## Getting Started

### Prerequisites

- **Node.js** ≥ 22 (LTS)
- **npm** ≥ 10
- **Python 3** ≥ 3.9 (for the data consolidation script — stdlib only, no pip install needed)
- **bash** (for the fetch script)

### 1. Clone the repository

```bash
git clone https://github.com/PratikMane0112/plugin-modernizer-stats.git
cd plugin-modernizer-stats
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Fetch upstream data

Downloads the latest data from [jenkins-infra/metadata-plugin-modernizer](https://github.com/jenkins-infra/metadata-plugin-modernizer) into `.tmp/`:

```bash
./scripts/fetch-metadata-plugin-modernizer.sh
```

### 4. Consolidate data

Parses `summary.md` and transforms raw data into validated JSON files in `public/plugin-modernizer-stats/`.
Includes strict type enforcement and cross-field validation

```bash
python3 scripts/consolidate.py
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard locally ...


## Deployment

The protoype is deployed on netlify. Here is a live demo: [plugin-modernizer-stats.netlify.app](https://plugin-modernizer-stats.netlify.app/)


## Tech Stack

| Category            | Technology                             |
|---------------------|----------------------------------------|
| Frontend            | React 19 + TypeScript (strict mode)    |
| Build Tool          | Vite                                   |
| Styling             | Tailwind CSS v4 (dark mode)            |
| Visualization       | Apache ECharts via `echarts-for-react` |
| Routing             | React Router DOM v7                    |
| List Virtualization | `@tanstack/react-virtual`              |
| Icons               | Lucide React                           |
| Data Processing     | Python 3 (stdlib only, build-time)     |

## � Project Structure

```
├── scripts/
│   ├── fetch-metadata-plugin-modernizer.sh   # Downloads upstream data
│   └── consolidate.py                        # Transforms raw MD → validated JSON (Python 3)
├── src/
│   ├── lib/dataClient.ts                     # Centralized fetch layer with caching
│   ├── hooks/useMetadata.ts                  # React hooks for data access
│   ├── components/
│   │   ├── Layout.tsx                        # Sidebar nav, mobile responsive
│   │   ├── Skeleton.tsx                      # Loading skeletons
│   │   └── ErrorBanner.tsx                   # Error display with retry
│   ├── pages/
│   │   ├── Dashboard.tsx                     # KPI cards, 5 charts
│   │   ├── PluginList.tsx                    # Virtualized plugin list
│   │   ├── PluginDetail.tsx                  # Plugin migration details
│   │   ├── RecipeList.tsx                    # Virtualized recipe list
│   │   └── RecipeDetail.tsx                  # Recipe drill-down
│   ├── types.ts                              # All TypeScript interfaces
│   ├── App.tsx                               # Router + lazy loading
│   └── main.tsx                              # Entry point
├── public/                                   # Static assets (favicon, icons)
├── netlify.toml                              # Netlify build config
└── package.json
```

## 📄 License

MIT
