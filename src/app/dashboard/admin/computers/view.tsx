"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader } from "lucide-react";

export default function AdminComputersView() {
  const { data: computers, isLoading } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const res = await fetch("/api/computer");
      if (!res.ok) throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
      return await res.json();
    }
  });

  if (isLoading) return (
    <Alert className="w1/4">
      <Loader />
      <AlertTitle>Loading computers...</AlertTitle>
    </Alert>
  )

  return (
    <DataTable columns={columns} data={computers} />
  )
}