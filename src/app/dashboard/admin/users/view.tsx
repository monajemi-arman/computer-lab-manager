"use client";

import React, { useEffect, useState } from "react";
import { IUser } from "@/types/user";
import { columns } from "./columns";
import { useHash } from "@/hooks/use-hash";
import { DataTable } from "./data-table";


export default function AdminUsersView() {
  const [data, setData] = useState<IUser[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const response = await fetch('/api/user', {
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
      return await response.json();
    };

    if (!isMounted) return;

    fetchData()
      .then((data) => setData(JSON.parse(data)))
      .catch((err) => {
        if ((err)?.name !== 'AbortError') {
          console.error(err);
        }
      });
    return () => controller.abort();
  }, [isMounted]);

  return (
    <DataTable columns={columns} data={data} />
  )
}