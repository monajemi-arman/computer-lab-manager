import { getSession } from "@/app/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IUser } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Hash, Loader, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ChangePasswordDialog } from "./change-password-dialog";

export function ProfileChangePasswordView() {
    const [username, setUsername] = useState<string | null>(null);
    const [changePassword, setChangePassword] = useState<boolean>(false);

    const { data: user, isPending } = useQuery({
        queryKey: ['profile'],
        queryFn: async (): Promise<IUser> => {
            const response = await fetch(`/api/user/${username}`);
            return await response.json();
        },
        enabled: !!username
    });

    useEffect(() => {
        getSession().then((session) => {
            setUsername(session?.user.username || null);
        })
    }, []);

    if (!user || isPending) return (
        <Alert>
            <Loader /> Loading profile...
        </Alert>
    )

    return (
        <>
            <Card className="w1/4 mx-64 mt-10">
                <CardHeader>
                    <h1 className="font-bold text-center">{username}</h1>
                </CardHeader>
                {user &&
                    <CardContent>
                        <div className="flex flex-col items-center justify-center gap-4">
                            <h2 className="font-mono flex flex-row">
                                <User /> Role:{` ${user.role}`}
                                {user.role === 'admin' && <Hash />}
                                {user.role === 'user' && <DollarSign />}
                            </h2>
                            <Button onClick={() => setChangePassword(true)}>
                                <Lock />Change password
                            </Button>
                        </div>
                    </CardContent>}
            </Card>
            {username &&
                <ChangePasswordDialog username={username} open={changePassword} onOpenChange={setChangePassword} />
            }
        </>
    )
}