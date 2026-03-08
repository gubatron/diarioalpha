# World Monitor Client

A React-based dashboard for monitoring world data with real-time updates, interactive maps, and customizable panels.

## Tech Stack

- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **React Router** - Client-side routing
- **D3.js** - Data visualization
- **Axios** - HTTP client
- **TopoJSON** - Map data handling

## Project Structure

```
src/
├── app/           # Main application component and styles
├── config/        # Configuration files
├── context/       # React context providers (Theme, I18n, Refresh)
├── features/      # Feature modules (Dashboard, Map, Navigation)
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization setup
├── services/      # API and external service integrations
└── utils/         # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Optional variables:
- `VITE_GITHUB_TOKEN` - GitHub Personal Access Token for increased API rate limits
- `DEV_SERVER_PORT` - Development server port (default: 3000)
- `PREVIEW_SERVER_PORT` - Preview server port (default: 3000)

### Development

```bash
npm run dev
```

Opens the dev server at http://localhost:3000 (or configured port).

### Build

```bash
npm run build
```

Produces optimized build output in `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Features

- **Dashboard** - Customizable panels with real-time data
- **Map View** - Interactive geographic visualization
- **Theme Support** - Light/dark mode toggle
- **Internationalization** - Multi-language support
- **Command Palette** - Quick navigation and actions

## API Proxy

The dev server includes a proxy for Yahoo Finance API at `/api/yahoo`.

## License

MIT
