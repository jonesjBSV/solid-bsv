'use client'

/**
 * Global Error Boundary Component
 * Catches and handles React errors with user-friendly fallbacks
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  showDetails: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  resetError: () => void
  errorId: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId
    
    this.setState({
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error [${errorId}]`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorId)
    }
  }

  private reportError = async (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
    try {
      // TODO: Integrate with error reporting service (Sentry, Bugsnag, etc.)
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'unknown' // TODO: Get from auth context
      }

      console.log('Error report:', errorReport)
      
      // Example API call to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  private handleSendFeedback = () => {
    const { error, errorId } = this.state
    const subject = encodeURIComponent(`Error Report: ${errorId}`)
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message || 'Unknown error'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

`)
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, showDetails } = this.state
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={error!}
            errorInfo={errorInfo!}
            resetError={this.resetError}
            errorId={errorId}
          />
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <CardDescription>
                    We apologize for the inconvenience. An unexpected error has occurred.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Error ID: {errorId}</AlertTitle>
                <AlertDescription>
                  This error has been logged and will help us improve the application.
                  {error?.message && (
                    <div className="mt-2 text-sm">
                      <strong>Error:</strong> {error.message}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-3">
                <Button onClick={this.resetError} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                
                <Button variant="outline" onClick={this.handleSendFeedback} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Feedback
                </Button>
              </div>

              {/* Error Details Toggle */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.toggleDetails}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
                
                {showDetails && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">Error Stack Trace:</h4>
                      <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                        {error?.stack || 'No stack trace available'}
                      </pre>
                    </div>
                    
                    {errorInfo?.componentStack && (
                      <div className="p-3 bg-muted rounded-md">
                        <h4 className="text-sm font-medium mb-2">Component Stack:</h4>
                        <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">Debug Information:</h4>
                      <div className="text-xs space-y-1">
                        <div><strong>Error ID:</strong> {errorId}</div>
                        <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                        <div><strong>URL:</strong> {window.location.href}</div>
                        <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for triggering error boundary from functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    // Re-throw error to be caught by error boundary
    throw error
  }, [])
}

// Default error fallback component
export function DefaultErrorFallback({ error, resetError, errorId }: ErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">
        Error ID: {errorId}
      </p>
      <Button onClick={resetError}>
        Try again
      </Button>
    </div>
  )
}

// Specialized error boundaries for different parts of the app
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DefaultErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Component Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Error testing component for development
export function ErrorTester() {
  const [shouldError, setShouldError] = React.useState(false)
  
  if (shouldError) {
    throw new Error('This is a test error triggered by ErrorTester component')
  }
  
  return (
    <div className="p-4 border border-dashed border-red-300 rounded">
      <h3 className="font-medium mb-2">Error Boundary Tester</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Click the button below to trigger an error and test the error boundary.
      </p>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShouldError(true)}
      >
        Trigger Error
      </Button>
    </div>
  )
}