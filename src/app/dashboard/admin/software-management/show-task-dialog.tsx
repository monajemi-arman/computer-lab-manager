import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SunMoon } from "lucide-react";

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
    const [dark, setDark] = useState(true);

    // Auto-scroll whenever messages update
    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // WS in api gives event source here
    useEffect(() => {
        if (!open) return;

        const evtSource = new EventSource(`/api/playbook/task/stream/${taskId}`);

        evtSource.onmessage = (event) => {
            setMessages((prev) => prev + event.data + "\n");
        };

        evtSource.onerror = () => {
            setMessages((prev) => prev + "[SSE error]\n");
            evtSource.close();
        };

        return () => {
            evtSource.close();
        };
    }, [open, taskId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3/5 w-[90vw]">
                <DialogHeader>
                    <DialogTitle>
                        <button
                            onClick={() => setDark(!dark)}
                            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
                        >
                            <SunMoon />
                        </button>
                        Output of task with ID: <p className="text-sm">{taskId}</p></DialogTitle>
                </DialogHeader>
                <div
                    id="task-log-div"
                    ref={scrollRef}
                    className={`mt-4 h-96 overflow-auto rounded-md p-4 font-mono text-sm whitespace-pre-wrap
                    ${dark ? "bg-gray-900 text-green-300" : "bg-white text-green-600"}`}
                >
                    {messages || "Waiting for output..."}
                </div>
            </DialogContent>
        </Dialog>
    );
}
