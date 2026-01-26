# Plugin Modernizer Stats Visualization

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, static visualization dashboard for tracking the modernization progress of the Jenkins plugin ecosystem. This project consumes data produced by the [Plugin Modernizer Tool](https://github.com/jenkins-infra/plugin-modernizer-tool) and stored in the [Metadata Repository](https://github.com/jenkins-infra/metadata-plugin-modernizer).

## 🎯 Project Goal

As part of the Jenkins GSoC initiative, this tool provides transparency into technical debt reduction across 2000+ Jenkins plugins. It visualizes:
- **Global Migration Status**: Success vs. Failure rates of OpenRewrite recipe applications.
- **Recipe Performance**: Which modernization recipes are failing most frequently.
- **Per-Plugin Reports**: Detailed logs of applied changes, PR links, and error messages.

## 🏗️ Architecture Ecosystem

This project is part of a 4-component ecosystem:
1.  **[Plugin Modernizer Tool](https://github.com/jenkins-infra/plugin-modernizer-tool)**: CLI that runs OpenRewrite recipes on plugins and generates raw reports.
2.  **[Metadata Repository](https://github.com/jenkins-infra/metadata-plugin-modernizer)**: GitHub repository hosting the raw JSON/CSV data.
3.  **[Infra Statistics](https://github.com/jenkins-infra/infra-statistics)**: General Jenkins usage stats (installations, versions).
4.  **Plugin Modernizer Stats (This Project)**: The frontend dashboard meant to integrate with or complement [stats.jenkins.io](https://stats.jenkins.io).

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn

### Data Ingestion
This project requires local data to run. It includes a script to ingest data from a local clone of the metadata repository.

1.  **Clone the Metadata Repository** alongside this project:
    ```bash
    cd ..
    git clone https://github.com/jenkins-infra/metadata-plugin-modernizer.git
    ```

2.  **Run Ingestion Script**:
    ```bash
    cd plugin-modernizer-stats
    npm run ingest
    ```
    *Note: The script expects `metadata-plugin-modernizer` to be a sibling directory.*

### Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

3.  **Build by Production**:
    ```bash
    npm run build
    ```

## 🛠️ Tech Stack

-   **Frontend**: React 19 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS (Dark Mode optimized)
-   **Visualization**: Apache ECharts for React
-   **Routing**: React Router DOM
-   **Icons**: Lucide React

## 📄 License
MIT
