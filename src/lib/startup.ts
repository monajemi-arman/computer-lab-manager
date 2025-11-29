import { backgroundTasks } from "./systems-orchestrator/background-tasks";

export const runtime = "nodejs";

declare global {
    var __startupCounter: number | undefined;
}

export function runStartupTasks() {
  let counter = global.__startupCounter || (global.__startupCounter = 0);
  if (counter && counter > 0) return;
  counter = global.__startupCounter = counter + 1;
  backgroundTasks.startTasks().catch(console.error);
}
