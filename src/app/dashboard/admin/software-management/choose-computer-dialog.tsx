"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

interface Computer {
  id: number;
  name: string;
}

export default function ComputerDialog(
    open: boolean,
    onOpenChange: (open: boolean) => void
) {
  const [selected, setSelected] = useState<Computer[]>([]);
  const computers: Computer[] = [
    { id: 1, name: "Office-PC-01" },
    { id: 2, name: "Lab-Desktop-03" },
    { id: 3, name: "NVIDIA-Rig" },
    { id: 4, name: "MacBook-Pro" },
  ];

  const handleAdd = (computer: Computer) => {
    if (!selected.find((c) => c.id === computer.id)) {
      setSelected([...selected, computer]);
    }
  };

  const handleRemove = (id: number) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Computers</DialogTitle>
        </DialogHeader>

        {/* Selected Computers */}
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold">Selected:</h4>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">No computers added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((comp) => (
                <Card
                  key={comp.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  {comp.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(comp.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Computers */}
        <div className="space-y-2">
          <h4 className="font-semibold">Available:</h4>
          {computers.map((comp) => (
            <Card
              key={comp.id}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              {comp.name}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAdd(comp)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
