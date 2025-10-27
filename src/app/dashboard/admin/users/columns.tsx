"use client"

import { IUser } from "@/types/user"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Email",
  },
  {
    accessorKey: "computers",
    header: "Computers",
  },
]