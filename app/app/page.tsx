"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Brain, 
  Share2, 
  Wallet, 
  Shield,
  Globe,
  ArrowRight,
  User,
  Settings
} from "lucide-react"
import Link from "next/link"

// Main features cards
const mainFeatures = [
  {
    title: "Profile",
    description: "Manage your account and personal information",
    icon: User,
    href: "/app/profile",
    status: "ready"
  },
  {
    title: "Settings",
    description: "Configure your preferences and account settings",
    icon: Settings,
    href: "/app/settings", 
    status: "ready"
  }
]

// SOLID+BSV showcase features
const showcaseFeatures = [
  {
    title: "SOLID Pods",
    description: "Manage your personal data pods and storage",
    icon: Database,
    href: "/app/pods",
    status: "coming-soon"
  },
  {
    title: "Identity & DID",
    description: "Decentralized identity and credential management",
    icon: Shield,
    href: "/app/identity",
    status: "coming-soon"
  },
  {
    title: "Second Brain",
    description: "AI-powered knowledge management and context store",
    icon: Brain,
    href: "/app/brain",
    status: "coming-soon"
  },
  {
    title: "Data Sharing",
    description: "Share data securely with micropayments", 
    icon: Share2,
    href: "/app/sharing",
    status: "coming-soon"
  },
  {
    title: "Micropayments",
    description: "BSV wallet and micropayment transactions",
    icon: Wallet,
    href: "/app/wallet",
    status: "coming-soon"
  },
  {
    title: "BSV Network",
    description: "Connect to the BSV blockchain overlay network",
    icon: Globe,
    href: "/app/network",
    status: "coming-soon"
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your SOLID+BSV Second Brain application
        </p>
      </div>

      {/* Main Features Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Core Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mainFeatures.map((feature) => (
            <Card key={feature.title} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">Ready</Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={feature.href} className="flex items-center gap-2">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SOLID+BSV Showcase Features */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">SOLID+BSV Features</h2>
          <p className="text-sm text-muted-foreground">
            Advanced features showcasing SOLID pods and BSV blockchain integration
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {showcaseFeatures.map((feature) => (
            <Card key={feature.title} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-muted-foreground" />
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="w-full">
                  Under Development
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Active</div>
            <p className="text-xs text-muted-foreground">Google OAuth working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Connected</div>
            <p className="text-xs text-muted-foreground">Supabase ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">UI Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓ Ready</div>
            <p className="text-xs text-muted-foreground">shadcn/ui installed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BSV Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">⏳ Pending</div>
            <p className="text-xs text-muted-foreground">To be implemented</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

