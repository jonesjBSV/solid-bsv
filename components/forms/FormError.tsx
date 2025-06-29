'use client'

/**
 * Form Error Components
 * Reusable error handling and feedback components for forms
 */

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, RefreshCw, CheckCircle, Info } from 'lucide-react'

// Error Alert Component
interface FormErrorAlertProps {
  title?: string
  message: string
  onDismiss?: () => void
  onRetry?: () => void
  variant?: 'error' | 'warning' | 'info'
}

export function FormErrorAlert({ 
  title, 
  message, 
  onDismiss, 
  onRetry,
  variant = 'error'
}: FormErrorAlertProps) {
  const getIcon = () => {
    switch (variant) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getVariantClass = () => {
    switch (variant) {
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800'
      default: return 'border-red-200 bg-red-50 text-red-800'
    }
  }

  return (
    <Alert className={getVariantClass()}>
      {getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Field Error List Component
interface FormFieldErrorsProps {
  errors: string[]
  fieldName?: string
}

export function FormFieldErrors({ errors, fieldName }: FormFieldErrorsProps) {
  if (!errors.length) return null

  return (
    <div className="space-y-1">
      {errors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>{fieldName ? `${fieldName}: ${error}` : error}</span>
        </div>
      ))}
    </div>
  )
}

// Success Message Component
interface FormSuccessMessageProps {
  message: string
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export function FormSuccessMessage({ 
  message, 
  onDismiss, 
  autoHide = true, 
  autoHideDelay = 5000 
}: FormSuccessMessageProps) {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay, onDismiss])

  return (
    <Alert className="border-green-200 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Form Validation Summary Component
interface FormValidationSummaryProps {
  errors: Record<string, string[]>
  onFieldFocus?: (fieldName: string) => void
}

export function FormValidationSummary({ errors, onFieldFocus }: FormValidationSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, fieldErrors]) => fieldErrors.length > 0)
  
  if (!errorEntries.length) return null

  const totalErrors = errorEntries.reduce((sum, [_, fieldErrors]) => sum + fieldErrors.length, 0)

  return (
    <Alert className="border-red-200 bg-red-50 text-red-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {totalErrors} error{totalErrors !== 1 ? 's' : ''}
            </Badge>
            <span className="text-sm">found in the form</span>
          </div>
          <div className="space-y-1">
            {errorEntries.map(([fieldName, fieldErrors]) => (
              <div key={fieldName} className="space-y-1">
                <button
                  type="button"
                  onClick={() => onFieldFocus?.(fieldName)}
                  className="text-left font-medium text-sm hover:underline capitalize"
                >
                  {fieldName.replace(/_/g, ' ')}:
                </button>
                <FormFieldErrors errors={fieldErrors} />
              </div>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Loading State Component
interface FormLoadingStateProps {
  message?: string
  progress?: number
}

export function FormLoadingState({ message = 'Processing...', progress }: FormLoadingStateProps) {
  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <AlertDescription className="space-y-2">
        <span>{message}</span>
        {progress !== undefined && (
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Form State Hook for managing form feedback
export function useFormFeedback() {
  const [state, setState] = React.useState<{
    isLoading: boolean
    error: string | null
    success: string | null
    progress?: number
  }>({
    isLoading: false,
    error: null,
    success: null
  })

  const setLoading = (isLoading: boolean, message?: string, progress?: number) => {
    setState(prev => ({ 
      ...prev, 
      isLoading, 
      error: null, 
      success: null,
      loadingMessage: message,
      progress
    }))
  }

  const setError = (error: string | Error | null) => {
    setState(prev => ({ 
      ...prev, 
      error: error ? (typeof error === 'string' ? error : error.message) : null,
      isLoading: false,
      success: null
    }))
  }

  const setSuccess = (success: string | null) => {
    setState(prev => ({ 
      ...prev, 
      success,
      isLoading: false,
      error: null
    }))
  }

  const clear = () => {
    setState({
      isLoading: false,
      error: null,
      success: null
    })
  }

  const renderFeedback = () => {
    if (state.isLoading) {
      return (
        <FormLoadingState 
          message={(state as any).loadingMessage} 
          progress={state.progress} 
        />
      )
    }
    
    if (state.error) {
      return (
        <FormErrorAlert 
          message={state.error} 
          onDismiss={() => setError(null)}
          onRetry={() => clear()}
        />
      )
    }
    
    if (state.success) {
      return (
        <FormSuccessMessage 
          message={state.success} 
          onDismiss={() => setSuccess(null)}
        />
      )
    }
    
    return null
  }

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    clear,
    renderFeedback
  }
}