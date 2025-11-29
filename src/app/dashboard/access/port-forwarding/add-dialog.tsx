import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddPortMapDialogProps {
  hostname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPortMapDialog({ hostname, open, onOpenChange }: AddPortMapDialogProps) {
  const queryClient = useQueryClient();
  const [localPort, setLocalPort] = useState<number | ''>('');
  const [remotePort, setRemotePort] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!localPort || !remotePort) {
      toast.error("Both local and remote ports are required.");
      return false;
    }
    if (localPort < 1 || localPort > 65535 || remotePort < 1 || remotePort > 65535) {
      toast.error("Ports must be between 1 and 65535.");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/operation/port-forward/${encodeURIComponent(hostname)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localPort, remotePort }),
      });
      const text = await res.text();
      if (!res.ok) {
        toast.error(text || res.statusText);
        return;
      }
      toast.success("Port mapping created successfully.");
      onOpenChange(false);
      setLocalPort('');
      setRemotePort('');
      queryClient.invalidateQueries({ queryKey: ["portmaps-" + hostname] });
    } catch (err: unknown) {
      console.error(err);
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add port mapping</DialogTitle>
          <DialogDescription>
            Create a new port forward for <span className="font-medium">{hostname}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label className="px-1 py-2 font-bold" htmlFor="localPort">Local port</Label>
            <Input
              id="localPort"
              type="number"
              placeholder="e.g. 3000"
              value={localPort}
              onChange={(e) => setLocalPort(Number(e.target.value))}
            />
          </div>

          <div>
            <Label className="px-1 py-2 font-bold" htmlFor="remotePort">Remote port</Label>
            <Input
              id="remotePort"
              type="number"
              placeholder="e.g. 80"
              value={remotePort}
              onChange={(e) => setRemotePort(Number(e.target.value))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="button" onClick={onSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
