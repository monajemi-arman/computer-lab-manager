import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, File as FileIcon } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { SwitchUser } from "./switch-user"
import { getSession } from "@/app/actions"
import { Session } from "next-auth"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { IFile } from "@/types/file"

interface FileEntry {
    name: string
    type: "file" | "folder"
}

export function FileBrowser() {
    const queryClient = useQueryClient();
    const [path, setPath] = useState<Array<string> | null>(null);

    useEffect(() => {
        getSession().then((session: Session | null) => {
            if (session && session.user?.username)
                setPath([session.user.username]);
        })
    }, []);

    const onOpen = (name: string) => {
        if (!path) return;
        setPath(name.split('/'));
    }

    const onDelete = async (name: string) => {
        if (!path) return;
        const fullPath = [...path, name].join('/');
        const res = await fetch(`/api/file/${fullPath}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            queryClient.invalidateQueries({queryKey: ['file-entries-' + path?.join('/')]});
        } else {
            alert('Failed to delete file');
        }
    }

    const onDownload = (name: string) => {
        if (!path) return;
        const fullPath = [...path, name].join('/');
        window.location.href = `/api/file/${fullPath}`;
    }

    const {data: entries, isPending} = useQuery({
        queryKey: ['file-entries-' + path?.join('/')],
        queryFn: async () => {
            if (!path) return [];
            const res = await fetch(`/api/file/${path.join('/')}`);
            if (!res.ok) throw new Error('Failed to fetch file entries');
            const files: IFile[] = await res.json();

            const entries: FileEntry[] = files.map(file => ({
                name: file.filename.split('/').pop() || file.filename,
                type: 'file'
            }));

            return entries;
        }
    })

    return (
        <div className="w-full min-h-screen">

            {/* NAV BAR */}
            <div className="flex flex-row">
                <div className="scale-90">
                    <SwitchUser setPath={setPath} />
                </div>
                <div id="nav-bar" className="w-auto border-b p-4">
                    <Breadcrumb>
                        <BreadcrumbList>

                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    /
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {path && path.map((p, i) => (
                                <Fragment key={i}>
                                    <BreadcrumbSeparator key={`sep-${i}`} />

                                    <BreadcrumbItem key={`item-${i}`}>
                                        <BreadcrumbLink
                                            onClick={() =>
                                                onOpen?.(
                                                    path.slice(0, i + 1).join("/")
                                                )
                                            }
                                        >
                                            {p}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Fragment>
                            ))}

                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            {/* Files / Folders */}
            <div id="cards" className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isPending && (
                    <div>Loading...</div>
                )}
                {!entries || entries.length === 0 ? (
                    <div>No files.</div>
                ) : null}
                {!isPending && entries && entries.map((entry, index) => (
                    <Card key={index} className="rounded-2xl shadow h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {entry.type === "folder" ?
                                    <Folder className="size-5" /> :
                                    <FileIcon className="size-5" />}
                                {entry.name}
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {entry.type === "folder" ? "Folder" : "File"}
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            {entry.type === "folder" ? (
                                <>
                                    <Button onClick={() => onOpen?.(entry.name)}>Open</Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => onDelete?.(entry.name)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => onDownload?.(entry.name)}>
                                        Download
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => onDelete?.(entry.name)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
