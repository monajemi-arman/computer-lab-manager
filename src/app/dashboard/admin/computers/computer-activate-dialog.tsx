'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getActivationScript } from "@/lib/systems-orchestrator/activate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export function ComputerActivateDialog({
    open,
    onOpenChange,
    hostname
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    hostname: string
}) {
    const [copied, setCopied] = useState(false);
    const [toActivate, setToActivate] = useState(false);
    const queryClient = useQueryClient();
    const { } = useQuery({
        queryKey: ['computer-activation-' + hostname],
        queryFn: async () => {
            if (toActivate) {
                const toastIdLoading = toast.loading("Activating...");

                const result = await fetch("/api/operation/test/" + hostname);
                if (result?.status === 200) {
                    toast.dismiss(toastIdLoading);
                    toast.success("Activation is successful!");
                    return true;
                }
                else {
                    toast.dismiss(toastIdLoading);
                    toast.error("Activation failed!");
                    return false;
                }
            }
            return null;
        }
    })

    const activationScript = getActivationScript();

    const handleDownloadScript = () => {
        const blob = new Blob([activationScript], { type: 'text/x-sh' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'setup.sh';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    const handleCopyScript = () => {
        navigator.clipboard.writeText(activationScript)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <><Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Initial setup for: {hostname}</DialogTitle>
                    <DialogDescription>
                        Run this script on the computer first, then click on <strong>Activate</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                        <code className="text-sm">{activationScript}</code>
                    </pre>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={handleCopyScript} variant="outline">
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" /> Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" /> Copy Script
                            </>
                        )}
                    </Button>
                    <Button onClick={handleDownloadScript} variant={"outline"}>
                        Download Script
                    </Button>
                    <Button onClick={() => {
                        setToActivate(true);
                        queryClient.invalidateQueries({ queryKey: ['computer-activation-' + hostname] });
                    } }>
                        Activate
                    </Button>
                </div>
            </DialogContent>
        </Dialog><Toaster /></>
    )
}