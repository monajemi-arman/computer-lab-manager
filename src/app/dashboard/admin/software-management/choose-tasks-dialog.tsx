import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Playbook, Task } from "@prisma/client"
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";

export function ChooseTasksDialog(
  { open, onOpenChange, playbook, setShowTaskId }: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    playbook: Playbook,
    setShowTaskId: (taskId: string) => void
  }
) {

  const { data: tasks, isPending } = useQuery({
    queryKey: [playbook.name + '-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/playbook/tasks/' + playbook.filename, { credentials: "same-origin" });
      return await response.json();
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tasks of playbook: {playbook.name}</DialogTitle>
        </DialogHeader>

        <div className="mb-2 text-sm text-muted-foreground">
          Click on a task ID to see the logs.
        </div>

        <div className="space-y-2 max-h-80 overflow-auto">
          <div className="grid grid-cols-1 gap-2">
            {!isPending && tasks && tasks.map((task: Task) => (
              <Card
                key={task.id}
                className="flex items-center justify-between px-1 py-2 text-sm"
              >
                {task.id}
                <Button
                  variant="ghost"
                  onClick={() => setShowTaskId(task.id)}
                >
                  <Eye /> Show
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}