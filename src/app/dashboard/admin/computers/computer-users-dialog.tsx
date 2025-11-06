"use client"

import { ListInput } from "@/app/dashboard/admin/computers/list-input";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader } from "lucide-react";

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
    if (isPending || !computer) return (
        <Alert className="w1/4">
            <Loader />
            <AlertTitle>Loading computer users...</AlertTitle>
        </Alert>
    );

    return (
        <>
            {computer.users && <ListInput hostname={hostname} computer={computer} items={computer.users} onOpenChange={onOpenChange} placeholder="Add a user..." />}
        </>
    )
}
