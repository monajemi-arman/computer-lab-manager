interface StorageStats {
  disk_summary: {
    total_bytes: number;
    total: string;
    used_bytes: number;
    used: string;
    free_bytes: number;
    free: string;
    percent_used: number;
  };
  home_usage: Array<{
    user: string;
    used_bytes: number;
    used: string;
    percent_of_total: number;
  }>;
}