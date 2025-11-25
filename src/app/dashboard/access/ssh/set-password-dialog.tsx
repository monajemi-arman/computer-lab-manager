import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const SetPasswordDialog = (
    { open, onOpenChange, hostname, username }: {
        open: boolean,
        onOpenChange: (open: boolean) => void,
        hostname: string,
        username: string,
    }
) => {
    const handleSubmit = async (formData: FormData) => {
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirm-password') as string;
        
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch(`/api/operation/set-password/${hostname}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: "same-origin",
        });
        
        if (response.ok) {
            alert("Password set successfully!");
            onOpenChange(false);
        }
        else {
            alert("Failed to set password.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Set SSH Password for {hostname}</DialogTitle>
                <DialogDescription>
                    Set a new SSH password for user {username} on computer {hostname}.
                </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit}>
                <div className="grid w-full items-center gap-4 py-4">
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
    )
}