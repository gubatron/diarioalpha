export const THEMES = {
  default: {
    name: 'Situation Room',
    colors: {
      '--bg-dark': '#030508',
      '--bg-panel': 'rgba(8, 12, 18, 0.75)',
      '--bg-panel-hover': 'rgba(15, 22, 32, 0.85)',
      '--border-color': 'rgba(0, 229, 255, 0.12)',
      '--text-primary': '#e8f0f8',
      '--text-secondary': '#7a8a9a',
      '--text-dim': '#4a5a6a',
      '--accent': '#00e5ff',
      '--accent-hover': '#00b8cc',
      '--green': '#00ff88',
      '--red': '#ff2d55',
      '--yellow': '#ffcc00',
      '--orange': '#ff6b35',
      '--purple': '#a855f7',
      '--glass-bg': 'rgba(8, 12, 18, 0.5)',
      /* Map Colors */
      '--map-bg': '#020406',
      '--map-land': '#0a1520',
      '--map-stroke': '#00e5ff',
      '--map-hover': '#00ff88',
      '--map-grid': '#0a2030'
    }
  },
  dracula: {
    name: 'Dracula',
    colors: {
      '--bg-dark': '#282a36',
      '--bg-panel': 'rgba(40, 42, 54, 0.6)',
      '--bg-panel-hover': 'rgba(68, 71, 90, 0.6)',
      '--border-color': 'rgba(98, 114, 164, 0.3)',
      '--text-primary': '#f8f8f2',
      '--text-secondary': '#6272a4',
      '--text-dim': '#44475a',
      '--accent': '#bd93f9',
      '--accent-hover': '#ff79c6',
      '--green': '#50fa7b',
      '--red': '#ff5555',
      '--yellow': '#f1fa8c',
      '--glass-bg': 'rgba(40, 42, 54, 0.4)',
      /* Map Colors */
      '--map-bg': '#1e1f29',
      '--map-land': '#44475a',
      '--map-stroke': '#6272a4',
      '--map-hover': '#bd93f9',
      '--map-grid': '#2f3146'
    }
  },
  monokai: {
    name: 'Monokai',
    colors: {
      '--bg-dark': '#272822',
      '--bg-panel': 'rgba(39, 40, 34, 0.6)',
      '--bg-panel-hover': 'rgba(62, 61, 50, 0.6)',
      '--border-color': 'rgba(117, 113, 94, 0.3)',
      '--text-primary': '#f8f8f2',
      '--text-secondary': '#75715e',
      '--text-dim': '#49483e',
      '--accent': '#a6e22e',
      '--accent-hover': '#f92672',
      '--green': '#a6e22e',
      '--red': '#f92672',
      '--yellow': '#e6db74',
      '--glass-bg': 'rgba(39, 40, 34, 0.4)',
      /* Map Colors */
      '--map-bg': '#1e1e19',
      '--map-land': '#3e3d32',
      '--map-stroke': '#75715e',
      '--map-hover': '#a6e22e',
      '--map-grid': '#323229'
    }
  },
  githubDark: {
    name: 'GitHub Dark',
    colors: {
      '--bg-dark': '#0d1117',
      '--bg-panel': 'rgba(22, 27, 34, 0.6)',
      '--bg-panel-hover': 'rgba(48, 54, 61, 0.6)',
      '--border-color': 'rgba(48, 54, 61, 0.5)',
      '--text-primary': '#c9d1d9',
      '--text-secondary': '#8b949e',
      '--text-dim': '#484f58',
      '--accent': '#58a6ff',
      '--accent-hover': '#1f6feb',
      '--green': '#238636',
      '--red': '#da3633',
      '--yellow': '#d29922',
      '--glass-bg': 'rgba(22, 27, 34, 0.4)',
      /* Map Colors */
      '--map-bg': '#010409',
      '--map-land': '#30363d',
      '--map-stroke': '#21262d',
      '--map-hover': '#58a6ff',
      '--map-grid': '#161b22'
    }
  },
  solarizedDark: {
    name: 'Solarized Dark',
    colors: {
      '--bg-dark': '#002b36',
      '--bg-panel': 'rgba(7, 54, 66, 0.6)',
      '--bg-panel-hover': 'rgba(88, 110, 117, 0.3)',
      '--border-color': 'rgba(88, 110, 117, 0.3)',
      '--text-primary': '#93a1a1',
      '--text-secondary': '#586e75',
      '--text-dim': '#073642',
      '--accent': '#2aa198',
      '--accent-hover': '#268bd2',
      '--green': '#859900',
      '--red': '#dc322f',
      '--yellow': '#b58900',
      '--glass-bg': 'rgba(7, 54, 66, 0.4)',
      /* Map Colors */
      '--map-bg': '#001e26',
      '--map-land': '#586e75',
      '--map-stroke': '#657b83',
      '--map-hover': '#2aa198',
      '--map-grid': '#073642'
    }
  },
  nord: {
    name: 'Nord',
    colors: {
      '--bg-dark': '#2e3440',
      '--bg-panel': 'rgba(46, 52, 64, 0.6)',
      '--bg-panel-hover': 'rgba(59, 66, 82, 0.6)',
      '--border-color': 'rgba(76, 86, 106, 0.4)',
      '--text-primary': '#eceff4',
      '--text-secondary': '#d8dee9',
      '--text-dim': '#4c566a',
      '--accent': '#88c0d0',
      '--accent-hover': '#81a1c1',
      '--green': '#a3be8c',
      '--red': '#bf616a',
      '--yellow': '#ebcb8b',
      '--glass-bg': 'rgba(46, 52, 64, 0.4)',
      /* Map Colors */
      '--map-bg': '#242933',
      '--map-land': '#3b4252',
      '--map-stroke': '#4c566a',
      '--map-hover': '#88c0d0',
      '--map-grid': '#2e3440'
    }
  },
  gruvbox: {
    name: 'Gruvbox',
    colors: {
      '--bg-dark': '#282828',
      '--bg-panel': 'rgba(40, 40, 40, 0.6)',
      '--bg-panel-hover': 'rgba(60, 56, 54, 0.6)',
      '--border-color': 'rgba(102, 92, 84, 0.4)',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#a89984',
      '--text-dim': '#7c6f64',
      '--accent': '#fabd2f',
      '--accent-hover': '#fe8019',
      '--green': '#b8bb26',
      '--red': '#fb4934',
      '--yellow': '#fabd2f',
      '--glass-bg': 'rgba(40, 40, 40, 0.4)',
      /* Map Colors */
      '--map-bg': '#1d2021',
      '--map-land': '#504945',
      '--map-stroke': '#665c54',
      '--map-hover': '#fabd2f',
      '--map-grid': '#32302f'
    }
  },
  tokyo: {
    name: 'Tokyo Night',
    colors: {
      '--bg-dark': '#1a1b26',
      '--bg-panel': 'rgba(26, 27, 38, 0.6)',
      '--bg-panel-hover': 'rgba(36, 40, 59, 0.6)',
      '--border-color': 'rgba(65, 72, 104, 0.4)',
      '--text-primary': '#a9b1d6',
      '--text-secondary': '#787c99',
      '--text-dim': '#565f89',
      '--accent': '#7aa2f7',
      '--accent-hover': '#bb9af7',
      '--green': '#9ece6a',
      '--red': '#f7768e',
      '--yellow': '#e0af68',
      '--glass-bg': 'rgba(26, 27, 38, 0.4)',
       /* Map Colors */
      '--map-bg': '#15161e',
      '--map-land': '#24283b',
      '--map-stroke': '#414868',
      '--map-hover': '#7aa2f7',
      '--map-grid': '#1f2335'
    }
  },
  synthwave: {
    name: 'Synthwave',
    colors: {
      '--bg-dark': '#2b213a',
      '--bg-panel': 'rgba(36, 27, 53, 0.6)',
      '--bg-panel-hover': 'rgba(55, 41, 99, 0.6)',
      '--border-color': 'rgba(255, 113, 206, 0.2)',
      '--text-primary': '#fffb96',
      '--text-secondary': '#b967ff',
      '--text-dim': '#6b3e9e',
      '--accent': '#01cdfe',
      '--accent-hover': '#ff71ce',
      '--green': '#05ffa1',
      '--red': '#ff71ce',
      '--yellow': '#fffb96',
      '--glass-bg': 'rgba(36, 27, 53, 0.4)',
       /* Map Colors */
      '--map-bg': '#1a1025',
      '--map-land': '#452175',
      '--map-stroke': '#b967ff',
      '--map-hover': '#01cdfe',
      '--map-grid': '#2b213a'
    }
  },
  oneDark: {
    name: 'One Dark',
    colors: {
      '--bg-dark': '#282c34',
      '--bg-panel': 'rgba(33, 37, 43, 0.6)',
      '--bg-panel-hover': 'rgba(40, 44, 52, 0.6)',
      '--border-color': 'rgba(171, 178, 191, 0.1)',
      '--text-primary': '#abb2bf',
      '--text-secondary': '#5c6370',
      '--text-dim': '#4b5263',
      '--accent': '#61afef',
      '--accent-hover': '#c678dd',
      '--green': '#98c379',
      '--red': '#e06c75',
      '--yellow': '#e5c07b',
      '--glass-bg': 'rgba(33, 37, 43, 0.4)',
       /* Map Colors */
      '--map-bg': '#21252b',
      '--map-land': '#3e4452',
      '--map-stroke': '#5c6370',
      '--map-hover': '#61afef',
      '--map-grid': '#282c34'
    }
  },
  bloodMoon: {
    name: 'Blood Moon',
    colors: {
      '--bg-dark': '#0a0506',
      '--bg-panel': 'rgba(20, 8, 10, 0.75)',
      '--bg-panel-hover': 'rgba(35, 12, 16, 0.85)',
      '--border-color': 'rgba(220, 38, 38, 0.2)',
      '--text-primary': '#f5e6e8',
      '--text-secondary': '#a08088',
      '--text-dim': '#605058',
      '--accent': '#dc2626',
      '--accent-hover': '#b91c1c',
      '--green': '#4ade80',
      '--red': '#ff3b3b',
      '--yellow': '#fbbf24',
      '--glass-bg': 'rgba(20, 8, 10, 0.5)',
      /* Map Colors */
      '--map-bg': '#080304',
      '--map-land': '#2a0a10',
      '--map-stroke': '#dc2626',
      '--map-hover': '#ff3b3b',
      '--map-grid': '#1a0508'
    }
  },
  aurora: {
    name: 'Aurora Borealis',
    colors: {
      '--bg-dark': '#020812',
      '--bg-panel': 'rgba(4, 20, 40, 0.75)',
      '--bg-panel-hover': 'rgba(8, 35, 65, 0.85)',
      '--border-color': 'rgba(34, 211, 238, 0.15)',
      '--text-primary': '#e0f7fa',
      '--text-secondary': '#80cbc4',
      '--text-dim': '#4db6ac',
      '--accent': '#22d3ee',
      '--accent-hover': '#06b6d4',
      '--green': '#4ade80',
      '--red': '#f43f5e',
      '--yellow': '#fde047',
      '--glass-bg': 'rgba(4, 20, 40, 0.5)',
      /* Map Colors */
      '--map-bg': '#010408',
      '--map-land': '#0a2540',
      '--map-stroke': '#22d3ee',
      '--map-hover': '#4ade80',
      '--map-grid': '#051525'
    }
  }
}
