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

export function PlaybookDeleteAlert({
    open, onOpenChange, filename
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    filename: string | undefined
}) {
    const queryClient = useQueryClient();
    const deletePlaybookMutation = useMutation({
        mutationFn: async (filename: string) => {
            const res = await fetch('/api/playbook/' + filename, {
                method: "DELETE",
                credentials: "same-origin"
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`Failed to delete playbook: ${res.status} ${text}`);
            }
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playbooks'] });
        }
    })

    if (!filename) return;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to delete {'"'}{filename}{'" '}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deletePlaybookMutation.mutate(filename)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
