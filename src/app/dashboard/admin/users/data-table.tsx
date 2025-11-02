"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CirclePlus } from "lucide-react"
import { UserEditDialog } from "./user-edit-dialog";
import { IUser } from "@/types/user";
import { useState } from "react";
import { UserAddDialog } from "./user-add-dialog";
import { UserDeleteAlert } from "./user-delete-alert";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser>();

  const openAddUserDialog = () => {
    setIsAddOpen(true);
  }

  return (
    <div className="overflow-hidden rounded-md p-2">
      <UserEditDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={editingUser} />
      <UserAddDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      {editingUser?.username &&
      <UserDeleteAlert open={isDeleteOpen} onOpenChange={setIsDeleteOpen} username={editingUser?.username} />
      }
      <div>
        <p className="p-2"><b>Manage Users</b></p>
        <Button variant="outline" size="sm" onClick={openAddUserDialog}>
          <CirclePlus /> Add new user
        </Button>
      </div>
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
              <TableHead key={`${headerGroup.id}-actions`}>Actions</TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="outline" onClick={() => {
                    setEditingUser(row.original as IUser)
                    setIsEditOpen(true)
                  }}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setEditingUser(row.original as IUser)
                    setIsDeleteOpen(true)
                  }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}