// Startup tasks

import { backgroundTasks } from "./lib/systems-orchestrator/background-tasks";

export function register() {
  backgroundTasks.startTasks().catch(console.error)
}