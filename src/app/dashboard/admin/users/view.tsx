"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";


export default function AdminUsersView() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      return await res.json();
    }
  });

  if (isLoading) return (
    <Alert className="w1/4">
      <Loader />
      <AlertTitle>Loading users...</AlertTitle>
    </Alert>
  );
  return (
    <DataTable columns={columns} data={data} />
  )
}