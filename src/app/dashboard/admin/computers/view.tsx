"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";


export default function AdminComputersView() {
  const { data, isLoading } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const res = await fetch("/api/computer");
      if (!res.ok) throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
      return await res.json();
    }
  });

  if (isLoading) return "Loading computers...";
  return (
    <DataTable columns={columns} data={data} />
  )
}