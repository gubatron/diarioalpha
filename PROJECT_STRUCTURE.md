# World Monitor - Project Structure

## Directory Structure
```
world_monitor/                         # Root: Real-time monitoring dashboard
│
├── client/                            # React frontend application (Vite)
│   │
│   ├── public/                        # Static assets served at root
│   │   └── dashboard.png              # Dashboard preview image
│   │
│   ├── src/                           # Application source code
│   │   │
│   │   ├── app/                       # Application entry point and routing
│   │   │   ├── App.jsx                # Main component with route definitions
│   │   │   ├── App.css                # App-level styles
│   │   │   ├── main.jsx               # React DOM render entry
│   │   │   └── index.css              # Global styles and font imports
│   │   │
│   │   ├── config/                    # App configuration
│   │   │   ├── panels.js              # Panel definitions and categories
│   │   │   ├── regions.js             # Geographic hotspots and markers
│   │   │   └── themes.js              # Color theme definitions
│   │   │
│   │   ├── context/                   # React Context providers for global state
│   │   │   ├── RefreshContext.jsx      # Global refresh trigger
│   │   │   └── ThemeContext.jsx        # Theme state management
│   │   │
│   │   ├── features/                  # Feature-based modules (domain-driven)
│   │   │   │
│   │   │   ├── ai-race/              # AI company news feed
│   │   │   │   ├── AiRacePanel.jsx
│   │   │   │   ├── AiRacePanel.css
│   │   │   │   ├── aiRaceFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── blockchain/            # Crypto news + on-chain metrics
│   │   │   │   ├── BlockchainPanel.jsx
│   │   │   │   ├── BlockchainPanel.css
│   │   │   │   ├── blockchainFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── dashboard/             # Main dashboard page
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Dashboard.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── good-news/             # Positive news feed
│   │   │   │   ├── GoodNewsPanel.jsx
│   │   │   │   ├── GoodNewsPanel.css
│   │   │   │   ├── goodNewsFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── heatmap/               # Sector performance heatmap
│   │   │   │   ├── HeatmapPanel.jsx
│   │   │   │   ├── HeatmapPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── layoffs/               # Tech layoffs tracker
│   │   │   │   ├── LayoffsPanel.jsx
│   │   │   │   ├── LayoffsPanel.css
│   │   │   │   ├── layoffsFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── map/                   # Interactive global map
│   │   │   │   ├── Map.jsx
│   │   │   │   ├── Map.css
│   │   │   │   ├── index.js
│   │   │   │   └── components/
│   │   │   │       └── GlobalMap/
│   │   │   │           ├── GlobalMap.jsx
│   │   │   │           ├── GlobalMap.css
│   │   │   │           └── HotspotModal/
│   │   │   │               ├── HotspotModal.jsx
│   │   │   │               └── HotspotModal.css
│   │   │   │
│   │   │   ├── markets/               # Stock & crypto prices
│   │   │   │   ├── MarketsPanel.jsx
│   │   │   │   ├── MarketsPanel.css
│   │   │   │   ├── index.js
│   │   │   │   └── TickerStrip/
│   │   │   │       ├── TickerStrip.jsx
│   │   │   │       └── TickerStrip.css
│   │   │   │
│   │   │   ├── news/                  # General RSS news panel
│   │   │   │   ├── NewsPanel.jsx
│   │   │   │   ├── NewsPanel.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── startups/              # Startup funding rounds
│   │   │   │   ├── StartupsPanel.jsx
│   │   │   │   ├── StartupsPanel.css
│   │   │   │   ├── startupsFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── vc-activity/           # VC fund activity
│   │   │   │   ├── VCPanel.jsx
│   │   │   │   ├── VCPanel.css
│   │   │   │   ├── vcFeedService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── war-watch/             # Defence & conflict news
│   │   │       ├── WarWatchPanel.jsx
│   │   │       ├── WarWatchPanel.css
│   │   │       ├── warWatchFeedService.js
│   │   │       └── index.js
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── index.js               # Barrel exports
│   │   │   ├── useDynamicRegions.js   # Dynamic region loading
│   │   │   ├── useFeedData.js         # Polling hook for all feeds
│   │   │   ├── useLocalStorage.js     # localStorage persistence
│   │   │   └── usePanelSettings.js    # Panel visibility settings
│   │   │
│   │   ├── services/                  # Data fetching services
│   │   │   ├── index.js               # Barrel exports
│   │   │   ├── baseFeedService.js     # Core RSS fetch/parse logic
│   │   │   ├── feedConfig.js          # Centralized RSS feed URL registry
│   │   │   ├── mapFeedService.js      # Map-specific data feeds
│   │   │   ├── chainStats.js          # Blockchain on-chain metrics
│   │   │   ├── githubActivity.js      # GitHub activity stats
│   │   │   └── newsFeedService.js     # News RSS feed service
│   │   │
│   │   ├── shared/                    # Reusable shared components
│   │   │   ├── feedback/              # Error handling components
│   │   │   │   └── ErrorBoundary/
│   │   │   │       ├── ErrorBoundary.jsx
│   │   │   │       └── ErrorBoundary.css
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── CategoryTabs/
│   │   │   │   ├── CommandModal/
│   │   │   │   ├── Navbar/
│   │   │   │   └── SettingsModal/
│   │   │   ├── ui/                    # UI primitives
│   │   │   │   ├── NewsWireFeed/
│   │   │   │   └── Panel/
│   │   │   └── visualization/         # Data visualization
│   │   │       └── DeveloperActivity/
│   │   │
│   │   └── utils/                     # Utility functions
│   │       ├── index.js               # Barrel exports
│   │       ├── dateHelpers.js         # Date formatting
│   │       ├── fetchUtils.js          # CORS proxy fetch
│   │       └── helpers.js             # General helpers
│   │
│   ├── .env.example                   # Environment variable template
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies and npm scripts
│   ├── package-lock.json              # Locked dependency tree
│   └── vite.config.js                 # Vite bundler configuration
│
├── .gitignore                         # Root git ignore rules
├── PROJECT_STRUCTURE.md               # This file
└── README.md                          # Project documentation
```

