import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast, Toaster } from "sonner"

export const ChangePasswordDialog = (
    { open, onOpenChange, username }: {
        open: boolean,
        onOpenChange: (open: boolean) => void,
        username: string,
    }
) => {
    const handleSubmit = async (formData: FormData) => {
        const toastIdLoading = toast.loading("Setting password...");

        const password = formData.get('password') as string;
        const currentPassword = formData.get('current-password') as string;
        const confirmPassword = formData.get('confirm-password') as string;

        if (password !== confirmPassword) {
            toast.dismiss(toastIdLoading);
            toast.error("Passwords do not match!");
            return;
        }

        const response = await fetch(`/api/user/${username}/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, currentPassword }),
            credentials: "same-origin",
        });

        if (response.ok) {
            toast.dismiss(toastIdLoading);
            toast.success("Password set successfully!");
            onOpenChange(false);
        }
        else {
            toast.dismiss(toastIdLoading);
            toast.error("Failed to set password. Wrong current password?");
        }
    };

    return (
        <><Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Set new password for {username}</DialogTitle>
                    <DialogDescription>
                        Set a new password for user {username} on computer {username}.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid w-full items-center gap-4 py-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input type="password" id="current-password" name="current-password" placeholder="Current password" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">New Password</Label>
                            <Input type="password" id="password" name="password" placeholder="Enter new password" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm new password" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Set Password</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <Toaster /></>
    );
}