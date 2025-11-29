import { getSession } from "@/app/actions";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IComputer } from "@/types/computer";
import { useQuery } from "@tanstack/react-query"
import { Loader, LucideShipWheel } from "lucide-react";
import { useEffect, useState } from "react";
import { ManageDialog } from "./manage-dialog";

export function AccessPortForwardingView() {
    const [username, setUsername] = useState<string | null>(null);
    const [isManageDialogOpen, setManageDialogOpen] = useState(false);
    const [hostname, setHostname] = useState<string | null>(null);

    const { data: computers, isPending } = useQuery({
        queryKey: ['user-computers'],
        queryFn: async () => {
            const res = await fetch(`/api/user/${username}/computers`);
            return await res.json();
        },
        enabled: !!username
    })

    useEffect(() => {
        getSession().then((session) => {
            setUsername(session?.user.username || null);
        })
    }, []);

    if (isPending) {
        return (
            <Alert>
                <Loader />
                <AlertTitle>Loading user computers...</AlertTitle>
            </Alert>
        )
    }

    return (
        <div className="p-2 flex flex-col">
            <h1 className="p-4 font-bold text-2xl">Port Forwarding</h1>
            <div className="p-4 flex flex-row">
                {computers && computers.map((computer: IComputer) => {
                    return (
                        <Card
                            key={computer.hostname}
                            className="flex flex-col items-center justify-center p-6 text-center space-y-4"
                        >
                            <CardHeader className="flex items-center justify-center font-bold">
                                {computer.hostname}
                            </CardHeader>

                            <CardContent className="flex justify-center">
                                <Button
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                        setHostname(computer.hostname);
                                        setManageDialogOpen(true);
                                    }}
                                >
                                    <LucideShipWheel />
                                    Manage
                                </Button>
                            </CardContent>
                        </Card>

                    );

                })
                }
            </div>
            {hostname && <ManageDialog hostname={hostname} open={isManageDialogOpen} onOpenChange={setManageDialogOpen} />}
        </div>
    )
}