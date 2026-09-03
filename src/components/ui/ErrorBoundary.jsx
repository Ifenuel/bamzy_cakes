import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-soft">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-ink">Something went wrong</h2>
            <p className="mt-2 text-sm text-ink-muted">
              An unexpected error occurred. This might be a temporary issue.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full border border-lilac-soft px-6 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
