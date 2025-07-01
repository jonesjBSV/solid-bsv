"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Database, 
  Brain, 
  Share2, 
  Wallet, 
  Settings, 
  User,
  Globe,
  Shield,
  Search
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/providers/ThemeProvider"

// Main navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Profile",
    url: "/app/profile", 
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
]

// SOLID+BSV Features (for future showcase)
const showcaseItems = [
  {
    title: "SOLID Settings",
    url: "/app/solid",
    icon: Database,
  },
  {
    title: "Identity & DID",
    url: "/app/identity",
    icon: Shield,
  },
  {
    title: "Second Brain",
    url: "/app/brain",
    icon: Brain,
  },
  {
    title: "Data Sharing",
    url: "/app/sharing",
    icon: Share2,
  },
  {
    title: "Micropayments",
    url: "/app/wallet",
    icon: Wallet,
  },
  {
    title: "BSV Network",
    url: "/app/network",
    icon: Globe,
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SB</span>
          </div>
          <span className="font-semibold text-lg">SOLID+BSV</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>SOLID+BSV Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {showcaseItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Theme
          </span>
          <ThemeToggle variant="button" size="sm" />
        </div>
        <div className="text-xs text-muted-foreground">
          Second Brain App v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}