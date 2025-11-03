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
import { ComputerEditDialog } from "./computer-edit-dialog";
import { IComputer } from "@/types/computer";
import { useState } from "react";
import { ComputerAddDialog } from "./computer-add-dialog";
import { ComputerDeleteAlert } from "./computer-delete-alert";
import ComputerUsersDialog from "./computer-users-dialog";

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
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<IComputer>();

  return (
    <div className="overflow-hidden rounded-md p-2">
      <ComputerEditDialog open={isEditOpen} onOpenChange={setIsEditOpen} computer={editingComputer} />
      <ComputerAddDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      {editingComputer?.hostname &&
        <ComputerDeleteAlert open={isDeleteOpen} onOpenChange={setIsDeleteOpen} hostname={editingComputer?.hostname} />
      }
      {editingComputer?.hostname &&
        <ComputerUsersDialog open={isUsersOpen} onOpenChange={setIsUsersOpen} hostname={editingComputer?.hostname} />
      }
      <div>
        <p className="p-2"><b>Manage Computers</b></p>
        <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
          <CirclePlus /> Add new computer
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
                  <Button variant="default" onClick={() => {
                    setEditingComputer(row.original as IComputer);
                    setIsUsersOpen(true);
                  }}>
                    Manage Users
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditingComputer(row.original as IComputer)
                    setIsEditOpen(true)
                  }}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setEditingComputer(row.original as IComputer)
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