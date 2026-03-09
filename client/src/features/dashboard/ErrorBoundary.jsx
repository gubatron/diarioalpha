import { Component } from 'react'
import { useI18n } from '@context/I18nContext'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    const { t } = this.props
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] bg-[var(--bg-dark)] rounded-none border border-[var(--border-color)]">
          <div className="text-[2rem] mb-4">⚠️</div>
          <div className="text-xl font-semibold text-[var(--alert)] mb-2">{t('errorBoundary.title')}</div>
          <div className="text-[var(--text-secondary)] text-sm mb-4 max-w-[300px]">
            {this.state.error?.message || t('errorBoundary.message')}
          </div>
          <button 
            className="px-4 py-2 bg-[var(--accent)] text-[var(--bg-dark)] border-none rounded-none cursor-pointer font-semibold hover:opacity-90"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {t('errorBoundary.retry')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const ErrorBoundaryWrapper = (props) => {
  const { t } = useI18n()
  return <ErrorBoundary {...props} t={t} />
}

export default ErrorBoundaryWrapper
