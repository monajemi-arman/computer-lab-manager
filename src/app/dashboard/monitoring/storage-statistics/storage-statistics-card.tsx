import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Loader } from "lucide-react";

export function StorageStatisticsCard({ hostname }: { hostname: string }) {
    const { data: storageStats, isPending } = useQuery({
        queryKey: ["storageStats"],
        queryFn: async () => {
            const res = await fetch(`/api/operation/script/storage-stats/${hostname}`, {
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
            });
            return res.json();
        }
    });

    if (isPending) return (
        <Alert className="w1/4">
            <Loader />
            <AlertTitle>Loading statistics...</AlertTitle>
        </Alert>
    );
    if (!storageStats) return <div>No data</div>;

    const { disk_summary, home_usage } = storageStats;

    return (
        <Card className="w-64 shadow-sm p-2">
            <CardHeader className="py-2">
                <CardTitle className="text-base font-semibold">
                    {hostname}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

                {/* Disk Summary */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>{disk_summary.used} used</span>
                        <span>{disk_summary.percent_used}%</span>
                    </div>
                    <Progress value={disk_summary.percent_used} className="h-1.5" />

                    <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                        <span>Total: {disk_summary.total}</span>
                        <span>Free: {disk_summary.free}</span>
                    </div>
                </div>

                {/* Home Usage (top 5 only to keep compact) */}
                <div className="space-y-2 mb-2">
                    {home_usage.sort(sortHomeUsage).slice(0, 5).map((u: HomeUsageEntry) => (
                        <div key={u.user} className="text-xs">
                            <div className="flex justify-between">
                                <span>{u.user}</span>
                                <span>{u.used}</span>
                            </div>
                            <Progress value={u.percent_of_total} className="h-1 mt-0.5" />
                        </div>
                    ))}

                    {home_usage.length > 5 && (
                        <p className="text-[10px] text-muted-foreground">
                            + {home_usage.length - 5} more users
                        </p>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}

interface HomeUsageEntry {
    user: string;
    used: string;
    used_bytes: number;
    percent_of_total: number;
}

function sortHomeUsage(a: HomeUsageEntry, b: HomeUsageEntry) {
    return b.used_bytes - a.used_bytes;
}