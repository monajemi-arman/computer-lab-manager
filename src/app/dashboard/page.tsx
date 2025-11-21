"use client";

import { AppSidebar } from "@/components/app-sidebar"
import DefaultDashboardView from "@/components/default-dashboard-view";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AdminUsersView from "./admin/users/view";
import { useEffect, useState } from "react";
import { useHash } from "@/hooks/use-hash";
import { getIsAdmin } from "../actions";
import AdminComputersView from "./admin/computers/view";
import AdminSoftwareManagementView from "./admin/software-management/view";
import FileUploadView from "./file-server/upload/view";
import { FileBrowseView } from "./file-server/browse/view";
import { StorageStatisticsView } from "./monitoring/storage-statistics/view";

export default function Page() {
  // States
  const [isAdmin, setIsAdmin] = useState(false);
  const hash = useHash();

  // isAdmin
  useEffect(() => {
    getIsAdmin()
      .then((result) => {
        setIsAdmin(result)
      })
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={isAdmin} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <DefaultDashboardView />
        {
          // Admin Views
        }
        {hash == '#admin-users' && <AdminUsersView />}
        {hash == '#admin-computers' && <AdminComputersView />}
        {hash == '#admin-software-management' && <AdminSoftwareManagementView />}
        {hash == '#admin-storage-statistics' && <StorageStatisticsView />}
        {
          // User Views
        }
        {hash == '#file-upload' && <FileUploadView />}
        {hash == '#file-browse' && <FileBrowseView />}
      </SidebarInset>
    </SidebarProvider>
  )
}
