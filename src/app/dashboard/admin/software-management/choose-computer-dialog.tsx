"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader, Plus, Trash } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IComputer } from "@/types/computer";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function ChooseComputerDialog({
  open,
  onOpenChange,
  playbook,
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  playbook: Playbook
}) {
  const [selected, setSelected] = useState<IComputer[]>([]);
  const [search, setSearch] = useState("");

  const { data: computers, isLoading: isComputersLoading } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const res = await fetch("/api/computer");
      if (!res.ok)
        throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
      return await res.json();
    },
  });

  const handleAdd = (computer: IComputer) => {
    if (!selected.find((c) => c.hostname === computer.hostname)) {
      setSelected([...selected, computer]);
    }
  };

  const handleRemove = (computer: IComputer) => {
    setSelected(selected.filter((c) => c.hostname !== computer.hostname));
  };

  const runPlaybookOnComputersMutation = useMutation({
    mutationFn: async ({ filename, computers }: {
      filename: string,
      computers: IComputer[]
    }) => {
      const hosts = computers.map((c: IComputer) => c.hostname);

      const response = await fetch('/api/playbook/run', {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename,
          hosts
        })
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Failed to save computer: ${response.status} ${text}`);
      }
      return await response.json();
    },
    onSuccess: () => {
     alert("Job started... Click on logs for more info!");
     setSelected([]);
    }
  })

  const filteredComputers = computers?.filter((c: IComputer) =>
    c.hostname.toLowerCase().includes(search.toLowerCase())
  );

  if (!computers || isComputersLoading)
    return (
      <Alert className="w1/4">
        <Loader />
        <AlertTitle>Loading computers...</AlertTitle>
      </Alert>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Computers</DialogTitle>
        </DialogHeader>

        {/* Instructions + Search */}
        <div className="mb-2 text-sm text-muted-foreground">
          After selecting computers, click <strong>Run</strong> below to load availability.
        </div>

        <input
          type="text"
          placeholder="Search available computers..."
          className="border rounded-md px-3 py-2 w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selected Computers */}
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold">Selected:</h4>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">No computers selected yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {selected.map((computer: IComputer) => (
                <Card
                  key={computer.hostname}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  {computer.hostname}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(computer)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Run Button (Centered) */}
        <div className="flex justify-center mb-6">
          <Button onClick={() => runPlaybookOnComputersMutation.mutate(
            { filename: playbook.filename, computers: selected }
          )} className="px-6">
            Run
          </Button>
        </div>
        {/* Available Computers */}
        <div className="space-y-2 max-h-80 overflow-auto">
          <h4 className="font-semibold">Available:</h4>
          <div className="grid grid-cols-3 gap-2">
            {filteredComputers.map((computer: IComputer) => (
              <Card
                key={computer.hostname}
                className="flex items-center justify-between px-1 py-2 text-sm"
              >
                {computer.hostname}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAdd(computer)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}