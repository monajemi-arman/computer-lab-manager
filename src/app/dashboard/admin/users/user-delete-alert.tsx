import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function UserDeleteAlert({
    open, onOpenChange, username
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    username: string
}) {
    const queryClient = useQueryClient();

    const deleteUser = useMutation({
        mutationFn: async (username: string) => {
            const res = await fetch('/api/user/' + username, {
                method: "DELETE",
                credentials: "same-origin",
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`Failed to save user: ${res.status} ${text}`);
            }
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onOpenChange(false);
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to delete {'"'}{username}{'" '}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteUser.mutate(username)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
