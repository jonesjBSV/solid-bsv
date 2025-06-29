import { Metadata } from 'next'
import { UserSettingsContent } from '@/components/app/UserSettingsContent'

export const metadata: Metadata = {
  title: 'Settings | SOLID BSV Second Brain',
  description: 'Manage your account settings, preferences, and integrations',
}

export default function SettingsPage() {
  return <UserSettingsContent />
}