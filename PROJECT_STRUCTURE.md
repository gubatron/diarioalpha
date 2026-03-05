# World Monitor - Project Structure

## Overview
A real-time dashboard application built with React, Vite, and React Router for monitoring global events, markets, and technology trends.

## Directory Structure

```
world_monitor/
├── public/
│   └── dashboard.png              # Dashboard preview image
├── src/
│   ├── app/                       # Application shell
│   │   ├── App.css                # App-level styles
│   │   ├── App.jsx                # Root component (router + layout)
│   │   ├── index.js               # Barrel exports
│   │   └── rootProviders.jsx      # Composed context providers
│   ├── features/                  # Feature-based modules
│   │   ├── ai-race/               # AI development tracking
│   │   │   ├── components/
│   │   │   │   ├── AiRacePanel.css
│   │   │   │   └── AiRacePanel.jsx
│   │   │   ├── service/
│   │   │   │   └── aiRaceFeedService.js
│   │   │   └── index.js
│   │   ├── blockchain/            # Blockchain/crypto news & stats
│   │   │   ├── components/
│   │   │   │   ├── BlockchainPanel.css
│   │   │   │   └── BlockchainPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── blockchainFeedService.js
│   │   │   └── index.js
│   │   ├── dashboard/             # Main dashboard view
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.css
│   │   │   │   └── Dashboard.jsx
│   │   │   └── index.js
│   │   ├── good-news/             # Positive news feed
│   │   │   ├── components/
│   │   │   │   ├── GoodNewsPanel.css
│   │   │   │   └── GoodNewsPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── goodNewsFeedService.js
│   │   │   └── index.js
│   │   ├── heatmap/               # Sector performance heatmap
│   │   │   ├── components/
│   │   │   │   ├── HeatmapPanel.css
│   │   │   │   └── HeatmapPanel.jsx
│   │   │   └── index.js
│   │   ├── layoffs/               # Tech layoffs tracker
│   │   │   ├── components/
│   │   │   │   ├── LayoffsPanel.css
│   │   │   │   └── LayoffsPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── layoffsFeedService.js
│   │   │   └── index.js
│   │   ├── markets/               # Markets overview & ticker
│   │   │   ├── components/
│   │   │   │   ├── MarketsPanel.css
│   │   │   │   └── MarketsPanel.jsx
│   │   │   ├── TickerStrip/
│   │   │   │   ├── TickerStrip.css
│   │   │   │   └── TickerStrip.jsx
│   │   │   └── index.js
│   │   ├── news/                  # General news feeds
│   │   │   ├── components/
│   │   │   │   ├── NewsPanel.css
│   │   │   │   └── NewsPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── newsFeedService.js
│   │   │   └── index.js
│   │   ├── startups/              # Startup funding tracker
│   │   │   ├── components/
│   │   │   │   ├── StartupsPanel.css
│   │   │   │   └── StartupsPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── startupsFeedService.js
│   │   │   └── index.js
│   │   ├── vc-activity/           # VC activity tracker
│   │   │   ├── components/
│   │   │   │   ├── VCPanel.css
│   │   │   │   └── VCPanel.jsx
│   │   │   ├── service/
│   │   │   │   └── vcFeedService.js
│   │   │   └── index.js
│   │   └── war-watch/             # Conflict/war monitoring
│   │       ├── components/
│   │       │   ├── WarWatchPanel.css
│   │       │   └── WarWatchPanel.jsx
│   │       ├── service/
│   │       │   └── warWatchFeedService.js
│   │       └── index.js
│   ├── common/                    # Shared UI primitives & layout
│   │   ├── feedback/
│   │   │   └── ErrorBoundary/     # Error boundary wrapper
│   │   │       ├── ErrorBoundary.css
│   │   │       └── ErrorBoundary.jsx
│   │   ├── layout/
│   │   │   ├── CategoryTabs/      # Category filter tabs
│   │   │   │   ├── CategoryTabs.css
│   │   │   │   └── CategoryTabs.jsx
│   │   │   ├── CommandModal/      # Command palette modal
│   │   │   │   ├── CommandModal.css
│   │   │   │   └── CommandModal.jsx
│   │   │   ├── Navbar/            # Top navigation bar
│   │   │   │   ├── Navbar.css
│   │   │   │   └── Navbar.jsx
│   │   │   └── SettingsModal/     # User settings modal
│   │   │       ├── SettingsModal.css
│   │   │       └── SettingsModal.jsx
│   │   ├── ui/
│   │   │   ├── NewsWireFeed/      # Reusable news wire component
│   │   │   │   ├── NewsWireFeed.css
│   │   │   │   └── NewsWireFeed.jsx
│   │   │   └── Panel/             # Generic panel wrapper
│   │   │       ├── Panel.css
│   │   │       └── Panel.jsx
│   │   └── visualization/
│   │       ├── DeveloperActivity/ # Chain developer activity graphs
│   │       │   ├── DeveloperActivity.css
│   │       │   └── DeveloperActivity.jsx
│   │       └── GlobalMap/         # Interactive world map
│   │           ├── GlobalMap.css
│   │           ├── GlobalMap.jsx
│   │           └── HotspotModal/  # Map hotspot details
│   │               ├── HotspotModal.css
│   │               └── HotspotModal.jsx
│   ├── core/                      # Cross-cutting concerns
│   │   ├── config/
│   │   │   ├── panels.js          # Panel definitions & categories
│   │   │   ├── regions.js         # Geographic region config
│   │   │   └── themes.js          # Theme/color configurations
│   │   ├── context/
│   │   │   ├── RefreshContext.jsx # Refresh state management
│   │   │   └── ThemeContext.jsx   # Theme state management
│   │   ├── hooks/
│   │   │   ├── index.js           # Hook exports
│   │   │   ├── useDynamicRegions.js
│   │   │   ├── useFeedData.js     # Feed data polling hook
│   │   │   ├── useLocalStorage.js
│   │   │   └── usePanelSettings.js
│   │   ├── services/
│   │   │   ├── base/
│   │   │   │   ├── baseFeedService.js  # Base RSS feed service
│   │   │   │   └── feedConfig.js       # Feed URL configuration
│   │   │   ├── map/
│   │   │   │   └── mapFeedService.js   # Map-specific feed service
│   │   │   ├── chainStats.js      # Blockchain statistics (DefiLlama, beaconcha.in)
│   │   │   ├── githubActivity.js  # GitHub commit activity
│   │   │   └── index.js           # Service barrel exports
│   │   └── utils/
│   │       ├── dateHelpers.js     # Date formatting utilities
│   │       ├── fetchUtils.js      # HTTP fetch + RSS parse utilities
│   │       ├── helpers.js         # General helpers
│   │       └── index.js           # Utility exports
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Application entry point
├── .gitignore
├── index.html                     # HTML entry point
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js                 # Vite build configuration with path aliases
└── PROJECT_STRUCTURE.md           # This file
```

## Path Aliases (vite.config.js)

| Alias | Resolves to |
|---|---|
| `@` | `src/` |
| `@app` | `src/app/` |
| `@features` | `src/features/` |
| `@common` | `src/common/` |
| `@core` | `src/core/` |
| `@components` *(legacy)* | `src/common/` |
| `@services` *(legacy)* | `src/core/services/` |
| `@hooks` *(legacy)* | `src/core/hooks/` |
| `@config` *(legacy)* | `src/core/config/` |
| `@context` *(legacy)* | `src/core/context/` |
| `@utils` *(legacy)* | `src/core/utils/` |

## Key Features

- Draggable and reorderable panels
- Category-based filtering
- Command palette for quick actions
- Real-time data refresh
- Dark theme with customizable colors
- GitHub-style contribution graphs for developer activity
- Interactive world map with conflict hotspots

## Tech Stack
- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **CSS Variables** - Theming system
