'use client'

/**
 * User Settings Content Component
 * Comprehensive settings page for user preferences and integrations
 */

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormErrorAlert, FormSuccessMessage, useFormFeedback } from '@/components/forms/FormError'
import { useAppContext } from '@/context/AppContext'
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Wallet, 
  Cloud, 
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  dataSync: boolean
  autoSave: boolean
  defaultPrivacy: 'private' | 'shared' | 'public'
}

interface IntegrationSettings {
  solidPodUrl: string
  bsvWalletConnected: boolean
  dataExportFormat: 'json' | 'csv' | 'markdown'
  backupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

export function UserSettingsContent() {
  const { data: session } = useSession()
  const { user } = useAppContext()
  const feedback = useFormFeedback()
  
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    pushNotifications: false,
    dataSync: true,
    autoSave: true,
    defaultPrivacy: 'private'
  })

  const [integrations, setIntegrations] = React.useState<IntegrationSettings>({
    solidPodUrl: '',
    bsvWalletConnected: false,
    dataExportFormat: 'json',
    backupEnabled: false,
    backupFrequency: 'weekly'
  })

  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [isModified, setIsModified] = React.useState(false)

  // Save preferences
  const handleSavePreferences = async () => {
    feedback.setLoading(true, 'Saving preferences...')
    
    try {
      // TODO: Implement API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      feedback.setSuccess('Preferences saved successfully!')
      setIsModified(false)
    } catch (error) {
      feedback.setError('Failed to save preferences. Please try again.')
    }
  }

  // Save integrations
  const handleSaveIntegrations = async () => {
    feedback.setLoading(true, 'Saving integrations...')
    
    try {
      // TODO: Implement API call to save integrations
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      feedback.setSuccess('Integration settings saved successfully!')
    } catch (error) {
      feedback.setError('Failed to save integration settings. Please try again.')
    }
  }

  // Export user data
  const handleExportData = async () => {
    feedback.setLoading(true, 'Preparing data export...')
    
    try {
      // TODO: Implement data export functionality
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate export
      
      feedback.setSuccess('Data export completed! Download should start automatically.')
    } catch (error) {
      feedback.setError('Failed to export data. Please try again.')
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    feedback.setLoading(true, 'Deleting account...')
    
    try {
      // TODO: Implement account deletion
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate deletion
      
      feedback.setSuccess('Account deletion initiated. You will be logged out shortly.')
    } catch (error) {
      feedback.setError('Failed to delete account. Please contact support.')
    }
  }

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setIsModified(true)
  }

  const updateIntegration = (key: keyof IntegrationSettings, value: any) => {
    setIntegrations(prev => ({ ...prev, [key]: value }))
    setIsModified(true)
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Please sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {isModified && (
          <Button onClick={handleSavePreferences} disabled={feedback.isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      {feedback.renderFeedback()}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <User className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Cloud className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your basic account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={session.user?.name || ''} 
                    readOnly 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={session.user?.email || ''} 
                    readOnly 
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => updatePreference('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-save">Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes as you work
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => updatePreference('autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="data-sync">Data Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync data across devices and platforms
                    </p>
                  </div>
                  <Switch
                    id="data-sync"
                    checked={preferences.dataSync}
                    onCheckedChange={(checked) => updatePreference('dataSync', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display</CardTitle>
              <CardDescription>
                Customize the appearance of your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={preferences.theme} onValueChange={(value: any) => updatePreference('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-privacy">Default Privacy Level</Label>
                <Select value={preferences.defaultPrivacy} onValueChange={(value: any) => updatePreference('defaultPrivacy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default privacy level for new content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and alerts via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SOLID Pod Integration</CardTitle>
              <CardDescription>
                Connect your SOLID pod for decentralized data storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solid-pod-url">SOLID Pod URL</Label>
                <Input
                  id="solid-pod-url"
                  placeholder="https://your-pod.solidcommunity.net/"
                  value={integrations.solidPodUrl}
                  onChange={(e) => updateIntegration('solidPodUrl', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your SOLID pod URL to enable decentralized storage
                </p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>BSV Wallet Integration</CardTitle>
              <CardDescription>
                Connect your BSV wallet for micropayments and notarization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Wallet Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={integrations.bsvWalletConnected ? "default" : "secondary"}>
                      {integrations.bsvWalletConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Wallet className="mr-2 h-4 w-4" />
                  {integrations.bsvWalletConnected ? "Disconnect" : "Connect Wallet"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Backup and export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="backup-enabled">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data to your SOLID pod
                  </p>
                </div>
                <Switch
                  id="backup-enabled"
                  checked={integrations.backupEnabled}
                  onCheckedChange={(checked) => updateIntegration('backupEnabled', checked)}
                />
              </div>

              {integrations.backupEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={integrations.backupFrequency} onValueChange={(value: any) => updateIntegration('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={integrations.dataExportFormat} onValueChange={(value: any) => updateIntegration('dataExportFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleExportData} disabled={feedback.isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveIntegrations} disabled={feedback.isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Integration Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy settings and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium">Advanced Privacy Controls</h4>
                  <p className="text-sm text-muted-foreground">
                    These settings control advanced privacy features and data handling.
                  </p>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download All My Data
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">
                  These actions are permanent and cannot be undone.
                </p>
                
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={feedback.isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}