import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddPortMapDialog } from "./add-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowBigRight, Delete, Loader, PlusCircle } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PortMap } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Alert, AlertTitle } from "@/components/ui/alert"

export const ManageDialog = ({
    hostname, open, onOpenChange
}: {
    hostname: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();

    const { data: portmaps, isPending } = useQuery({
        queryKey: ['portmaps-' + hostname],
        queryFn: async () => {
            const res = await fetch(`/api/operation/port-forward/${hostname}`);
            return await res.json();
        }
    })

    const deletePortmap = useMutation({
        mutationFn: async (localPort: number) => {
            const res = await fetch(`/api/operation/port-forward/${hostname}?localPort=${localPort}`, {
                method: "DELETE",
                credentials: "same-origin"
            });

            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portmaps-' + hostname] })
        }
    })

    if (isPending) {
        return (
            <Alert>
                <Loader />
                <AlertTitle>Loading portmaps for computer...</AlertTitle>
            </Alert>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-bold">
                            Port Forwarding for <span className="font-mono">{hostname}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <input
                        type="text"
                        placeholder="Search ports..."
                        className="border rounded-md px-3 py-2 w-full mb-4"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="space-y-2 max-h-80 overflow-auto">
                        <h4 className="font-semibold">Current ports:</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {portmaps.length === 0 && <p className="text-center text-gray-400">No ports set yet.</p>}
                            {portmaps.length > 0 && portmaps.map((portmap: PortMap) => (
                                <Card
                                    key={portmap.localPort}
                                    className="flex items-center justify-between px-1 py-2 text-sm !gap-2"
                                >
                                    <div className="flex flex-row gap-2">
                                        <strong>{portmap.remotePort}</strong><ArrowBigRight /><strong>{portmap.localPort}</strong>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => deletePortmap.mutate(portmap.localPort)}
                                    >
                                        <strong>DELETE</strong><Delete className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <Button onClick={() => setAddDialogOpen(true)}><PlusCircle />Add</Button>
                </DialogContent>
            </Dialog>
            <AddPortMapDialog hostname={hostname} open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        </>
    )
}