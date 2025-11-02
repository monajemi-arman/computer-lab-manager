"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";


export default function AdminUsersView() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      return JSON.parse(await res.json());
    }
  });

  if (isLoading) return "Loading users...";
  return (
    <DataTable columns={columns} data={data} />
  )
}