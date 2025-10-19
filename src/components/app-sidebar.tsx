"use client"
import * as React from "react"
import {
  GalleryVerticalEnd,
  Users,
  ServerCog,
  Download,
  Activity,
  Monitor,
  Smartphone,
  Terminal,
  User,
  CloudUpload,
  Upload,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdmin?: boolean
}

const data = {
  user: {
    name: "Admin",
    email: "info@localhost",
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
      title: "File Server",
      url: "#file-server",
      icon: CloudUpload,
      items: [
        {
          title: "Upload",
          url: '#file-server-upload',
          icon: Upload
        },
        {
          title: "Download",
          url: '#file-server-download',
          icon: Download
        }
      ]
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
      title: "Access Management",
      url: "#admin-access",
      icon: Users,
      isAdminOnly: true,
      items: [
        {
          title: 'Users',
          url: '#admin-users',
          icon: Users,
        },
        {
          title: 'Computers',
          url: '#admin-computers',
          icon: Monitor
        }
      ]
    },
    {
      title: "Monitoring",
      url: "#admin-monitoring",
      icon: Activity,
      items: [
        {
          title: "Systems Load & Uptime",
          url: "#admin-monitoring-systems",
        },
        {
          title: "Storage Statistics",
          url: "#admin-storage-statistics",
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
          title: "Software Management",
          url: "#admin-software-management",
          icon: Download,
        },
        {
          title: "File Server",
          url: "#admin-file-server",
          icon: Download,
        }
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