import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CirclePlus, Loader } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { PlaybookDeleteAlert } from "./playbook-delete-alert"
import { Input } from "@/components/ui/input"
import { PlaybookAddDialog } from "./playbook-add-dialog"

export const PlaybookList = () => {
    const queryClient = useQueryClient();
    const [isVisibleChooseComputersDialog, setVisibleChooseComputersDialog] = useState(false);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [filename, setFilename] = useState<string>();
    const [search, setSearch] = useState('');

    const { data: playbooks, isLoading: isPlaybooksLoading } = useQuery({
        queryKey: ["playbooks"],
        queryFn: async () => {
            const res = await fetch("/api/playbook");
            if (!res.ok) throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
            return await res.json();
        }
    });
    const { data: computers, isLoading: isComputersLoading } = useQuery({
        queryKey: ["computers"],
        queryFn: async () => {
            const res = await fetch("/api/computer");
            if (!res.ok) throw new Error(`Failed to fetch computers: ${res.status} ${res.statusText}`);
            return await res.json();
        }
    });

    if (isPlaybooksLoading || !playbooks) {
        return (
            <Alert className="w1/4">
                <Loader />
                <AlertTitle>Loading playbooks...</AlertTitle>
            </Alert>
        )
    }

    const filteredPlaybooks = playbooks.filter((playbook: Playbook) => {
        if (!search || search.length === 0) return true;
        return playbook.name.toLowerCase().startsWith(search);
        });

    return (
        <>
            <div className="p-2 space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Playbooks</h2>
                    <p className="text-sm text-muted-foreground">
                        Ansible playbooks run various tasks on the systems.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-auto"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Add new playbook
                    </Button>

                    <Input
                        type="text"
                        placeholder="Search..."
                        className="max-w-xs"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaybooks && filteredPlaybooks
                    .map((playbook: Playbook) => (
                        <Card key={playbook.name} className="w-1/2 cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium truncate">{playbook.name}</h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{playbook.description}</p>
                            </CardContent>
                            <CardFooter>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setVisibleChooseComputersDialog(true)}>Run</Button>
                                    <Button onClick={() => {
                                        setFilename(playbook.filename);
                                        setDeleteAlertOpen(true);
                                    }}>Delete</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                <PlaybookAddDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
                <PlaybookDeleteAlert open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen} filename={filename} />
            </div>
        </>
    )
}