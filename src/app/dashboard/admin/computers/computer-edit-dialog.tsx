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

export function ComputerEditDialog({
  open: openProp,
  onOpenChange,
  computer,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  computer?: IComputer
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

  const editComputerMutation = useMutation({
    mutationFn: async (computer: IComputer) => {
      const res = await fetch('/api/computer/' + computer.hostname, {
        method: "PUT",
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
      setOpen(false);
      queryClient.invalidateQueries({queryKey: ['computers']});
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

            // read status element safely (fallback to checking the named element)
            const statusEl = form.elements.namedItem('status') as HTMLSelectElement | null;
            const statusValue = statusEl ? statusEl.value : undefined;
            if (!statusValue) return;

            const status = statusValue === 'active' ? 'active' : 'inactive';

            // read hostname
            const hostnameEl = form.elements.namedItem('hostname') as HTMLInputElement | null;
            const hostname = hostnameEl ? hostnameEl.value : undefined;
            if (!hostname) return;

            // read address only if changing address
            const addressEl = form.elements.namedItem('address') as HTMLInputElement | null;
            const address = addressEl ? addressEl.value : undefined;
            if (!address) return;

            const payload: IComputer = {
              hostname,
              status,
              address
            }

            editComputerMutation.mutate(payload);
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-4">
              <Label htmlFor="hostname-1">Hostname</Label>
              <Input id="hostname-1" name="hostname" defaultValue={computer?.hostname} />
            </div>
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label htmlFor="address-1">Address</Label>
                <Input
                  id="address-1"
                  name="address"
                  defaultValue={computer?.address}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status-1">Status</Label>
                <div className="relative">
                  <select
                    id="status-1"
                    name="status"
                    defaultValue={computer?.status}
                    aria-label="Computer status"
                    className="w-full appearance-none rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
