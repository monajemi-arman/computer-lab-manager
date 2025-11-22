import PieChart from "@/components/pie-chart";
import { useQuery } from "@tanstack/react-query";

export function StorageStatisticsView() {
    const { data: storageStats, isPending } = useQuery({
        queryKey: ["storageStats"],
        queryFn: async () => {
            const response = await fetch("/api/operation/script/storage-stats/localhost", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            return response.json();
        }
    })

    return (
        <>
            {isPending && <div>Loading...</div>}
            {storageStats && <PieChart title="localhost" chartData={transformStorageStats(storageStats)} />}
        </>
    )
}

export function transformStorageStats(storageStats: StorageStats) {
    const diskSummary = storageStats.disk_summary;
    const homeUsage = storageStats.home_usage;

    // Calculate other used space (total used - sum of home usage)
    const homeUsageTotalBytes = homeUsage.reduce((sum, user) => sum + user.used_bytes, 0);
    const otherUsedBytes = diskSummary.used_bytes - homeUsageTotalBytes;

    // Create labels and data for the complete pie chart
    const labels = [
        'Free Space',
        ...homeUsage.filter(user => user.used_bytes > 0).map(user => `${user.user} (Home)`),
        ...(otherUsedBytes > 0 ? ['Other Used Space'] : [])
    ];

    const data = [
        diskSummary.free_bytes,
        ...homeUsage.filter(user => user.used_bytes > 0).map(user => user.used_bytes),
        ...(otherUsedBytes > 0 ? [otherUsedBytes] : [])
    ];

    // Color palette - dynamically assigned based on number of segments
    const colorPalette = [
        "#50AF95",  // Free space - green
        "#2a71d0",  // User 1 - blue
        "#f3ba2f",  // User 2 - yellow
        "#ff6384",  // User 3 - pink
        "#36a2eb",  // Other used - light blue
        "#ffce56",  // Additional colors if needed
        "#4bc0c0",
        "#9966ff",
        "#ff9f40"
    ];

    const backgroundColor = data.map((_, index) =>
        colorPalette[index % colorPalette.length]
    );

    return {
        labels: labels,
        datasets: [
            {
                label: "Disk Space Allocation",
                data: data,
                backgroundColor: backgroundColor,
                borderColor: "black",
                borderWidth: 2
            }
        ]
    };
}
