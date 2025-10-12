"use client"
import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Users,
  ServerCog,
  RefreshCw,
  Package,
  Download,
  Activity,
  Monitor,
  Smartphone,
  Terminal,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { title } from "process"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean
}

const data = {
  user: {
    name: "Admin",
    email: "info@localhost",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "University",
      logo: GalleryVerticalEnd,
      plan: "Lab",
    }
  ],
  // Menu items available to all users
  navMain: [
    {
      title: "Access Computers",
      url: "#access",
      icon: Monitor,
      items: [
        {
          title: "Remote Desktop",
          url: "#access-remote-desktop",
          icon: Smartphone,
        },
        {
          title: "SSH",
          url: "#access-ssh",
          icon: Terminal,
        },
      ],
    },
    {
      title: "Profile",
      url: "#profile",
      icon: User,
      items: [
        {
          title: "Change Password",
          url: "#profile-change-password",
        }
      ]
    }
  ],
  // Admin-only menu items
  adminNavMain: [
    {
      title: "User Management",
      url: "#admin-users",
      icon: Users,
      isAdminOnly: true,
    },
    {
      title: "Monitoring",
      url: "#admin-monitoring",
      icon: Activity,
      items: [
        {
          title: "Systems Load & Uptime",
          url: "#admin-monitoring-systems",
        }
      ]
    },
    {
      title: "System Administration",
      url: "#admin-system",
      icon: ServerCog,
      isAdminOnly: true,
      items: [
        {
          title: "Sync Users",
          url: "#admin-sync-users",
          icon: RefreshCw,
        },
        {
          title: "Update Packages",
          url: "#admin-update-packages",
          icon: Package,
        },
        {
          title: "Install Software",
          url: "#admin-install-software",
          icon: Download,
        },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ isAdmin = false, ...props }: AppSidebarProps) {
  const navigationItems = isAdmin 
    ? [...data.adminNavMain, ...data.navMain]
    : data.navMain

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}