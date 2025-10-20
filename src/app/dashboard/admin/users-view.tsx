"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { container } from "@/lib/container";
import { IUserRepository } from "@/repositories/userRepository";
import { IUser } from "@/types/user";
import { columns } from "./columns";
import { useHash } from "@/hooks/use-hash";

const userRepository = container.resolve<IUserRepository>("IUserRepository");

async function getData(): Promise<IUser[]> {
  return userRepository ? userRepository.findAll() : [];
}

export default function AdminUsersView() {
  const hash = useHash();

  const [data, setData] = useState<IUser[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const response = await fetch('/api/user');
      return await response.json();
    };

    if (hash === '#admin-users') {
      setLoading(true);
      fetchData()
        .then((res) => {
          if (mounted) setData(res);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => { mounted = false; };
  }, [hash]);

  if (hash != '#admin-users')
    return null;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}