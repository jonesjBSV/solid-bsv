'use client'

/**
 * Error Reporting and User Feedback System
 * Comprehensive error tracking, reporting, and user feedback collection
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/enhanced-toast'
import { 
  Bug, 
  Send, 
  Copy, 
  Check, 
  AlertTriangle,
  Info,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react'

interface ErrorReport {
  id: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  buildId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'ui' | 'api' | 'auth' | 'data' | 'network' | 'other'
  reproduced?: boolean
  steps?: string[]
  userDescription?: string
  userEmail?: string
  attachments?: File[]
}

interface FeedbackReport {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'compliment' | 'complaint'
  title: string
  description: string
  rating?: number
  email?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
  url: string
  attachments?: File[]
}

interface ErrorReportingProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  onClose?: () => void
  showFeedbackForm?: boolean
}

export function ErrorReporting({ 
  error, 
  errorInfo, 
  errorId, 
  onClose,
  showFeedbackForm = false 
}: ErrorReportingProps) {
  const { success, error: showErrorToast } = useToast()
  const [activeTab, setActiveTab] = React.useState(showFeedbackForm ? 'feedback' : 'error')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  
  // Error report state
  const [userDescription, setUserDescription] = React.useState('')
  const [userEmail, setUserEmail] = React.useState('')
  const [severity, setSeverity] = React.useState<ErrorReport['severity']>('medium')
  const [category, setCategory] = React.useState<ErrorReport['category']>('ui')
  const [reproduced, setReproduced] = React.useState<boolean>(false)
  const [steps, setSteps] = React.useState<string>('')
  
  // Feedback form state
  const [feedbackType, setFeedbackType] = React.useState<FeedbackReport['type']>('bug')
  const [feedbackTitle, setFeedbackTitle] = React.useState('')
  const [feedbackDescription, setFeedbackDescription] = React.useState('')
  const [feedbackRating, setFeedbackRating] = React.useState<number>(0)
  const [feedbackEmail, setFeedbackEmail] = React.useState('')
  const [feedbackCategory, setFeedbackCategory] = React.useState('general')
  const [feedbackPriority, setFeedbackPriority] = React.useState<FeedbackReport['priority']>('medium')

  const generateErrorReport = (): ErrorReport => {
    return {
      id: errorId || `error_${Date.now()}`,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack || undefined,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: 'unknown', // TODO: Get from auth context
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown',
      severity,
      category,
      reproduced,
      steps: steps ? steps.split('\n').filter(Boolean) : undefined,
      userDescription: userDescription || undefined,
      userEmail: userEmail || undefined
    }
  }

  const generateFeedbackReport = (): FeedbackReport => {
    return {
      id: `feedback_${Date.now()}`,
      type: feedbackType,
      title: feedbackTitle,
      description: feedbackDescription,
      rating: feedbackRating || undefined,
      email: feedbackEmail || undefined,
      category: feedbackCategory,
      priority: feedbackPriority,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      success({ title: 'Copied to clipboard' })
    } catch (error) {
      showErrorToast({ title: 'Failed to copy to clipboard' })
    }
  }

  const submitErrorReport = async () => {
    setIsSubmitting(true)
    try {
      const report = generateErrorReport()
      
      // TODO: Send to error reporting service
      console.log('Error report:', report)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success({ 
        title: 'Error report submitted',
        description: `Report ID: ${report.id}` 
      })
      
      onClose?.()
    } catch (error) {
      showErrorToast({ 
        title: 'Failed to submit error report',
        description: 'Please try again or contact support directly.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitFeedback = async () => {
    setIsSubmitting(true)
    try {
      const feedback = generateFeedbackReport()
      
      // TODO: Send to feedback service
      console.log('Feedback:', feedback)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success({ 
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!' 
      })
      
      onClose?.()
    } catch (error) {
      showErrorToast({ 
        title: 'Failed to submit feedback',
        description: 'Please try again or contact support directly.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadErrorReport = () => {
    const report = generateErrorReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${report.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {activeTab === 'error' ? (
            <>
              <Bug className="h-5 w-5 text-red-500" />
              Error Report
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Send Feedback
            </>
          )}
        </CardTitle>
        <CardDescription>
          {activeTab === 'error' 
            ? 'Help us fix this issue by providing additional details'
            : 'Share your thoughts or report issues to help us improve'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="error" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Error Report
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="error" className="space-y-4">
            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <div><strong>Message:</strong> {error.message}</div>
                    {errorId && <div><strong>Error ID:</strong> {errorId}</div>}
                    <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">User Interface</SelectItem>
                    <SelectItem value="api">API/Server</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="data">Data/Database</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="userDescription">What were you doing when this happened?</Label>
              <Textarea
                id="userDescription"
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Describe what you were trying to do..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="steps">Steps to reproduce (one per line)</Label>
              <Textarea
                id="steps"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="1. Click on...&#10;2. Navigate to...&#10;3. Error occurs when..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="userEmail">Email (optional)</Label>
              <Input
                id="userEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll only use this to follow up on your report
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadErrorReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                
                {error?.stack && (
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(error.stack || '')}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy Stack Trace
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={submitErrorReport} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Report
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feedbackType">Type</Label>
                <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feedbackPriority">Priority</Label>
                <Select value={feedbackPriority} onValueChange={(value: any) => setFeedbackPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="feedbackTitle">Title</Label>
              <Input
                id="feedbackTitle"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Brief summary of your feedback..."
                required
              />
            </div>

            <div>
              <Label htmlFor="feedbackDescription">Description</Label>
              <Textarea
                id="feedbackDescription"
                value={feedbackDescription}
                onChange={(e) => setFeedbackDescription(e.target.value)}
                placeholder="Please provide detailed feedback..."
                rows={4}
                required
              />
            </div>

            {['compliment', 'complaint'].includes(feedbackType) && (
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 ${
                        star <= feedbackRating 
                          ? 'text-yellow-500' 
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {feedbackRating ? `${feedbackRating}/5` : 'No rating'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="feedbackEmail">Email (optional)</Label>
              <Input
                id="feedbackEmail"
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll only use this to follow up if needed
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button 
                onClick={submitFeedback} 
                disabled={isSubmitting || !feedbackTitle || !feedbackDescription}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Quick feedback buttons component
export function QuickFeedback() {
  const { success } = useToast()
  const [isOpen, setIsOpen] = React.useState(false)

  const sendQuickFeedback = async (type: 'thumbs-up' | 'thumbs-down') => {
    try {
      // TODO: Send quick feedback
      console.log('Quick feedback:', type)
      
      success({ 
        title: type === 'thumbs-up' ? 'Thanks for the positive feedback!' : 'Thanks for the feedback!',
        description: 'Your input helps us improve.'
      })
    } catch (error) {
      console.error('Failed to send quick feedback:', error)
    }
  }

  if (isOpen) {
    return <ErrorReporting showFeedbackForm onClose={() => setIsOpen(false)} />
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => sendQuickFeedback('thumbs-up')}
        className="flex items-center gap-1"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => sendQuickFeedback('thumbs-down')}
        className="flex items-center gap-1"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <MessageSquare className="h-3 w-3" />
        Feedback
      </Button>
    </div>
  )
}