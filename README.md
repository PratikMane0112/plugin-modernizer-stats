# Plugin Modernizer Stats Visualization

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, static visualization dashboard for tracking the modernization progress of the Jenkins plugin ecosystem. This project consumes data produced by the [Plugin Modernizer Tool](https://github.com/jenkins-infra/plugin-modernizer-tool) and stored in the [Metadata Repository](https://github.com/jenkins-infra/metadata-plugin-modernizer).

## 🎯 Project Goal

As part of the Jenkins GSoC initiative, this tool provides transparency into technical debt reduction across 2000+ Jenkins plugins. It visualizes:
- **Global Migration Status**: Success, failure, and pending rates of OpenRewrite recipe applications across 424 plugins.
- **Recipe Performance**: Which modernization recipes are failing most frequently, with per-recipe drill-down.
- **Per-Plugin Reports**: Detailed migration history including baselines, code changes, PR status, CI check runs, and tags.
- **Timeline & Tags**: Monthly migration trends and tag-based categorization.

## 🏗️ Architecture

This project is part of a 4-component ecosystem:

1. **[Plugin Modernizer Tool](https://github.com/jenkins-infra/plugin-modernizer-tool)**: CLI that runs OpenRewrite recipes on plugins and generates raw reports.
2. **[Metadata Repository](https://github.com/jenkins-infra/metadata-plugin-modernizer)**: GitHub repository hosting the raw JSON/CSV data.
3. **[Infra Statistics](https://github.com/jenkins-infra/infra-statistics)**: General Jenkins usage stats (installations, versions).
4. **Plugin Modernizer Stats (This Project)**: The frontend dashboard deployed at [reports.jenkins.io/plugin-modernizer](https://reports.jenkins.io/plugin-modernizer/).

### Data Pipeline

```
metadata-plugin-modernizer (GitHub)
  → fetch-metadata-plugin-modernizer.sh (download & extract)
    → scripts/consolidate.ts (process raw data → site-data/*.json)
      → npm run build (Vite → dist/)
        → publishReports (Jenkins → reports.jenkins.io)
```

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Summary stats, migration status charts, PR stats, recipe performance, timeline, tags distribution, top-failing plugins |
| `/plugins` | Plugin List | Sortable, filterable, paginated list of all 424 plugins with success rates and PR counts |
| `/plugins/:name` | Plugin Detail | Full migration history with all 21 fields: baselines, code changes, check runs, PR links, tags |
| `/recipes` | Recipe List | All 17 recipes with expandable plugin application details |
| `/recipes/:id` | Recipe Detail | Per-recipe deep-dive with status chart, timeline, and plugin applications table |

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm

### Development

1. **Install dependencies**:
    ```bash
    npm ci
    ```

2. **Fetch upstream data**:
    ```bash
    ./fetch-metadata-plugin-modernizer.sh
    ```

3. **Consolidate data** (generates `site-data/*.json` for the UI):
    ```bash
    npx tsx scripts/consolidate.ts
    ```

4. **Start dev server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Production Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## 🚀 Deployment

- **Netlify**: [Live demo](https://plugin-modernizer-stats.netlify.app/)
- **Jenkins Infra**: Deployed via `Jenkinsfile` pipeline to `reports.jenkins.io/plugin-modernizer/` using `publishReports`.

The pipeline runs: `npm ci` → `lint` → `fetch metadata` → `consolidate` → `build` → `deploy`.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (Dark Mode)
- **Visualization**: Apache ECharts for React
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Data Processing**: Node.js + tsx (build-time consolidation)

## 📖 Implementation Details

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the detailed implementation plan, per-file change breakdown, blockers/pros/cons, and next steps.

## 📄 License
MIT
