import { ThemeProvider } from '@context/ThemeContext'
import { RefreshProvider } from '@context/RefreshContext'

const RootProviders = ({ children }) => (
  <ThemeProvider>
    <RefreshProvider>
      {children}
    </RefreshProvider>
  </ThemeProvider>
)

export default RootProviders
