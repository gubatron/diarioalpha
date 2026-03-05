import { ThemeProvider } from '@core/context/ThemeContext'
import { RefreshProvider } from '@core/context/RefreshContext'

const RootProviders = ({ children }) => (
  <ThemeProvider>
    <RefreshProvider>
      {children}
    </RefreshProvider>
  </ThemeProvider>
)

export default RootProviders
