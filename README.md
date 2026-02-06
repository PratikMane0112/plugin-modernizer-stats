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

### Data Fetching

This project fetches data from the [metadata-plugin-modernizer](https://github.com/jenkins-infra/metadata-plugin-modernizer) repository.


### Development

1.  **Install Dependencies**:

    ```bash
    npm install
    ```
    or

    ```bash
    npm ci 
    ```
    if you want clean install (don't want to change lock files unnecessary)

2.  **Fetch Data** :

    ```bash
    ./fetch-metadata-plugin-modernizer.sh 
    ```
    run the script to fetch the data from the [metadata-plugin-modernizer](https://github.com/jenkins-infra/metadata-plugin-modernizer) repository.


3.  **Run Development Server**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) to view the dashboard locally ...


## 🚀 Deployment

This project is deployed on [Netlify](https://netlify.com). Here you can see the [live demo](https://plugin-modernizer-stats.netlify.app/)

**Note**: The build process automatically fetches the latest metadata from the [metadata-plugin-modernizer](https://github.com/jenkins-infra/metadata-plugin-modernizer) repository during deployment.


## 🛠️ Tech Stack

-   **Frontend**: React 19 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS (Dark Mode optimized)
-   **Visualization**: Apache ECharts for React
-   **Routing**: React Router DOM
-   **Icons**: Lucide React

## 📄 License
MIT
