"use client"

import { ListInput } from "@/app/dashboard/admin/computers/list-input"
import { useQuery } from "@tanstack/react-query"

export default function ComputerUsersDialog({
    open, onOpenChange, hostname
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    hostname: string
}) {
    const { data: computer, isPending } = useQuery({
        queryKey: ['computer-users'],
        queryFn: async () => {
            const res = await fetch("/api/computer/" + hostname);
            if (!res.ok) throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
            return (await res.json());
        }
    });

    if (!open || !hostname) return null;
    if (isPending || !computer) return "Loading computer users...";

    return (
        <>
            {computer.users && <ListInput hostname={hostname} computer={computer} items={computer.users} onOpenChange={onOpenChange} placeholder="Add a user..." />}
        </>
    )
}
