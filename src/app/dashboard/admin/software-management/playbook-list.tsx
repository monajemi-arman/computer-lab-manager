import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export const PlaybookList = () => {
    const [isVisibleChooseComputersDialog, setVisibleChooseComputersDialog] = useState(false);

    const { data: playbooks, isLoading: isPlaybooksLoading } = useQuery({
        queryKey: ["computers"],
        queryFn: async () => {
            const res = await fetch("/api/computer");
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks && playbooks
                .map((playbook) => (
                    <Card key={playbook.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{playbook.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{playbook.description}</p>
                        </CardContent>
                        <CardFooter>
                            <div className="flex items-center gap-2">
                                <Button onClick={() => setVisibleChooseComputersDialog(true)}>Run</Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
        </div>
    )
}