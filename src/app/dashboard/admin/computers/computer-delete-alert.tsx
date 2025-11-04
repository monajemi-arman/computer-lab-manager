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

export function ComputerDeleteAlert({
    open, onOpenChange, hostname
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    hostname: string
}) {
    const queryClient = useQueryClient();
    const deleteComputer = useMutation({
        mutationFn: async (hostname: string) => {
            const res = await fetch('/api/computer/' + hostname, {
                method: "DELETE",
                credentials: "same-origin",
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`Failed to save computer: ${res.status} ${text}`);
            }
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['computer-users'] });
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to delete {'"'}{hostname}{'" '}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteComputer.mutate(hostname)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
