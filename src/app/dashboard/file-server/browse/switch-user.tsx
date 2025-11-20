import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getIsAdmin } from "@/app/actions";

export function SwitchUser({ setPath }: { setPath: (path: Array<string>) => void }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);

    useEffect(() => {
        getIsAdmin().then((x: boolean) => setIsAdmin(x));
    }, []);

    const handleSubmit = (formData: FormData) => {
        const path = formData.get("path") as string;
        if (path) setPath([path]);
    };

    if (!isAdmin) return null;

    return (
        <div className="p-4 bg-indigo-50 rounded-2xl shadow w-64">
            <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="flex justify-between items-center w-full px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
                <span>Switch User</span>
                <span>{showUserForm ? "▲" : "▼"}</span>
            </button>

            {showUserForm && (
                <form action={handleSubmit} className="flex flex-col gap-3 mt-3">
                    <label htmlFor="path" className="font-medium text-indigo-700">
                        Viewing files of user:
                    </label>

                    <Input
                        className="w-full"
                        id="path"
                        name="path"
                        placeholder="Enter username here..."
                    />

                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                    >
                        Apply
                    </button>
                </form>
            )}
        </div>
    );
}