---

## Key Directories Summary

| Directory | Purpose |
|-----------|---------|
| `client/src/app/` | Application bootstrap and routing |
| `client/src/config/` | Configuration and constants |
| `client/src/context/` | React Context providers for global state management |
| `client/src/features/` | Feature modules organized by domain |
| `client/src/hooks/` | Custom React hooks for reusable logic |
| `client/src/services/` | Data fetching services |
| `client/src/shared/` | Reusable UI components across features |
| `client/src/utils/` | Utility functions |

## Import Aliases (vite.config.js)
```js
'@'         → src/
'@app'      → src/app/
'@shared'   → src/shared/
'@features' → src/features/
'@config'   → src/config/
'@context'  → src/context/
'@hooks'    → src/hooks/
'@services' → src/services/
'@utils'    → src/utils/
```

## Architecture Overview

### Pages (features/)
Two main user-facing pages:
- **Dashboard** - Main dashboard with panel grid, drag-and-drop, hero section
- **Map** - Interactive global map with geopolitical hotspots

### Feature Modules (features/)
All feature panels organized by domain - each contains:
- `Panel.jsx` - The panel UI component
- `Panel.css` - Panel styles
- `feedService.js` - Data fetching logic (where applicable)
- `index.js` - Barrel exports

Features:
- **ai-race** - AI company news feed
- **blockchain** - Crypto news + on-chain metrics
- **dashboard** - Main dashboard page
- **good-news** - Positive news feed
- **heatmap** - Sector performance heatmap
- **layoffs** - Tech layoffs tracker
- **map** - Interactive global map with geopolitical hotspots
- **markets** - Stock & crypto prices (+ TickerStrip)
- **news** - General RSS news panel
- **startups** - Startup funding rounds
- **vc-activity** - VC fund activity
- **war-watch** - Defence & conflict news

### Shared Components (shared/)
Reusable components used across features:
- **feedback/** - Error boundaries
- **layout/** - Navbar, modals, tabs
- **ui/** - Panel chrome, news wire feed
- **visualization/** - Developer activity chart

### Services (services/)
Data fetching services:
- **baseFeedService.js** - Core RSS fetch/parse logic
- **feedConfig.js** - Centralized RSS feed URL registry
- **mapFeedService.js** - Map-specific data feeds
- **chainStats.js** - Blockchain on-chain metrics
- **githubActivity.js** - GitHub activity stats
- **newsFeedService.js** - News RSS feed service

## Example Imports

```jsx
// Import a feature panel
import { MarketsPanel } from '@features/markets'

// Import a shared component
import Panel from '@shared/ui/Panel/Panel'

// Import a service
import { BaseFeedService } from '@services/baseFeedService'

// Import a hook
import { useFeedData } from '@hooks/useFeedData'

// Import a page
import Dashboard from '@features/dashboard'
```
