'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IComputer } from "@/types/computer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function ComputerAddDialog({
  open: openProp,
  onOpenChange,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp! : internalOpen
  const setOpen = (v: boolean) => {
    if (isControlled) {
      onOpenChange?.(v)
    } else {
      setInternalOpen(v)
    }
  }

  const addComputerMutation = useMutation({
    mutationFn: async (computer: IComputer) => {
      const res = await fetch('/api/computer', {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(computer)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to save computer: ${res.status} ${text}`);
      }
      return res.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['computers']});
      setOpen(false);
    }
  })
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit computer</DialogTitle>
          <DialogDescription>Modify or remove computer</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            // prevent default immediately
            e.preventDefault();

            const form = e.target as HTMLFormElement;

            // read hostname
            const hostnameEl = form.elements.namedItem('hostname') as HTMLInputElement | null;
            const hostname = hostnameEl ? hostnameEl.value : undefined;
            if (!hostname) return;

            // read address only if changing address
            const addressEl = form.elements.namedItem('address') as HTMLInputElement | null;
            const address = addressEl ? addressEl.value : undefined;
            if (!address) return;

            const payload: IComputer = {
              address: address,
              status: 'inactive',
              hostname: hostname
            }

            addComputerMutation.mutate(payload);
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-4">
              <Label htmlFor="hostname-1">Hostname</Label>
              <Input id="hostname-1" name="hostname" />
            </div>
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label htmlFor="address-1">Address</Label>
                <Input
                  id="address-1"
                  name="address"
                />
              </div>
              <div className="grid gap-3">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="default" type="submit">
              Add computer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
