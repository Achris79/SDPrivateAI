import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and provides a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.log(error, {
      component: errorInfo.componentStack,
      type: 'React Error Boundary',
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            margin: '24px',
          }}
        >
          <h2>Oops! Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          {this.state.error && (
            <details style={{ marginTop: '16px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer' }}>Error Details</summary>
              <pre
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
