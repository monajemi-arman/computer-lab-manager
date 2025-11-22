#!/usr/bin/env bash

# Get overall disk stats for root filesystem in bytes
disk_info=$(df -B1 --output=size,used,avail / | tail -1)
total_bytes=$(echo "$disk_info" | awk '{print $1}')
used_bytes=$(echo "$disk_info" | awk '{print $2}')
free_bytes=$(echo "$disk_info" | awk '{print $3}')

# Convert bytes → human-readable
hr_total=$(numfmt --to=iec "$total_bytes")
hr_used=$(numfmt --to=iec "$used_bytes")
hr_free=$(numfmt --to=iec "$free_bytes")

# Calculate percentage
usage_pct=$(awk -v u="$used_bytes" -v t="$total_bytes" 'BEGIN { printf("%.2f", (u/t)*100) }')

# Build per-user usage JSON array
user_json="["

for dir in /home/*; do
    if [ -d "$dir" ]; then
        user=$(basename "$dir")

        # Get usage in bytes
        usage_bytes=$(sudo du -sb "$dir" 2>/dev/null | awk '{print $1}')
        usage_hr=$(numfmt --to=iec "$usage_bytes")

        # Calculate percentage of total disk
        pct=$(awk -v u="$usage_bytes" -v t="$total_bytes" 'BEGIN { 
            if (t==0) printf("0");
            else printf("%.2f", (u/t)*100);
        }')

        user_json="${user_json}{\"user\":\"$user\", \"used_bytes\":$usage_bytes, \"used\":\"$usage_hr\", \"percent_of_total\":$pct},"
    fi
done

# Remove trailing comma
user_json=$(echo "$user_json" | sed 's/,$//')
user_json="${user_json}]"

# Output final JSON
cat <<EOF
{
  "disk_summary": {
    "total_bytes": $total_bytes,
    "total": "$hr_total",
    "used_bytes": $used_bytes,
    "used": "$hr_used",
    "free_bytes": $free_bytes,
    "free": "$hr_free",
    "percent_used": $usage_pct
  },
  "home_usage": $user_json
}
EOF
