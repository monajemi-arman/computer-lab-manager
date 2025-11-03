"use client"

import { IComputer } from "@/types/computer"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<IComputer>[] = [
  {
    accessorKey: "hostname",
    header: "Hostname",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "status",
    header: "Status"
  },
  {
    accessorKey: "users",
    header: "Users",
  },
]