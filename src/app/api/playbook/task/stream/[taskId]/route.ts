import { NextRequest } from "next/server";
import WebSocket from "ws";

const ANSIBLE_API = process.env.ANSIBLE_API ?? 'http://localhost:8000';
const ANSIBLE_WS = ANSIBLE_API.replace('http', 'ws');

export const GET = async (req: NextRequest, { params }: { params: Promise<{ taskId: string }>}) => {
  const { taskId } = await params;
  if (!taskId) {
    return new Response("Missing taskId", { status: 400 });
  }

  // Create a TransformStream for streaming SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Helper to send SSE
  const sendEvent = async (data: string) => {
    await writer.write(new TextEncoder().encode(`data: ${data}\n\n`));
  };

  // Connect to backend WebSocket server
  const ws = new WebSocket(`${ANSIBLE_WS}/ws/${taskId}`);

  ws.on("open", () => sendEvent("[WS connected]"));
  ws.on("message", (data: { toString: () => string; }) => sendEvent(data.toString()));
  ws.on("error", (err: { message: unknown; }) => sendEvent(`[WS error] ${err.message}`));
  ws.on("close", () => {
    sendEvent("[WS closed]");
    writer.close();
  });

  // Close WS if client disconnects
  const closeController = new AbortController();
  closeController.signal.addEventListener("abort", () => ws.close());

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
    status: 200,
  });
};
