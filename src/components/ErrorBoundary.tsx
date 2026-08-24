import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitize error message before logging to prevent log injection
    const safeMessage = (error?.message || 'Unknown error').replace(/[\r\n]/g, ' ');
    console.error('ErrorBoundary caught:', safeMessage);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-z-paper border-2 border-z-border p-10 shadow-[8px_8px_0px_0px_var(--color-z-shadow)] text-center">
            <h2 className="font-display font-black text-3xl uppercase tracking-tighter text-z-ink mb-4">Something went wrong</h2>
            <p className="font-mono text-[11px] text-z-muted uppercase tracking-widest mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="sticker-btn bg-z-ink text-z-paper"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
