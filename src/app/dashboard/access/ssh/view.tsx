import { getSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { IComputer } from "@/types/computer";
import { useQuery } from "@tanstack/react-query"
import { CircleCheck, CircleX, Key, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { SetPasswordDialog } from "./set-password-dialog";

export const AccessSshView = () => {
    const [hostname, setHostname] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [setPasswordOpen, setSetPasswordOpen] = useState<boolean>(false);

    const { data: computers, isPending } = useQuery({
        queryKey: ['user-computers'],
        queryFn: async (): Promise<IComputer[]> => {
            if (!username) return [];

            const response = await fetch(`/api/user/${username}/computers`, {
                method: 'GET',
                credentials: "same-origin",
            });
            const computers = await response.json();
            return computers;
        },
        enabled: !!username,
    });

    useEffect(() => {
        getSession().then((session) => {
            setUsername(session?.user.username || null);
        })
    }, []);

    const handleSetPassword = (hostname: string) => async () => {
        setHostname(hostname);
        setSetPasswordOpen(true);
    }

    const handleEnableAccess = (hostname: string) => async () => {
        setHostname(hostname);
        const response = await fetch(`/api/operation/add-user/${hostname}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
            credentials: "same-origin",
        });

        if (response.ok) {
            alert("Access enabled successfully.");
        } else {
            const errorText = await response.text();
            alert(`Failed to enable access: ${errorText}`);
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl">Access Computers</h1>
            <div className="flex flex-row">
                {isPending && <p>Loading...</p>}
                {!computers && !isPending && <p>No computers found.</p>}
                {!isPending && computers && computers.map((computer) => (
                    <Card key={computer.hostname} className="w-1/5">
                        <CardHeader className="flex items-center justify-center">
                            {!!computer.status && <CircleCheck /> || <CircleX />}
                            <strong>{computer.hostname}</strong>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-2">
                            {!!!computer.status && <p className="text-sm bg-red-300">Activate computer first!</p>}
                            <Button variant='default' disabled={!!!computer.status} onClick={handleEnableAccess(computer.hostname)} >
                                <Key /> Enable Access
                            </Button>
                            <Button variant='default' disabled={!!!computer.status} onClick={handleSetPassword(computer.hostname)} >
                                <Lock /> Set SSH Password
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {username && hostname &&
                <SetPasswordDialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen} hostname={hostname} username={username} />
            }
        </div>
    )
}
