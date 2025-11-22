import { useQuery } from "@tanstack/react-query";
import { StorageStatisticsCard } from "./storage-statistics-card";
import { IComputer } from "@/types/computer";

export function StorageStatisticsView() {
    const { data: hostnames, isPending } = useQuery({
        queryKey: ["storageHostnames"],
        queryFn: async () => {
            const res = await fetch(`/api/computer`, {
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            return result.map((c: IComputer) => c.hostname);
        }
    });

    if (isPending) return <div>Loading...</div>;
    if (!hostnames || hostnames.length === 0) return <div>No computers found</div>;

    return (
        <div className="flex flex-col">
            <h1 className="p-4 text-2xl"><strong>Storage Statistics</strong></h1>
        <div className="flex flex-wrap gap-4 p-4 justify-start items-start">
            {hostnames.map((hostname: string) => (
                <StorageStatisticsCard key={hostname} hostname={hostname} />
            ))}
        </div>
        </div>
    )
}