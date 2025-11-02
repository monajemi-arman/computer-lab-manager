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
import { IUser } from "@/types/user";
import { useMutation } from "@tanstack/react-query";

export function UserEditDialog({
  open: openProp,
  onOpenChange,
  user,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  user?: IUser
}) {
  const [changePassword, setChangePassword] = useState(false)

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

  const editUserMutation = useMutation({
    mutationFn: async (user: IUser) => {
      const res = await fetch('/api/user/' + user.username, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to save user: ${res.status} ${text}`);
      }
      return res.json().catch(() => null);
    },
    onSuccess: () => {
      setOpen(false);
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>Modify or remove user</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            // prevent default immediately
            e.preventDefault();

            const form = e.target as HTMLFormElement;

            // read role element safely (fallback to checking the named element)
            const roleEl = form.elements.namedItem('role') as HTMLSelectElement | null;
            const roleValue = roleEl ? roleEl.value : undefined;
            if (!roleValue) return;

            const role = roleValue === 'admin' ? 'admin' : 'user';

            // read username
            const usernameEl = form.elements.namedItem('username') as HTMLInputElement | null;
            const username = usernameEl ? usernameEl.value : undefined;
            if (!username) return;

            // read password only if changing password
            const passwordEl = form.elements.namedItem('password') as HTMLInputElement | null;
            const password = changePassword && passwordEl ? passwordEl.value : undefined;

            const payload: IUser = {
              username: username,
              role: role,
              ...(password ? { password } : {})
            }

            editUserMutation.mutate(payload);
          }}
        >
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <input
                id="change-password"
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="change-password">Change Password</Label>
            </div>
            <div className="grid gap-4">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" disabled={true} defaultValue={user?.username} />
            </div>
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label htmlFor="password-1">Password</Label>
                <Input
                  id="password-1"
                  name="password"
                  disabled={!changePassword}
                  defaultValue=""
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="role-1">Role</Label>
                <div className="relative">
                  <select
                    id="role-1"
                    name="role"
                    defaultValue={user?.role}
                    aria-label="User role"
                    className="w-full appearance-none rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
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
