import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ShowTaskDialog({
    open,
    onOpenChange,
    taskId
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    taskId: string
}) {
    const [messages, setMessages] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll whenever messages update
    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Open WebSocket when dialog opens
    useEffect(() => {
        if (!open) return;

        wsRef.current = new WebSocket("ws://localhost:8000/ws/" + taskId);

        wsRef.current.onmessage = (event) => {
            setMessages((prev) => prev + event.data + "");
        };

        wsRef.current.onerror = () => {
            setMessages((prev) => prev + "\n[WebSocket error]");
        };

        wsRef.current.onclose = () => {
            setMessages((prev) => prev + "\n[WebSocket closed]");
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3/5 w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Output of task with ID: <p className="text-sm">{taskId}</p></DialogTitle>
                </DialogHeader>

                <div
                    ref={scrollRef}
                    className="mt-4 h-96 overflow-auto rounded-md bg-black p-4 font-mono text-sm text-green-400 whitespace-pre-wrap"
                >
                    {messages || "Waiting for output..."}
                </div>
            </DialogContent>
        </Dialog>
    );
}
